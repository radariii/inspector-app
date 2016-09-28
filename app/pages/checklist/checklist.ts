import { Component } from '@angular/core';
import {Page, NavController, NavParams, Modal, ViewController} from 'ionic-angular';
import {Network, Connection, Dialogs} from 'ionic-native';
import {ParentPage} from '../parent/parent';
import {IncidentPage} from '../incident/incident';
import {AdapterService} from '../../providers/adapter-service/adapter-service';
import {StorageService} from '../../providers/storage-service/storage-service';
import {DataService} from '../../providers/data-service/data-service';
import {NotificationService} from '../../providers/notification-service/notification-service';
import {StepUpAuthenticationModal} from '../../components/step-up-authentication-modal/step-up-authentication-modal';
import {SensorModal} from '../../components/sensor-modal/sensor-modal';
import * as moment from 'moment';

declare var SignaturePad:any;

@Component({
  templateUrl: 'build/pages/checklist/checklist.html',
})
export class ChecklistPage extends ParentPage {

	selectedItem = null;
	showDetails = false;
	inspection = null;
	data = {
		durationForDisplay: "00:00:00",
		timer: undefined
	}
	fromWatch: boolean = false;
	logger: any;

  constructor(private nav: NavController, navParams: NavParams, 
              private _adapterService: AdapterService, private _storageService: StorageService, private _dataService:DataService, private _notificationService:NotificationService) {
    super("Checklist");
    this.inspection = navParams.get("inspection");
		this.logger = WL.Logger.create({pkg: 'com.ibm.inspector.ChecklistPage'});

    for (let i=0; i<this.inspection.incidents.length; i++){
      let incident = this.inspection.incidents[i];
      var ckItem = this.inspection.checklistItems.findById(incident.checklistItemId);
      if (!ckItem.incidents){
        ckItem.incidents = [];
      }
      ckItem.incidents.push(incident);
    }    
		
		this._notificationService.eventEmitter.subscribe({ 
      next: (inspectionData) => {
				if (inspectionData.inspectionAction == "STARTED"){
					this.startInspection(true);
				} else if (inspectionData.inspectionAction == "SUSPENDED"){
					this.suspendInspection(true);
				} else if (inspectionData.inspectionAction == "FINISHED"){
					this.fromWatch = true;
					this.completeInspection(true);
				}			
			}
		});		

  }

	showSensors(){
    let sensorModal = Modal.create(SensorModal, {inspection: this.inspection});
    this.nav.present(sensorModal);
    sensorModal.onDismiss(
        (data) => {
        }
    );          
		
	}
	
	getIncidentsForChecklistItem(checklistItem){
		var result = [];
		if (!checklistItem.incidents){
			return result;
		}
    for (let i=0; i<checklistItem.incidents.length; i++){
      result.push(this.inspection.incidents.findById(checklistItem.incidents[i]))
    }
		return result;
	}
	
	selectChecklistItem(checklistItem){
		if (checklistItem != this.selectedItem){
			this.showDetails = false;			
		}
		this.selectedItem = checklistItem;
		WL.Analytics.log({_activity: "checklistItemSelected"});
		WL.Analytics.log("This is a client-side log message");
		
		WL.Logger.warn("This is a message at WARN level");
		WL.Logger.send();
		WL.Analytics.send();
	}
	
	toggleShowDetails(){
		this.showDetails = !this.showDetails;
	};
	
	addIncident(checklistItem){
		// var newIncident = {id: new Date().getTime(), name: "", description: "", severity: "", photos: [], checklistItemId: checklistItem.id};
		// if (!this.inspection.incidents){
		// 	this.inspection.incidents = [];
		// }
		// this.inspection.incidents.push(newIncident);
		
		// if (!checklistItem.incidents){
		// 	checklistItem.incidents = [];
		// }
		// checklistItem.incidents.push(newIncident.id);
		
		this.saveInspection();
		this.nav.push(IncidentPage, {inspection: this.inspection, checklistItem: checklistItem, incident: {}, mode: "NEW"});
		WL.Analytics.log({"checklistItem": checklistItem.summary, "incidentId": new Date().getTime()});
		
	};
	
	selectIncident(incident){
		this.nav.push(IncidentPage, {incident: incident, mode: "VIEW"});
	};
	
	
	
	startInspection(fromWatch){
		var inspection = this.inspection;
		if (inspection.status == "COMPLETED" || inspection.status == "IN_PROGRESS"){
			return;
		} else if (inspection.status == "NOT_STARTED"){
			inspection.duration = 0;
			this.inspection.startTime = moment().format("YYYY-MM-DD hh:mm:ss");
		}
		this.data.timer = setInterval(() => {
			this.inspection.duration += 1000;
			this.data.durationForDisplay = this.formatDurationForDisplay(this.inspection.duration);
		}, 1000);
		inspection.status = "IN_PROGRESS";
		if (!fromWatch){
			this._notificationService.sendToWatch({inspectionAction: "STARTED"});
		}
		this.saveInspection();
	}
	
	suspendInspection(fromWatch){
		this.inspection.status = "SUSPENDED";
		clearInterval(this.data.timer);
		if (!fromWatch){
		 	this._notificationService.sendToWatch({inspectionAction: "SUSPENDED"});
		}
		this.saveInspection();
	};
	
	completeInspection(fromWatch){
		// Open the signature modal
		let signatureModal = Modal.create(StepUpAuthenticationModal);
    this.nav.present(signatureModal);
    signatureModal.onDismiss(
      (data) => {
        if (data){
          this.inspection.status = "COMPLETED";
          //this.completedStoreNumbers.push(SharedData.inspection.number);
          clearInterval(this.data.timer);
          this.saveInspection();

          if (!this.fromWatch){
						this._notificationService.sendToWatch({inspectionAction: "COMPLETED"});
           	this.fromWatch = false;
          }
          this.nav.pop();
					WL.Analytics.log({"inspectionComplete": new Date().getTime(), "inspectionDuration": this.inspection.duration / 1000, "completedByInspector": this.inspection.inspector});



        } else {
					// Dialog was cancelled
					this.fromWatch = false;
				}
      }
    );
	}; 

	setChecklistItemComplete(checklistItem){
		if (checklistItem.status == "PASSED"){
			checklistItem.status = undefined;
		} else {
			checklistItem.status = "PASSED";			
		}
		this.saveInspection();
	};

	saveInspection(){
		// var inspectionCopy = $.extend(SharedData.inspection, {});
		// while(JSON.stringify(inspectionCopy).indexOf("$$hashKey") > -1){
		// 	cleanUpObject(inspectionCopy);			
		// }
		// //inspectionCopy = angular.fromJson(angular.toJson(inspectionCopy));
		
		// AdapterService.callAdapter($scope, "ContentAdapter", "updateInspection", [cleanUpObject(inspectionCopy)])
		// 	.then(function(){
		// 		LocalStorageSvc.update(inspectionCopy, false);				
		// 	}, function(error){
		// 		LocalStorageSvc.update(inspectionCopy, true);				
		// 	}
		// );
	}	

  formatDurationForDisplay(duration){
    try {
      duration = Number(duration)
    } catch(error){
      duration = 0;
    }
    var d = moment.duration(duration);
    return this.pad(d.hours(), 2) + ":" + this.pad(d.minutes(), 2) + ":" + this.pad(d.seconds(), 2);	
  }

  pad (str, max) {
    str = str.toString();
    return str.length < max ? this.pad("0" + str, max) : str;
  }    

  onPageDidEnter(){
    super.onPageDidEnter();
    this.data.durationForDisplay = this.formatDurationForDisplay(this.inspection.duration);
  }    

}
