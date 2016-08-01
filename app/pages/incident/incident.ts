import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { Connection, Network, Camera, Device } from 'ionic-native';
import {ParentPage} from '../parent/parent';
import {AdapterService} from '../../providers/adapter-service/adapter-service';
import {StorageService} from '../../providers/storage-service/storage-service';
import {DataService} from '../../providers/data-service/data-service';
import * as moment from "moment";

declare var navigator:any;

@Component({
  templateUrl: 'build/pages/incident/incident.html',
})
export class IncidentPage extends ParentPage {

	inspection: any = null;
	checklistItem: any = null;
	incident = null;
	incidentMode = "EDIT";
	processingAudio: any = null;

  constructor(private nav: NavController, navParams: NavParams, 
              private _adapterService: AdapterService, private _storageService: StorageService, private _dataService:DataService) {
    super("IncidentDetails");
	this.inspection = navParams.get("inspection");
	this.checklistItem = navParams.get("checklistItem");
    this.incident = navParams.get("incident");
    this.incidentMode = navParams.get("mode");
  }


	updateDescriptionWithAudio(){
	    setTimeout(() => {
	    	this.processingAudio = false;
	    	this.incident.description = "An incident was discovered and this is the description.";
	    	this.incident.severity = "HIGH";
	    }, 3000);
	}
	
	captureDescriptionAudio(){
		this.processingAudio = true;
		if (navigator.device.capture.supportedAudioModes.length == 0){
			this.updateDescriptionWithAudio();
		} else {
			navigator.device.capture.captureAudio(this.updateDescriptionWithAudio, this.updateDescriptionWithAudio,{duration:10});			
		}
	}

//	var req = new WLResourceRequest("https://stream.watsonplatform.net/speech-to-text/api/v1/sessions", WLResourceRequest.POST);
//	req.addHeader("Authorization", "Basic ODQxNzg0ZmItZTkyOS00OTAwLWE4ZGItNDAxZTNkOTQxMjE0Onk5Q0dKVDNXSUdRcw==");
//	req.send().then(
//		function(successResponse){
//			this.recognizeURL = successResponse.responseJSON.recognize;
//			
//			
////			var req2 = new WLResourceRequest(this.recognizeURL, WLResourceRequest.POST);
////			req2.addHeader("Content-Type", "audio/wav");
////			req2.addHeader("Transfer-encoding", "chunked");
////			req2.addHeader("Authorization", "Basic ODQxNzg0ZmItZTkyOS00OTAwLWE4ZGItNDAxZTNkOTQxMjE0Onk5Q0dKVDNXSUdRcw==");
////			req2.send().then(
////				function(successResponse){
////				}, 
////				function(error){
////					console.error(error);
////				}
////			);
//			
//		}
//	);
	
	setSeverity(incident, severity){
		if (this.incidentMode != 'VIEW'){
			this.incident.severity = severity;	
		}
	};
	
	setMode(newMode){
		this.incidentMode = newMode;
	};
	
	saveIncident(){
//		this.saveInspection();
		this.setMode('VIEW')
	}
	
	done(){
		this.nav.pop();
	}
	
	getBackgroundImageDataUrl(imageData){
		return "background-image: url(" + (imageData.indexOf("http") == 0 ? "" : "data:image/jpeg;base64,") + imageData + ")";
	};
	
	takePhoto(){
    let options = { quality: 10, targetWidth: 150, targetHeight: 300, destinationType: Camera.DestinationType.DATA_URL};
		Camera.getPicture(options).then(
      		(imageData) => {
				this.incident.photos.push(imageData);
			}, 
			(error) => {}
		); 		
	}

  onPageDidEnter(){
    super.onPageDidEnter();

	if (this.incidentMode == "NEW"){
		this.incident  = {id: new Date().getTime(), name: "", description: "", severity: "", photos: [], checklistItemId: this.checklistItem.id};
		if (!this.inspection.incidents){
			this.inspection.incidents = [];
		}
		this.inspection.incidents.push(this.incident);
		
		if (!this.checklistItem.incidents){
		 	this.checklistItem.incidents = [];
		}
		this.checklistItem.incidents.push(this.incident.id);
		
	}
  }  
	
	
}
