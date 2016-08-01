import { Component, NgZone } from '@angular/core';
import {Page, NavController, NavParams, Modal, ViewController} from 'ionic-angular';
import {Network, Connection, Dialogs} from 'ionic-native';
import {ParentPage} from '../parent/parent';
import {ChecklistPage} from '../checklist/checklist';
import {AdapterService} from '../../providers/adapter-service/adapter-service';
import {StorageService} from '../../providers/storage-service/storage-service';
import {DataService} from '../../providers/data-service/data-service';
import * as moment from 'moment';
import {AddNoteModal} from '../../components/add-note-modal/add-note-modal';

@Component({
  templateUrl: 'build/pages/inspection-detail/inspection-detail.html',
})
export class InspectionDetailPage extends ParentPage {
  nav: NavController;
  inspection: any;
  inspectionDuration: number;
  inProgressInterval: any;
  suspendedInterval: any;
  isDirty: boolean = false;
  loading: boolean = false;
  loadingError: string = "";
  
  constructor(nav: NavController, navParams: NavParams, private ngZone: NgZone,
              private _adapterService: AdapterService, private _storageService: StorageService, private _dataService:DataService) {
    super("InspectionDetail");
    this.nav = nav;
    this.inspection = navParams.get("inspection");
    this._storageService.syncRequired().then(
        (syncRequired) => {
            this.isDirty = syncRequired;
        }
    )
    var self = this;
    this._storageService.watchSyncState().subscribe(
      (isDirty) => {
        self.isDirty = isDirty;
      }
    );
    
  }

	getCompletedItemCount(): string{
		if (!this.inspection || !this.inspection.checklistItems){
			return "--"
		}
		var count = 0;
    for (let i=0; i<this.inspection.checklistItems.length; i++){
      if (this.inspection.checklistItems[i].status == "PASSED"){
        count++;
      }
    }
		return String(count);
	}

  getUncompletedItemCount(): string{
		if (!this.inspection || !this.inspection.checklistItems){
			return "--"
		}
		return String(this.inspection.checklistItems.length - Number(this.getCompletedItemCount()));
	}
	
  getIncidentCount(){
		if (!this.inspection || !this.inspection.incidents){
			return "0";
		}
		return this.inspection.incidents.length;
	}

  showChecklist(){
		this.nav.push(ChecklistPage, {inspection: this.inspection});
	}
	
  onPageDidEnter(){
    super.onPageDidEnter();
// // TESTING          
//         this.inspection.checklistItems = [  
//           {  
//               "description":"At least 4 sales reps on the floor helping customers",
//               "details":"Each sales rep must be covering the 4 key entrance areas in the north, south, east and west.",
//               "id":"1",
//               "inspectionType":"FOOD",
//               "mandatory":1,
//               "parentRequirementId_FK":null,
//               "points":5,
//               "requiresReinspection":1
//           },
//           {  
//               "description":"Two sales rep nearby the check out counter (in view of customers approaching)",
//               "details":"The sales reps should not be more than 10-20 feet away and visible to the customer approaching the counter.",
//               "id":"2",
//               "inspectionType":"FOOD",
//               "mandatory":1,
//               "parentRequirementId_FK":null,
//               "points":10,
//               "requiresReinspection":1
//           },
//           {  
//               "description":"Weekly sales items by the entrances",
//               "details":"Each of the North, south, east and west entrances should have the weekly sale items on the window panes (on both sides).",
//               "id":"3",
//               "inspectionType":"FOOD",
//               "mandatory":1,
//               "parentRequirementId_FK":null,
//               "points":0,
//               "requiresReinspection":1
//           },
//           {  
//               "description":"Customer bathrooms clean and maintained",
//               "details":"All stalls filled with toilet paper and coverings. All soap dispensers working. Each sales rep is required to sign their name on the maintenance chart 3 times daily to verify checks at scheduled times.",
//               "id":"4",
//               "inspectionType":"FOOD",
//               "mandatory":1,
//               "parentRequirementId_FK":"3",
//               "points":5,
//               "requiresReinspection":0
//           },
//           {  
//               "description":"Security personnel actively roaming on the floor",
//               "details":"One security personnel should be on the floor at all times and moving from each of the 3 entrance zones.",
//               "id":"5",
//               "inspectionType":"FOOD",
//               "mandatory":0,
//               "parentRequirementId_FK":"3",
//               "points":1,
//               "requiresReinspection":0
//           }
//         ];
//         this.loading = false;
//         this.loadingError = "";
//         if (true && true){
//           return;
//         }

    // Force reload from server when we're coming from the login page (for demo purposes, we can refresh the content)
    //this._adapterService.callAdapter("Checklists", "checklists", "GET", null).then(
    this._adapterService.callApi("/api/checklists", "GET", null, null).then(
      (checklist) => {
        this.ngZone.run(() => {
          this.inspection.checklistItems = checklist;
          this.loading = false;
          this.loadingError = "";
        });
      },
      (error) => {
        this.ngZone.run(() => {
         this.loading = false;
         this.loadingError = "Something went wrong loading the list of inspections. Sorry! :(";
        });        
      }
    )
  }  
}
