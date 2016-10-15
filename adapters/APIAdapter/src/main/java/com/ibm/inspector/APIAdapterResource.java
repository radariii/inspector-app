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
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

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
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriInfo;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;
import com.ibm.mfp.adapter.api.ConfigurationAPI;
import com.ibm.mfp.adapter.api.OAuthSecurity;

@Api(value = "Generic API Connect Adapter")
@Path("/")
public class APIAdapterResource {
	/*
	 * For more info on JAX-RS see
	 * https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html
	 */

	// Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(APIAdapterResource.class.getName());

	// Inject the MFP configuration API:
	@Context
	ConfigurationAPI configApi;


	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/APIAdapter/callAPI"
	 */

	@ApiOperation(value = "Generic method to invoke API Connect APIs", notes = "Takes a configuration object as the body param that describes the call to make to the API")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/callAPI")
	@OAuthSecurity(scope="accessRestricted")
	public Response callAPI(String apiInvocationRequestStr) {
		try {

			System.err.println("==> Starting /callAPI processing: apiInvocationRequest = " + apiInvocationRequestStr);
			JSONObject apiInvocationRequest = (JSONObject)JSON.parse(apiInvocationRequestStr);
			System.err.println("==> Starting /callAPI processing: apiInvocationRequest = " + apiInvocationRequest);
			
			String gatewayUrl = configApi.getPropertyValue("apiGatewayUrl");
			String appKey = configApi.getPropertyValue("appKey");
			String appSecret = configApi.getPropertyValue("appSecret");
			String url = gatewayUrl + apiInvocationRequest.get("apiUrl");
			JSONArtifact data = (JSONArtifact)apiInvocationRequest.get("data");
			JSONArray queryParams = (JSONArray)apiInvocationRequest.get("queryParams");
			
			System.out.println("==> gatewayUrl: " + gatewayUrl);
			System.out.println("==> appKey: " + appKey);
			System.out.println("==> appSecret: " + appSecret);
			System.out.println("==> url: " + url);
			System.out.println("==> data: " + data);
			System.out.println("==> queryParams: " + queryParams);			
			
//			if (true && true){
//				return Response.ok().build();
//			}
			
	 	 	RequestBody body = (data != null ? RequestBody.create(okhttp3.MediaType.parse("application/json"), data.toString()) : null);

	 	 	okhttp3.Request.Builder requestBuilder = new okhttp3.Request.Builder();

			HttpUrl.Builder httpUrlBuilder = HttpUrl.parse(url).newBuilder();

			for (int i=0; queryParams != null && i < queryParams.size(); i++){
				httpUrlBuilder.addQueryParameter((String)((JSONObject)queryParams.get(i)).get("key"), 
						(String)((JSONObject)queryParams.get(i)).get("value"));
			}
			requestBuilder.url(httpUrlBuilder.build());
			
			if (appKey != null){
				requestBuilder.addHeader("x-ibm-client-id", appKey);
			}
			if (appSecret != null){
				requestBuilder.addHeader("x-ibm-client-secret", appSecret);
			}
			
			String httpVerb = (String)apiInvocationRequest.get("httpVerb");
			if (httpVerb.toUpperCase().equals("GET")){
				requestBuilder.get();
			} else if (httpVerb.toUpperCase().equals("POST")){
				requestBuilder.post(body);
			} else if (httpVerb.toUpperCase().equals("PUT")){
				requestBuilder.put(body);
			} else if (httpVerb.toUpperCase().equals("DELETE")){
				requestBuilder.delete();
			}
			
			System.out.println("==> Request built.");
		
			OkHttpClient client = new OkHttpClient();
			okhttp3.Response response = client.newCall(requestBuilder.build()).execute();
			System.out.println("==> Response: " + response);
			return Response.status(response.code()).entity(response.body().string()).build();

		} catch (IOException e){
		 	return Response.status(Response.Status.NOT_FOUND).build();
		}		
	}

	/*
	 * Path for method:
	 * "<server address>/mfp/api/adapters/APIAdapter/callAPI"
	 */

	@ApiOperation(value = "Generic method to invoke API Connect Cognitive APIs", notes = "The body is sent directly to the cognitive API, after having been processed according to the content type")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/callCognitiveAPI")
	@OAuthSecurity(enabled=false)
	public Response callBinaryAPI(byte[] data, @Context UriInfo uriInfo, @HeaderParam("Content-type") String contentType) {
		try {
			MultivaluedMap<String, String> queryParams = uriInfo.getQueryParameters();
			String queryParamStr = "?";
			for (String key : queryParams.keySet()){
				queryParamStr += key + "=" + queryParams.getFirst(key);
			}
			System.err.println("==> Starting /callBinaryAPI processing: data = " + data + ", contentType = " + contentType);

	 	 	okhttp3.Request.Builder requestBuilder = new okhttp3.Request.Builder();
			RequestBody body = null;
			String applicationClientId = configApi.getPropertyValue("appKey");
			String applicationClientSecret = configApi.getPropertyValue("appSecret");
			String gatewayUrl = configApi.getPropertyValue("apiGatewayUrl");
			gatewayUrl += gatewayUrl.lastIndexOf("/") == gatewayUrl.length()-1 ? "" : "/";

			//String url = "https://api.us.apiconnect.ibmcloud.com/crmilescaibmcom-inspector/sb/cognitive/";
			String url = gatewayUrl + "cognitive/";
			if (contentType.equals("application/json")){
				url += "text-to-sentiment" + queryParamStr;
				String strData = new String(data, "UTF-8");
				System.err.println("==> Starting /callBinaryAPI: strData = " + strData);
				body = (data != null ? RequestBody.create(okhttp3.MediaType.parse(contentType), strData) : null);
			} else if (contentType.equals("audio/wav")){
				url += "speech-to-sentiment" + queryParamStr;			
				body = (data != null ? RequestBody.create(okhttp3.MediaType.parse(contentType), data) : null);	
			}
			System.err.println("==> Starting /callBinaryAPI: url = " + url);

			HttpUrl.Builder httpUrlBuilder = HttpUrl.parse(url).newBuilder();
			requestBuilder.url(httpUrlBuilder.build());
			requestBuilder.addHeader("x-ibm-client-id", applicationClientId);
			if (applicationClientSecret != null && !"".equals(applicationClientSecret)){
				requestBuilder.addHeader("x-ibm-client-secret", applicationClientSecret);						
			}
			requestBuilder.post(body);
			
			System.out.println("==> Request built.");
		
			OkHttpClient client = new OkHttpClient();
			okhttp3.Response response = client.newCall(requestBuilder.build()).execute();
			System.out.println("==> Response: " + response);
			return Response.status(response.code()).entity(response.body().string()).build();

		} catch (IOException e){
		 	return Response.status(Response.Status.NOT_FOUND).build();
		}		
	}	

}
