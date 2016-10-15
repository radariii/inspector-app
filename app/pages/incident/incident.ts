import { Component } from '@angular/core';
import { NavController, Platform, NavParams, Loading, Modal } from 'ionic-angular';
import { Connection, Network, Camera, Device } from 'ionic-native';
import {RecordingModal} from '../../components/recording-modal/recording-modal';
import {ParentPage} from '../parent/parent';
import {AdapterService} from '../../providers/adapter-service/adapter-service';
import {StorageService} from '../../providers/storage-service/storage-service';
import {DataService} from '../../providers/data-service/data-service';
import * as moment from "moment";

declare var navigator:any;
declare var LiveUpdateManager:any;

@Component({
  templateUrl: 'build/pages/incident/incident.html',
})
export class IncidentPage extends ParentPage {

	inspection: any = null;
	checklistItem: any = null;
	incident = null;
	incidentMode = "EDIT";
	processingAudio: any = null;
	liveUpdateFeatures: any = {
		textFeatureEnabled: false,
		speechFeatureEnabled: false
	}

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

	captureContent(textMode: boolean){
		let recordingModal = Modal.create(RecordingModal, {incident: this.incident, textMode: textMode});
		this.nav.present(recordingModal);
		recordingModal.onDismiss(
			(data) => {
				if (data){
					this.incident.name = data.name;
					this.incident.description = data.description;
					this.incident.severity = data.severity;
				}
			}
		);          
	}

	onPageDidEnter(){
		super.onPageDidEnter();

		var input = { params : {} ,useClientCache : false };                                                                                                    
		LiveUpdateManager.obtainConfiguration(input, (configuration) => {
			console.log("LiveUpdateConfiguration received: %o", configuration);     
			this.liveUpdateFeatures.textFeatureEnabled = configuration.features["watson-incident-text"] == 1;
			this.liveUpdateFeatures.speechFeatureEnabled = configuration.features["watson-incident-speech"] == 1;
		} ,
		function(err) {
			if (err) {
				console.error('Error retrieving LiveUpdate configuration:' + JSON.stringify(err));
			}
		});    		

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
