/*
 *    Licensed Materials - Property of IBM
 *    5725-I43 (C) Copyright IBM Corp. 2015, 2016. All Rights Reserved.
 *    US Government Users Restricted Rights - Use, duplication or
 *    disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

package com.ibm.inspector;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.io.IOException;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONObject;
import com.ibm.mfp.adapter.api.ConfigurationAPI;
import com.ibm.mfp.adapter.api.OAuthSecurity;

import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import okhttp3.FormBody;

import org.apache.commons.codec.binary.Base64;

@Api(value = "Push Notification Adapter")
@Path("/push")
public class PushAdapterResource {

	// Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(PushAdapterResource.class.getName());

	// Inject the MFP configuration API:
	@Context
	ConfigurationAPI configApi;

	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/PushAdapter/push"
	 */
	@ApiOperation(value = "Push Sender", notes = "This API sends a push notification using a confidential client")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public Response sendPush(
			@ApiParam(value = "The payload for the push notification service", required = true) String payload) {

		try {

			String appId = configApi.getPropertyValue("appId");
			String serverUrl = configApi.getPropertyValue("serverUrl");
			String url = serverUrl + "/imfpush/v1/apps/" + appId + "/messages";
			
			OkHttpClient client = new OkHttpClient();
	 	 	RequestBody body = RequestBody.create(okhttp3.MediaType.parse("application/json"), payload);
			okhttp3.Request request = new okhttp3.Request.Builder()
											.url(url)
											.addHeader("Authorization", this.renewAuthorizationToken())
											.post(body)
											.build();
			okhttp3.Response response = client.newCall(request).execute();
			//System.out.println("response: " + response);
			return Response.ok(response.body().string()).build();
			//return Response.ok("{\"url\": \"" + url + "\", \"payload\": \"" + payload + "\"}").build();

		} catch (IOException e){
		 	return Response.status(Response.Status.NOT_FOUND).build();
		}
	}
	
	private String renewAuthorizationToken(){
		try {

			String appId = configApi.getPropertyValue("appId");
			String serverUrl = configApi.getPropertyValue("serverUrl");
			String username = configApi.getPropertyValue("ccUsername");
			String password = configApi.getPropertyValue("ccPassword");
			
			String url = serverUrl + "/mfp/api/az/v1/token";
			String basicAuthString = new String(Base64.encodeBase64(new String(username + ":" + password).getBytes()));				
			
			OkHttpClient client = new OkHttpClient();
	 	 	RequestBody formBody = new FormBody.Builder()
	 	 	        .add("grant_type", "client_credentials")
	 	 	        .add("scope", "push.application." + appId + " messages.write")
	 	 	        .build();
			okhttp3.Request request = new okhttp3.Request.Builder()
											.url(url)
											.addHeader("Authorization", "Basic " + basicAuthString)
											.post(formBody)
											.build();
			okhttp3.Response response = client.newCall(request).execute();
			JSONObject obj = (JSONObject)JSON.parse(response.body().string());
			return "Bearer" + obj.get("access_token");

		} catch (IOException e){
			System.err.println("Error retrieving confidential client authorization token");
			e.printStackTrace();
		 	return null;
		}		
	}

}
