/*
 *    Licensed Materials - Property of IBM
 *    5725-I43 (C) Copyright IBM Corp. 2015, 2016. All Rights Reserved.
 *    US Government Users Restricted Rights - Use, duplication or
 *    disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

package com.ibm.inspector.inspections;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.mfp.adapter.api.ConfigurationAPI;
import com.ibm.mfp.adapter.api.OAuthSecurity;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@Api(value = "Inspections Resource")
@Path("/inspections")
public class InspectionsResource {
	/*
	 * For more info on JAX-RS see
	 * https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html
	 */

	static private JSONArray _inspections = null;
	
	// Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(InspectionsResource.class.getName());

	// Inject the MFP configuration API:
	@Context
	ConfigurationAPI configApi;

	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/Inspections/resource"
	 */

	@ApiOperation(value = "Returns the list of inspections", notes = "The list of inspections is managed by the dispatch agent")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "Hello message returned") })
	@GET
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response getInspections(){
		try {
			logger.info("Retrieving inspection list");
			InputStream is = this.getClass().getResourceAsStream("Inspections.json");
			InspectionsResource._inspections = (JSONArray)JSON.parse(is);
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load Appointments.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return Response.ok(InspectionsResource._inspections).build();
	}	
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response createAppointment(JSONObject appointment){
		if (appointment.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Appointment is required.\"}").build();
		}
		
		Response response = this._loadAppointments();
		if (response != null){
			return response;
		}
		
		if (appointment.get("id") != null){
			Long id = (Long)appointment.get("id");
			int index = this._findAppointmentIndex(id.longValue());
			if (index > -1){
				return Response.status(Status.CONFLICT).entity("{\"error\": \"An appointment with id" + id + " already exists\"}").build();
			}
		} else {
			appointment.put("id", Long.valueOf(System.currentTimeMillis()));
		}
		InspectionsResource._inspections.add(appointment);
		
		return Response.ok(appointment).build();
	}
	
	@PUT
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateAppointments(String appointmentsStr){
		JSONArray appointments = null;
		try {
			appointments = (JSONArray)JSON.parse(appointmentsStr);
		} catch (IOException e){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Appointments must be a JSON array.\"}").build();
		}
		if (appointments == null || appointments.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Appointments are required.\"}").build();
		}
		
		Response response = this._loadAppointments();
		if (response != null){
			return response;
		}
		InspectionsResource._inspections = appointments;
		
		return Response.ok(appointments).build();
	}	
	
	
	@PUT
	@Path("/{appointmentId}")
	@Consumes("application/json")	
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateAppointment(JSONObject appointment, @PathParam("appointmentId") long id){
		if (appointment == null || id == 0){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Both appointment and id are required.\"}").build();
		}
		
		Response response = this._loadAppointments();
		if (response != null){
			return response;
		}
		
		appointment.put("id", id);
		int index = this._findAppointmentIndex(id);
		if (index > -1){
			InspectionsResource._inspections.set(index, appointment);			
		} else {
			return Response.status(Response.Status.NOT_FOUND).entity("{\"error\": \"Resource with id " + id + " not found.\"}").build();
		}

		return Response.ok(appointment).build();
	}
	
	@POST
	@Path("/{appointmentId}/tests")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response createMedicalTest(JSONObject medicalTest, @PathParam("appointmentId") long id){
		if (medicalTest.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medical test information is required.\"}").build();
		}
		
		Response response = this._loadAppointments();
		if (response != null){
			return response;
		}
		
		int appointmentIndex = this._findAppointmentIndex(id);
		if (appointmentIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An appointment with id " + id + "could not be found.\"}").build();
		}
		JSONObject appointment = (JSONObject)InspectionsResource._inspections.get(appointmentIndex);
		medicalTest.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray tests = (JSONArray)appointment.get("tests");
		if (tests == null){
			tests = new JSONArray();
		}
		tests.add(medicalTest);
		
		return Response.ok(medicalTest).build();
	}	

	@POST
	@Path("/{appointmentId}/medications")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response addMedication(JSONObject medication, @PathParam("appointmentId") long id){
		if (medication.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medication information is required.\"}").build();
		}
		
		Response response = this._loadAppointments();
		if (response != null){
			return response;
		}
		
		int appointmentIndex = this._findAppointmentIndex(id);
		if (appointmentIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An appointment with id " + id + "could not be found.\"}").build();
		}
		JSONObject appointment = (JSONObject)InspectionsResource._inspections.get(appointmentIndex);
		medication.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray medications = (JSONArray)appointment.get("medications");
		if (medications == null){
			medications = new JSONArray();
		}
		medications.add(medication);
		
		return Response.ok(medication).build();
	}	
	
	
	private Response _loadAppointments() {
		try {
			if (InspectionsResource._inspections == null){
				logger.info("Loading appointment list from file");
				InputStream is = this.getClass().getResourceAsStream("Appointments.json");
				InspectionsResource._inspections = (JSONArray)JSON.parse(is);
			}
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load Appointments.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return null;
	}
	
	private int _findAppointmentIndex(long id){
		for (int i=0; i< InspectionsResource._inspections.size(); i++){
			if (Long.valueOf(id).equals(((JSONObject)InspectionsResource._inspections.get(i)).get("id"))){
				return i;
			}
		}
		return -1;
	}
			
	
//	/*
//	 * Path for method:
//	 * "<server address>/mfp/api/adapters/Inspections/resource/greet?name={name}"
//	 */
//
//	@ApiOperation(value = "Query Parameter Example", notes = "Example of passing query parameters to a resource. Returns a greeting containing the name that was passed in the query parameter.")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "Greeting message returned") })
//	@GET
//	@Produces(MediaType.TEXT_PLAIN)
//	@Path("/greet")
//	public String helloUser(
//			@ApiParam(value = "Name of the person to greet", required = true) @QueryParam("name") String name) {
//		return "Hello " + name + "!";
//	}
//
//	/*
//	 * Path for method:
//	 * "<server address>/mfp/api/adapters/Inspections/resource/{path}/"
//	 */
//
//	@ApiOperation(value = "Multiple Parameter Types Example", notes = "Example of passing parameters using 3 different methods: path parameters, headers, and form parameters. A JSON object containing all the received parameters is returned.")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "A JSON object containing all the received parameters returned.") })
//	@POST
//	@Produces(MediaType.APPLICATION_JSON)
//	@Path("/{path}")
//	public Map<String, String> enterInfo(
//			@ApiParam(value = "The value to be passed as a path parameter", required = true) @PathParam("path") String path,
//			@ApiParam(value = "The value to be passed as a header", required = true) @HeaderParam("Header") String header,
//			@ApiParam(value = "The value to be passed as a form parameter", required = true) @FormParam("form") String form) {
//		Map<String, String> result = new HashMap<String, String>();
//
//		result.put("path", path);
//		result.put("header", header);
//		result.put("form", form);
//
//		return result;
//	}
//
//	/*
//	 * Path for method:
//	 * "<server address>/mfp/api/adapters/Inspections/resource/prop"
//	 */
//
//	@ApiOperation(value = "Configuration Example", notes = "Example usage of the configuration API. A property name is read from the query parameter, and the value corresponding to that property name is returned.")
//	@ApiResponses(value = {
//			@ApiResponse(code = 200, message = "Property value returned."),
//			@ApiResponse(code = 404, message = "Property value not found.") })
//	@GET
//	@Path("/prop")
//	@Produces(MediaType.TEXT_PLAIN)
//	public Response getPropertyValue(
//			@ApiParam(value = "The name of the property to lookup", required = true) @QueryParam("propertyName") String propertyName) {
//		// Get the value of the property:
//		String value = configApi.getPropertyValue(propertyName);
//		if (value != null) {
//			// return the value:
//			return Response
//					.ok("The value of " + propertyName + " is: " + value)
//					.build();
//		} else {
//			return Response.status(Status.NOT_FOUND)
//					.entity("No value for " + propertyName + ".").build();
//		}
//
//	}
//
//	/*
//	 * Path for method:
//	 * "<server address>/mfp/api/adapters/Inspections/resource/unprotected"
//	 */
//
//	@ApiOperation(value = "Unprotected Resource", notes = "Example of an unprotected resource, this resource is accessible without a valid token.")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "A constant string is returned") })
//	@GET
//	@Path("/unprotected")
//	@Produces(MediaType.TEXT_PLAIN)
//	@OAuthSecurity(enabled = false)
//	public String unprotected() {
//		return "Hello from unprotected resource!";
//	}
//
//	/*
//	 * Path for method:
//	 * "<server address>/mfp/api/adapters/Inspections/resource/protected"
//	 */
//
//	@ApiOperation(value = "Custom Scope Protection", notes = "Example of a resource that is protected by a custom scope. To access this resource a valid token for the scope 'myCustomScope' must be acquired.")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "A constant string is returned") })
//	@GET
//	@Path("/protected")
//	@Produces(MediaType.TEXT_PLAIN)
//	@OAuthSecurity(scope = "myCustomScope")
//	public String customScopeProtected() {
//		return "Hello from a resource protected by a custom scope!";
//	}




}
