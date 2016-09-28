/*
 *    Licensed Materials - Property of IBM
 *    5725-I43 (C) Copyright IBM Corp. 2015, 2016. All Rights Reserved.
 *    US Government Users Restricted Rights - Use, duplication or
 *    disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

package com.ibm.inspector.inspectors;

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

@Api(value = "Inspectors Resource")
@Path("/inspectors")
public class InspectorsResource {
	/*
	 * For more info on JAX-RS see
	 * https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html
	 */

	// Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(InspectorsResource.class.getName());

	private static JSONArray _inspectors = null;
	
	// Inject the MFP configuration API:
	@Context
	ConfigurationAPI configApi;

	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/Inspectors/inspectors"
	 */

	@ApiOperation(value = "Returns the list of inspectors", notes = "The list of inspectors is managed by the dispatch agent")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "Hello message returned") })
	@GET
	@Produces("application/json")
//	@OAuthSecurity(scope="accessRestricted")
	public Response getInspectors(){
		try {
			logger.info("Retrieving inspector list");
			InputStream is = this.getClass().getResourceAsStream("Inspectors.json");
			InspectorsResource._inspectors = (JSONArray)JSON.parse(is);
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load Inspectors.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return Response.ok(InspectorsResource._inspectors).build();
	}	
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response createInspector(JSONObject Inspector){
		if (Inspector.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Inspector is required.\"}").build();
		}
		
		Response response = this._loadInspectors();
		if (response != null){
			return response;
		}
		
		if (Inspector.get("id") != null){
			Long id = (Long)Inspector.get("id");
			int index = this._findInspectorIndex(id.longValue());
			if (index > -1){
				return Response.status(Status.CONFLICT).entity("{\"error\": \"An Inspector with id" + id + " already exists\"}").build();
			}
		} else {
			Inspector.put("id", Long.valueOf(System.currentTimeMillis()));
		}
		InspectorsResource._inspectors.add(Inspector);
		
		return Response.ok(Inspector).build();
	}
	
	@PUT
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateInspectors(String InspectorsStr){
		JSONArray Inspectors = null;
		try {
			Inspectors = (JSONArray)JSON.parse(InspectorsStr);
		} catch (IOException e){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Inspectors must be a JSON array.\"}").build();
		}
		if (Inspectors == null || Inspectors.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Inspectors are required.\"}").build();
		}
		
		Response response = this._loadInspectors();
		if (response != null){
			return response;
		}
		InspectorsResource._inspectors = Inspectors;
		
		return Response.ok(Inspectors).build();
	}	
	
	
	@PUT
	@Path("/{InspectorId}")
	@Consumes("application/json")	
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateInspector(JSONObject Inspector, @PathParam("InspectorId") long id){
		if (Inspector == null || id == 0){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Both Inspector and id are required.\"}").build();
		}
		
		Response response = this._loadInspectors();
		if (response != null){
			return response;
		}
		
		Inspector.put("id", id);
		int index = this._findInspectorIndex(id);
		if (index > -1){
			InspectorsResource._inspectors.set(index, Inspector);			
		} else {
			return Response.status(Response.Status.NOT_FOUND).entity("{\"error\": \"Resource with id " + id + " not found.\"}").build();
		}

		return Response.ok(Inspector).build();
	}
	
	@POST
	@Path("/{InspectorId}/tests")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response createMedicalTest(JSONObject medicalTest, @PathParam("InspectorId") long id){
		if (medicalTest.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medical test information is required.\"}").build();
		}
		
		Response response = this._loadInspectors();
		if (response != null){
			return response;
		}
		
		int InspectorIndex = this._findInspectorIndex(id);
		if (InspectorIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An Inspector with id " + id + "could not be found.\"}").build();
		}
		JSONObject Inspector = (JSONObject)InspectorsResource._inspectors.get(InspectorIndex);
		medicalTest.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray tests = (JSONArray)Inspector.get("tests");
		if (tests == null){
			tests = new JSONArray();
		}
		tests.add(medicalTest);
		
		return Response.ok(medicalTest).build();
	}	

	@POST
	@Path("/{InspectorId}/medications")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response addMedication(JSONObject medication, @PathParam("InspectorId") long id){
		if (medication.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medication information is required.\"}").build();
		}
		
		Response response = this._loadInspectors();
		if (response != null){
			return response;
		}
		
		int InspectorIndex = this._findInspectorIndex(id);
		if (InspectorIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An Inspector with id " + id + "could not be found.\"}").build();
		}
		JSONObject Inspector = (JSONObject)InspectorsResource._inspectors.get(InspectorIndex);
		medication.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray medications = (JSONArray)Inspector.get("medications");
		if (medications == null){
			medications = new JSONArray();
		}
		medications.add(medication);
		
		return Response.ok(medication).build();
	}	
	
	
	private Response _loadInspectors() {
		try {
			if (InspectorsResource._inspectors == null){
				logger.info("Loading Inspector list from file");
				InputStream is = this.getClass().getResourceAsStream("Inspectors.json");
				InspectorsResource._inspectors = (JSONArray)JSON.parse(is);
			}
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load Inspectors.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return null;
	}
	
	private int _findInspectorIndex(long id){
		for (int i=0; i< InspectorsResource._inspectors.size(); i++){
			if (Long.valueOf(id).equals(((JSONObject)InspectorsResource._inspectors.get(i)).get("id"))){
				return i;
			}
		}
		return -1;
	}
	
}
