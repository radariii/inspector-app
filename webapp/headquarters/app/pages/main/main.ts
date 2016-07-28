import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavController, Modal} from 'ionic-angular';
import { AuthenticationModal } from '../../components/authentication-modal/authentication-modal';
import { AdapterService } from '../../providers/adapter-service/adapter-service';

declare var WL: any;

@Component({
  templateUrl: 'build/pages/main/main.html',
})
export class MainPage {

  @ViewChild('leftColumn') leftColumn: any;
  @ViewChild('rightColumn') rightColumn: any;

  columnHeight: number;
  inspections: Array<any>; 
  inspectors: Array<any>; 
  challengeHandler: any;
  loginInProgress: boolean = false;
  loginModal: Modal;
  selectedInspection = null;
  selectedInspector = null;

  constructor(private nav: NavController, private elementRef: ElementRef, private _ngZone: NgZone, private adapterService:AdapterService) {
    this.challengeHandler = WL.Client.createSecurityCheckChallengeHandler("UserLoginSecurityCheck");
    let _stepUpChallengeHandler = this.challengeHandler;
    let __nav = nav;
    this.challengeHandler.handleChallenge = (challenge: any) => {
      if (!this.loginInProgress){
        this.loginInProgress = true;
        this.loginModal = Modal.create(AuthenticationModal, {challengeHandler: this.challengeHandler});
        this.loginModal.onDismiss(() => {
          this.loginInProgress = false;
        });
        this._ngZone.run(() => {
          this.nav.present(this.loginModal);
        })
      } else if (challenge.errorMsg){
        //this.loginModal.loginError = challenge.errorMsg;
      }
    }
    this.challengeHandler.handleFailure = (error) => {
//      this.stepUpLoginError = error.errorMsg;
    }    
    this.challengeHandler.handleSuccess = (successData) => {
      this._ngZone.run(() => {
        __nav.pop();
      });
    }       
  }

  selectInspection(inspection){
    this.selectedInspection = inspection;
  }

  selectInspector(inspector){
    this.selectedInspector = inspector;
  }

  onPageWillEnter(){
    this.adapterService.callAdapter("Inspections", "inspections", "GET", null).then( 
      (response) => {
        this.inspections = response;
      },
      (error) => {
        this.inspections = [
                  {
                    "id": "1",
                    "name": "The Owl & Firkin Pub",
                    "type": "FOOD",
                    "location": "5440 Yonge St, Toronto, ON",
                    "reason": "Regular inspection date reached. Inspection frequency: once per year",
                    "contactName": "Jimmy Jamison",
                    "contactPhone": "416-323-2121",
                    "status": "NOT_STARTED",
                    "startTime": "2014-07-01 15:16:17",
                    "duration": null,
                    "inspector": "1",
                    "incidents": []
                  }
                ];                
      }
    ).then(
      () => {
          this.adapterService.callAdapter("Inspectors", "inspectors", "GET", null).then( 
            (response) => {
              this.inspectors = response;
            },
            (error) => {
              this.inspectors = [
                {
                  "id": "1",
                  "icon": "http://maps.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png",
                  "username": "ian",
                  "location": "123 Front Street, Toronto, ON",
                  "name": "Ian Ingram",
                  "inspectionsRemaining": 2,
                  "inspectionsCompleted": 4,
                  "password": "password"
                },
                {
                  "id": "2",
                  "icon": "http://maps.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png",
                  "username": "rachel",
                  "location": "2803 Eglinton Ave E, Toronto, ON",
                  "name": "Rachel Wilson",
                  "inspectionsRemaining": 6,
                  "inspectionsCompleted": 3,
                  "password": "password"
                },
                {
                  "id": "3",
                  "icon": "http://maps.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png",
                  "username": "jimmy",
                  "location": "2133 Jane St, Toronto, ON",
                  "name": "Jimmy Jamison",
                  "inspectionsRemaining": 4,
                  "inspectionsCompleted": 1,
                  "password": "password"
                },
                {
                  "id": "4",
                  "icon": "http://maps.google.com/intl/en_us/mapfiles/ms/micons/orange-dot.png",
                  "username": "wendy",
                  "location": "861 Danforth Ave, Toronto, ON",
                  "name": "Wendy Williams",
                  "inspectionsRemaining": 2,
                  "inspectionsCompleted": 4,
                  "password": "password"
                }
              ];
            }
          );  
      }        
    );     
  }

  onResize(event){
    let rect = this.elementRef.nativeElement.querySelector(".leftColumn").getBoundingClientRect();
    this.columnHeight = (window.innerHeight - rect.top - 10);
  }  

}
