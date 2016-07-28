package com.ibm.inspector;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.mfp.security.checks.base.CredentialsValidationSecurityCheck;

public class StepUpAuthenticationAdapter extends CredentialsValidationSecurityCheck {

	private static JSONArray _challengeQuestions = new JSONArray();
	
	//Define logger (Standard java.util.Logger)
	static Logger logger = Logger.getLogger(StepUpAuthenticationAdapter.class.getName());

	
	public StepUpAuthenticationAdapter() {
		super();
		
		
	}
	
	@Override
	protected Map<String, Object> createChallenge() {
		Response response = this._loadChallengeQuestions();
		if (response != null){
			logger.log(Level.SEVERE, "Failed to load ChallengeQuestions.json");
			return null;
		}
		HashMap<String, Object> challenge = new HashMap<String, Object>();
		
		// Randomly pick a challenge question to ask...
		int index = Double.valueOf(Math.floor(Math.random() * 2.9999999)).intValue();
		try {
			logger.log(Level.WARNING, "Selected question: " + index);
			logger.log(Level.WARNING, "Questions: " + _challengeQuestions.serialize());
		} catch (IOException e){
			e.printStackTrace();
		}
		challenge.put("id", ((JSONObject)_challengeQuestions.get(index)).get("id"));
		challenge.put("question", ((JSONObject)_challengeQuestions.get(index)).get("question"));
		return challenge;
	}

	@Override
	protected boolean validateCredentials(Map<String, Object> credentials) {
		logger.log(Level.SEVERE, "Validating credentials: " + credentials.toString());
		Response response = this._loadChallengeQuestions();
		if (response != null){
			logger.log(Level.SEVERE, "Failed to load ChallengeQuestions.json");
			return false;
		}
		
		for (int i=0; i<_challengeQuestions.size(); i++){
			int currentId = ((Long)((JSONObject)_challengeQuestions.get(i)).get("id")).intValue();
			int answeredQuestionId = ((Integer)credentials.get("id")).intValue();
			if (currentId == answeredQuestionId){
				String correctAnswer = (String)((JSONObject)_challengeQuestions.get(i)).get("answer");
				String answeredAnswer = (String)credentials.get("answer");
				logger.log(Level.SEVERE, "Comparing correctAnswer: " + correctAnswer + " to answeredAnswer: " + answeredAnswer);
				if (correctAnswer.equals(answeredAnswer)){
					logger.log(Level.SEVERE, "Validation success!");
					return true;
				}
			}
		}
		logger.log(Level.SEVERE, "Validation FAILURE!");
		return false;
	}

	
	private Response _loadChallengeQuestions() {
		try {
			if (StepUpAuthenticationAdapter._challengeQuestions == null || StepUpAuthenticationAdapter._challengeQuestions.size() == 0){
				logger.info("Loading challenge questions list from file");
				InputStream is = this.getClass().getResourceAsStream("ChallengeQuestions.json");
				StepUpAuthenticationAdapter._challengeQuestions = (JSONArray)JSON.parse(is);
			}
		} catch (IOException ex){
			logger.log(Level.SEVERE, "Could not load ChallengeQuestions.json", ex);
			return Response.status(Status.INTERNAL_SERVER_ERROR).build();
		}
		return null;
	}
		
}
