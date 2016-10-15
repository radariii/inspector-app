package com.ibm.inspector;

import java.util.List;
import java.util.Map;

import com.ibm.mfp.server.registration.external.model.AuthenticatedUser;
import com.ibm.mfp.server.registration.external.model.ClientData;
import com.ibm.mfp.server.registration.external.model.RegistrationData;
import com.ibm.mfp.server.security.external.resource.AdapterSecurityContext;

public class ResolverAdapterData {
    public ResolverAdapterData() {
    }

    public ResolverAdapterData(AdapterSecurityContext asc, Map<String, List<String>> queryArguments)
    {
        ClientData cd = asc.getClientRegistrationData();

        this.authenticatedUser = asc.getAuthenticatedUser();
        this.registrationData = cd == null ? null : cd.getRegistration();
        this.queryArguments = queryArguments;
    }

    public AuthenticatedUser getAuthenticatedUser() {
        return authenticatedUser;
    }

    public RegistrationData getRegistrationData() {
        return registrationData;
    }

    public Map<String, List<String>> getQueryArguments() {
        return queryArguments;
    }

    private AuthenticatedUser authenticatedUser;
    private RegistrationData registrationData;
    private Map<String, List<String>> queryArguments;
}