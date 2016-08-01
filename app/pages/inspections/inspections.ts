import { Component, NgZone } from '@angular/core';
import { NavController, Platform, Modal } from 'ionic-angular';
import { Connection, Network, Dialogs } from 'ionic-native';
import {ParentPage} from '../parent/parent';
import {LoginPage} from '../login/login';
import {ReportPage} from '../report/report';
import {InspectionDetailPage} from '../inspection-detail/inspection-detail';
import {NewInspectionModal} from '../../components/new-inspection-modal/new-inspection-modal'; 
import {DataService} from '../../providers/data-service/data-service';
import * as moment from "moment";

@Component({
  templateUrl: 'build/pages/inspections/inspections.html',
})
export class InspectionsPage extends ParentPage {

  _refresher: any;
  loading: boolean = true;
  loadingError: string = "";
  inspections: any = [];
  selectedInspection:any = null;
  
  constructor(private _nav: NavController, platform: Platform, private _ngZone:NgZone, private _DataService:DataService) {
    super("Inspections");

    MFPPush.registerNotificationsCallback((content) => {
        console.log("Push notification received: %o", content);
        let newInspectionModal = Modal.create(NewInspectionModal, {inspection: JSON.parse(content.payload)});
        this._ngZone.run(() => {
          this._nav.present(newInspectionModal);
        });        
        newInspectionModal.onDismiss(
            (data) => {
                if (data){
                  this.inspections.push(data);
                }
            }
        );                    
    });    
  }

	selectInspection(inspection){
		if (this.selectedInspection != inspection){
			this.selectedInspection = inspection;			
		} else {
			this.selectedInspection = null;
		}
	};
	
	openInspection(inspection){
    this._nav.push(InspectionDetailPage, {inspection: this.selectedInspection});
	}
	
	isInspectionComplete(inspection){
    return inspection.status == "COMPLETED";
		//return SharedData.completedStoreNumbers.indexOf(inspection.number) > -1;
	}
	
	addInspection() {
		var newInspection = {
			  "id" : new Date().getTime(),
			  "name": "Store Location #12",
			  "number": "12",
			  "type": "FOOD",
			  "location": "3 King St. W, Toronto, ON, M5W 1E6",
			  "reason": "",
			  "contactName": "Barry Backhaus",
			  "contactPhone": "416-594-3232",
			  "status": "NOT_STARTED",
			  "startTime": moment().format("YYYY-MM-DD hh:mm:ss"),
			  "distanceToSite": "3.7 miles",
			  "duration": null,
			  "inspector": "1",
			  "incidentCount": 0,
			  "incidents": []
			};
		
		Dialogs.alert('New Inspection Assigned', newInspection.name + "\n" + newInspection.location, "OK")
    .then(() => {
			this.inspections.push(newInspection);
    });
	}
	
	openReport() {
    //this._nav.push(ReportPage, {});
    var newInspection = {
            "id" : new Date().getTime(),
            "name": "Store Location #12",
            "number": "12",
            "type": "FOOD",
            "location": "3 King St. W, Toronto, ON, M5W 1E6",
            "reason": "Regularly scheduled inspection is now due",
            "contactName": "Barry Backhaus",
            "contactPhone": "416-594-3232",
            "status": "NOT_STARTED",
            "startTime": moment().format("YYYY-MM-DD hh:mm:ss"),
            "distanceToSite": "3.7 miles",
            "duration": null,
            "inspector": "1",
            "lat": 51.65,
            "lng": 7.8,
            "incidentCount": 0,
            "incidents": []
          };
    let newInspectionModal = Modal.create(NewInspectionModal, {inspection: newInspection});
    this._nav.present(newInspectionModal);
    newInspectionModal.onDismiss(
        (data) => {
            if (data){
              this.inspections.push(data);
            }
        }
    );          
	}
	
		
//		// Get the authorization token for the text-to-speech service
//		var watsonTokenResourceRequest = new WLResourceRequest("https://stream.watsonplatform.net/authorization/api/v1/token", WLResourceRequest.GET);
//		watsonTokenResourceRequest.setQueryParameter("url", "https://stream.watsonplatform.net/speech-to-text/api");
//		watsonTokenResourceRequest.addHeader("Authorization", "Basic ODQxNzg0ZmItZTkyOS00OTAwLWE4ZGItNDAxZTNkOTQxMjE0Onk5Q0dKVDNXSUdRcw==");
//		watsonTokenResourceRequest.send().then(
//			function(successResponse){
//				$scope.watsonToken = successResponse.responseText;
//				
//				// Open the websocket connection using the obtained token
//				var token = $scope.watsonToken;
//				var wsURI = "wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=" + token + "&model=es-ES_BroadbandModel";
//				var websocket = new WebSocket(wsURI);
//				websocket.onopen = function(evt) { 
//					console.debug("Websocket is open! %o", evt);
//				};
//				websocket.onclose = function(evt) { 
//					console.debug("Websocket is closed! %o", evt); 
//				};
//				websocket.onmessage = function(evt) { 
//					console.debug("Websocket message received! %o", evt);
//				};
//				websocket.onerror = function(evt) {
//					console.debug("Websocket error :( %o", evt);
//				};
//				
//			}
//		);
		

  logout() {
    if (WL.Client.getEnvironment() === "preview"){
      this._nav.popToRoot()
    } else {
      WLAuthorizationManager.logout("UserLoginSecurityCheck").then(() => this._nav.popToRoot());
    }
  }
  
  doRefresh(refresher) {
    this.inspections = [];
    this._refresher = refresher; 
    this.onPageDidEnter(true);
  }
  
  onPageDidEnter(hideSpinner:boolean = false){
    super.onPageDidEnter();

    if (!hideSpinner){
      this.loading = true;
    }
    this.loadingError = "";

    // Force reload from server when we're coming from the login page (for demo purposes, we can refresh the content)
    this._DataService.load(ParentPage.fromPage == "Login" ? true : false).then(
      (inspections) => {
        this.inspections = inspections;
        this.loading = false;
        this.loadingError = "";
        if (this._refresher){
          this._refresher.complete();
          this._refresher = null;
        }                      
      },
      (error) => {
        this.loading = false;
        this.loadingError = "Something went wrong loading the list of inspections. Sorry! :(";
      }
    )

  }
}
