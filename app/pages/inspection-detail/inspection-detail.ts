import { Component } from '@angular/core';
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
  
  constructor(nav: NavController, navParams: NavParams, 
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

    // Force reload from server when we're coming from the login page (for demo purposes, we can refresh the content)
    this._adapterService.callAdapter("Checklists", "checklists", "GET", null).then(
      (checklist) => {
        this.inspection.checklistItems = checklist;
        this.loading = false;
        this.loadingError = "";
      },
      (error) => {
        this.loading = false;
        this.loadingError = "Something went wrong loading the list of inspections. Sorry! :(";
      }
    )
  }  
}
