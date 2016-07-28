/*
 *    Licensed Materials - Property of IBM
 *    5725-I43 (C) Copyright IBM Corp. 2015, 2016. All Rights Reserved.
 *    US Government Users Restricted Rights - Use, duplication or
 *    disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

package com.ibm.inspector.checklists;

import com.ibm.inspector.checklists.CloudantClientMgr;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.List;

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

import com.cloudant.client.api.Database;
import com.cloudant.client.org.lightcouch.NoDocumentException;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

import okhttp3.OkHttpClient;

@Api(value = "Checklists Resource")
@Path("/checklists")
public class ChecklistsResource {
	/*
	 * For more info on JAX-RS see
	 * https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html
	 */

	// Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(ChecklistsResource.class.getName());

	private static JSONArray _checklists = null;
	
	// Inject the MFP configuration API:
	@Context
	ConfigurationAPI configApi;

	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/Checklists/resource"
	 */

	@ApiOperation(value = "Returns the list of checklist items of the requestd type", notes = "The list of checklist items is managed by the Chief Quality Officer")
//	@ApiResponses(value = { @ApiResponse(code = 200, message = "Hello message returned") })
	@GET
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response getChecklists(){
		
		try {
			String applicationClientId = configApi.getPropertyValue("applicationClientId");
			String url = "https://api.us.apiconnect.ibmcloud.com/crmilescaibmcom-inspector/sb/api/checklists";
			OkHttpClient client = new OkHttpClient();
			okhttp3.Request request = new okhttp3.Request.Builder()
											.url(url)
											.addHeader("x-ibm-client-id", applicationClientId)
											.build();
			okhttp3.Response response = client.newCall(request).execute();

			return Response.ok(response.body().string()).build();

		} catch (IOException e){
		 	return Response.status(Response.Status.NOT_FOUND).build();
		}
		//return response.body().string();

		// Database db = null;
		// try {
		// 	db = CloudantClientMgr.getDB();
		// } catch (Exception re) {
		// 	re.printStackTrace();
		// 	return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
		// }
		
		// // check if document exists
		// try {
		// 	List<JSONObject> allDocs = db.getAllDocsRequestBuilder().includeDocs(true).build().getResponse().getDocsAs(JSONObject.class);
		// 	JSONArray result = new JSONArray();
		// 	for (JSONObject o : allDocs){
		// 		result.add(o);
		// 	}
		// 	return Response.ok(result.toString()).build();
		// } catch (NoDocumentException ex){
		// 	return Response.status(Response.Status.NOT_FOUND).build();			
		// } catch (IOException ex) {
		// 	return Response.status(Response.Status.NOT_FOUND).build();
		// }


		// try {
		// 	logger.info("Retrieving checklist");
		// 	InputStream is = this.getClass().getResourceAsStream("Checklists.json");
		// 	ChecklistsResource._checklists = (JSONArray)JSON.parse(is);
		// } catch (IOException ex){
		// 	logger.log(Level.SEVERE, "Could not load Checklists.json", ex);
		// 	return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		// }
		// return Response.ok(ChecklistsResource._checklists).build();
	}	
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response createChecklist(JSONObject checklist){
		if (checklist.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Checklist is required.\"}").build();
		}
		
		Response response = this._loadChecklists();
		if (response != null){
			return response;
		}
		
		if (checklist.get("id") != null){
			Long id = (Long)checklist.get("id");
			int index = this._findChecklistIndex(id.longValue());
			if (index > -1){
				return Response.status(Status.CONFLICT).entity("{\"error\": \"An checklist with id" + id + " already exists\"}").build();
			}
		} else {
			checklist.put("id", Long.valueOf(System.currentTimeMillis()));
		}
		ChecklistsResource._checklists.add(checklist);
		
		return Response.ok(checklist).build();
	}
	
	@PUT
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateChecklists(String checklistsStr){
		JSONArray checklists = null;
		try {
			checklists = (JSONArray)JSON.parse(checklistsStr);
		} catch (IOException e){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Checklists must be a JSON array.\"}").build();
		}
		if (checklists == null || checklists.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Checklists are required.\"}").build();
		}
		
		Response response = this._loadChecklists();
		if (response != null){
			return response;
		}
		ChecklistsResource._checklists = checklists;
		
		return Response.ok(checklists).build();
	}	
	
	
	@PUT
	@Path("/{checklistId}")
	@Consumes("application/json")	
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted")
	public Response updateChecklist(JSONObject checklist, @PathParam("checklistId") long id){
		if (checklist == null || id == 0){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Both checklist and id are required.\"}").build();
		}
		
		Response response = this._loadChecklists();
		if (response != null){
			return response;
		}
		
		checklist.put("id", id);
		int index = this._findChecklistIndex(id);
		if (index > -1){
			ChecklistsResource._checklists.set(index, checklist);			
		} else {
			return Response.status(Response.Status.NOT_FOUND).entity("{\"error\": \"Resource with id " + id + " not found.\"}").build();
		}

		return Response.ok(checklist).build();
	}
	
	@POST
	@Path("/{checklistId}/tests")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response createMedicalTest(JSONObject medicalTest, @PathParam("checklistId") long id){
		if (medicalTest.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medical test information is required.\"}").build();
		}
		
		Response response = this._loadChecklists();
		if (response != null){
			return response;
		}
		
		int checklistIndex = this._findChecklistIndex(id);
		if (checklistIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An checklist with id " + id + "could not be found.\"}").build();
		}
		JSONObject checklist = (JSONObject)ChecklistsResource._checklists.get(checklistIndex);
		medicalTest.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray tests = (JSONArray)checklist.get("tests");
		if (tests == null){
			tests = new JSONArray();
		}
		tests.add(medicalTest);
		
		return Response.ok(medicalTest).build();
	}	

	@POST
	@Path("/{checklistId}/medications")
	@Consumes("application/json")
	@Produces("application/json")
	@OAuthSecurity(scope="accessRestricted_level2")
	public Response addMedication(JSONObject medication, @PathParam("checklistId") long id){
		if (medication.isEmpty()){
			return Response.status(Status.BAD_REQUEST).entity("{\"error\": \"Medication information is required.\"}").build();
		}
		
		Response response = this._loadChecklists();
		if (response != null){
			return response;
		}
		
		int checklistIndex = this._findChecklistIndex(id);
		if (checklistIndex == -1){
			return Response.status(Status.NOT_FOUND).entity("{\"error\": \"An checklist with id " + id + "could not be found.\"}").build();
		}
		JSONObject checklist = (JSONObject)ChecklistsResource._checklists.get(checklistIndex);
		medication.put("id", Long.valueOf(System.currentTimeMillis()));
		JSONArray medications = (JSONArray)checklist.get("medications");
		if (medications == null){
			medications = new JSONArray();
		}
		medications.add(medication);
		
		return Response.ok(medication).build();
	}	
	
	
	private Response _loadChecklists() {
		try {
			if (ChecklistsResource._checklists == null){
				logger.info("Loading checklist list from file");
				InputStream is = this.getClass().getResourceAsStream("Checklists.json");
				ChecklistsResource._checklists = (JSONArray)JSON.parse(is);
			}
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load Checklists.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return null;
	}
	
	private int _findChecklistIndex(long id){
		for (int i=0; i< ChecklistsResource._checklists.size(); i++){
			if (Long.valueOf(id).equals(((JSONObject)ChecklistsResource._checklists.get(i)).get("id"))){
				return i;
			}
		}
		return -1;
	}

	private int _findChecklistIndexByType(String type){
		for (int i=0; i< ChecklistsResource._checklists.size(); i++){
			if (type.equals(((JSONObject)ChecklistsResource._checklists.get(i)).get("type"))){
				return i;
			}
		}
		return -1;
	}
	
	
}
