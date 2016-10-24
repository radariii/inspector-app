package com.ibm.inspector;

import java.util.logging.Logger;

import com.ibm.mfp.adapter.api.MFPJAXRSApplication;

public class SampleSegmentResolverAdapterApplication extends MFPJAXRSApplication{

	static Logger logger = Logger.getLogger(SampleSegmentResolverAdapterApplication.class.getName());
	

	protected void init() throws Exception {
		logger.info("Adapter initialized!");
	}
	

	protected void destroy() throws Exception {
		logger.info("Adapter destroyed!");
	}
	

	protected String getPackageToScan() {
		//The package of this class will be scanned (recursively) to find JAX-RS resources. 
		//It is also possible to override "getPackagesToScan" method in order to return more than one package for scanning
		return getClass().getPackage().getName();
	}
}
