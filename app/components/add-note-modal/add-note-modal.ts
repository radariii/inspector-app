import { Component } from '@angular/core';
import {Page, NavController, Modal, ViewController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

/*
  Generated class for the AddNoteModal component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'add-note-modal',
  templateUrl: 'build/components/add-note-modal/add-note-modal.html'
})
export class AddNoteModal {
    
  appointmentNote: any = {id: new Date().getTime(), timestamp: moment().format("YYYY-MM-DD hh:mm:ss"), content: ""};
  appointment: any;
  _isDirty = false;
    
  constructor(private viewCtrl: ViewController, navParams: NavParams) {
    this.viewCtrl = viewCtrl;
//    this.appointment = navParams.get("appointment");
  }
  
  onChange(event){
    this._isDirty = true;
  } 
  
  isSaveDisabled(){
    return !this._isDirty;
  }
  
  save(){
//    this.appointment.notes.push(this.appointmentNote);
    this.viewCtrl.dismiss(this.appointmentNote);
  }
  
  cancel() {
    this.viewCtrl.dismiss();
  }
}
