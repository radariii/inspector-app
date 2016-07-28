import { Component, ElementRef, ViewChild } from '@angular/core';
import {Page, NavController, Modal, ViewController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

declare var SignaturePad:any;

@Component({
  selector: 'step-up-authentication-modal',
  templateUrl: 'build/components/step-up-authentication-modal/step-up-authentication-modal.html'
})
export class StepUpAuthenticationModal {
    
  @ViewChild('canvas') canvas;
  @ViewChild('headerBar') headerBar;
  @ViewChild('buttonBar') buttonBar;
  @ViewChild('content') content; 
  
  challenge: any;
  appointmentNote: any = {id: new Date().getTime(), timestamp: moment().format("YYYY-MM-DD hh:mm:ss"), content: ""};
  appointment: any;
  answer: string = "";
  _isDirty = false;
  signaturePad:any;
    
  constructor(private viewCtrl: ViewController, navParams: NavParams, elementRef: ElementRef) {
    this.viewCtrl = viewCtrl;
    this.challenge = navParams.get("challenge");
  }
  
  ngAfterViewInit(){
    let rect = this.content.elementRef.nativeElement.getBoundingClientRect();
    this.canvas.nativeElement.width = rect.width;
    this.canvas.nativeElement.height = rect.height;
    this.buttonBar.nativeElement.style.width = (rect.height + "px");
    this.headerBar.nativeElement.style.width = (rect.height + "px");
    this.signaturePad = new SignaturePad(this.canvas.nativeElement);	        
  }

  submitChallenge(){
    
  }
  
  cancel() {
    
  }

  signatureCancelled() {
    this.viewCtrl.dismiss();
  }

  signatureAdded() {
    this.viewCtrl.dismiss(this.signaturePad.toDataURL());
  }
}