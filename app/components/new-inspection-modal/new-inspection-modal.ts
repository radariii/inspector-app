import { Component, ElementRef, ViewChild } from '@angular/core';
import {Page, NavController, Modal, ViewController, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {GOOGLE_MAPS_DIRECTIVES} from 'angular2-google-maps/core';

@Component({
  selector: 'new-inspection-modal',
  templateUrl: 'build/components/new-inspection-modal/new-inspection-modal.html',
  directives: [GOOGLE_MAPS_DIRECTIVES]
})
export class NewInspectionModal {
    
  @ViewChild('content') content; 
  
  inspection: any;
    
  constructor(private viewCtrl: ViewController, navParams: NavParams) {
    this.inspection = navParams.get("inspection");
    console.debug("inspection: " + this.inspection);
  }
  
  ngAfterViewInit(){
    //let rect = this.content.elementRef.nativeElement.getBoundingClientRect();
    // this.canvas.nativeElement.width = rect.width;
    // this.canvas.nativeElement.height = rect.height;
    // this.buttonBar.nativeElement.style.width = (rect.height + "px");
    // this.headerBar.nativeElement.style.width = (rect.height + "px");
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  accept() {
    this.viewCtrl.dismiss(this.inspection);
  }
}