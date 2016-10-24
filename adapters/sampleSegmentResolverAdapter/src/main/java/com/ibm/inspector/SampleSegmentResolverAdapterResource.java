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
import java.util.List;
import java.util.logging.Logger;

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

import com.ibm.mfp.adapter.api.ConfigurationAPI;
import com.ibm.mfp.adapter.api.OAuthSecurity;

import com.google.gson.Gson;
import com.ibm.mfp.server.app.external.ApplicationKey;
import com.ibm.mfp.server.registration.external.model.AuthenticatedUser;
import com.ibm.mfp.server.registration.external.model.DeviceData;
import com.ibm.mfp.server.registration.external.model.RegistrationData;

@Api(value = "LiveUpdate segment resolver adapter for Inspector")
@Path("/")
public class SampleSegmentResolverAdapterResource {

    private static final Gson gson = new Gson();
    private static final Logger logger = Logger.getLogger(SampleSegmentResolverAdapterResource.class.getName());


    @POST
    @Path("segment")
    @Produces("text/plain;charset=UTF-8")
    @OAuthSecurity(enabled = true, scope = "configuration-user-login")
    public String getSegment(String body) throws Exception {
        ResolverAdapterData data = gson.fromJson(body, ResolverAdapterData.class);
        String segmentName = "general-population";

        // Get the custom arguments
        Map<String, List<String>> arguments = data.getQueryArguments();

        // Get the authenticatedUser object
        AuthenticatedUser authenticatedUser = data.getAuthenticatedUser();

		if (authenticatedUser != null){
			String name = authenticatedUser.getDisplayName();
			String userId = authenticatedUser.getId();

			// Get registration data such as device and application
			RegistrationData registrationData = data.getRegistrationData();
			ApplicationKey application = registrationData.getApplication();
			DeviceData deviceData = registrationData.getDevice();

			// Based on the above context (arguments, authenticatedUser and registrationData) resolve the segment name.
			// Write your custom logic to resolve the segment name.
			System.out.println("--> SampleSegmentResolverAdapterResource(); user id = " + userId + ", name = " + name);
			
			if ("ian".equals(userId)){
				segmentName = "innovators";
			} else if ("rachel".equals(userId)){
				segmentName = "early-adopters";
			} else {
				segmentName = "general-population";
			}
			System.out.println("--> SampleSegmentResolverAdapterResource(); setting segment to: " + segmentName);
		} else {
			System.out.println("--> SampleSegmentResolverAdapterResource(); Could not find user. Setting segment to: " + segmentName);
		}

        return segmentName;
    }

}
