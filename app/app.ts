///<reference path="../plugins/cordova-plugin-mfp/typings/worklight.d.ts"/>
///<reference path="../plugins/cordova-plugin-mfp-jsonstore/typings/jsonstore.d.ts"/>
///<reference path="../plugins/cordova-plugin-mfp-push/typings/mfppush.d.ts"/>

import {Component, Renderer} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar, Network, Dialogs, Connection} from 'ionic-native';
import {LoginPage} from './pages/login/login'; 
import {StorageService} from './providers/storage-service/storage-service';
import {AdapterService} from './providers/adapter-service/adapter-service';
import {DataService} from './providers/data-service/data-service';

@Component({
  template: '<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>',
  providers: [StorageService, AdapterService, DataService]
})
export class InspectorApp {

  private rootPage:any;

  constructor(private platform:Platform, private renderer:Renderer, private storageService: StorageService) {
//    this.rootPage = LoginPage;
    renderer.listenGlobal("document", "wlInitComplete", () => this.mfpInitializationComplete());
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      // watch network for a disconnect
      let disconnectSubscription = Network.onDisconnect().subscribe(() => {
          console.log('network was disconnected :-( ')
      });

      // watch network for a connection
      let connectSubscription = Network.onConnect().subscribe(() => {
          console.log('network connected!');
          this.storageService.syncRequired().then(
              (syncRequired) => {
                  console.debug("Evaluating sync status: " + syncRequired ? "SYNC REQUIRED" : "SYNC NOT REQUIRED");
                  if (syncRequired){
                      this.storageService.synchronize().then(
                          () => {
                              console.debug("Offline storage synchronzied successfully");    
                              Dialogs.alert("Synchronization from offline storage completed successfully.", "Synchronization Complete", "Ok");
                          },
                          (error) => {
                              console.error("An error occurred while syncronizing offline storage");
                          }
                      )
                  }
              }
          )
          // We just got a connection but we need to wait briefly
          // before we determine the connection type.  Might need to wait
          // prior to doing any api requests as well.
          setTimeout(() => {
              console.log(Network.connection);
              if (Network.connection === Connection.WIFI) {
              console.log('we got a wifi connection, woohoo!');
              }
          });    
      });  
    });
  }

  mfpInitializationComplete() {
    console.log("MobileFirst Foundation initialized successfully.")
    this.rootPage = LoginPage;

    WL.Logger.config({ capture: true });
    WL.Logger.config({ level: 'TRACE' });
    WL.Logger.config({autoSendLogs: true});

    if (Network.connection != Connection.NONE && Network.connection != Connection.UNKNOWN){
        setInterval(function() {
            WL.Logger.send();
        }, 5000);
    }
    WL.Logger.updateConfigFromServer();

    // Connect to the server immediately to enable app management
    WLAuthorizationManager.obtainAccessToken().then(function(){
        MFPPush.initialize (
            function(successResponse) {
                console.log("MFP Push successfully intialized: " + JSON.stringify(successResponse));
                MFPPush.registerNotificationsCallback(function(content){
                console.log("Push notification received: %o", content);
                });
                WLAuthorizationManager.obtainAccessToken("push.mobileclient").then(function(){
                MFPPush.registerDevice({"phoneNumber":""},
                    function(successResponse) {
                        console.log("MFP Push - Device successfully registered");
                    },
                    function(failureResponse) {
                        console.log("MFP Push - Device failed to register: " + JSON.stringify(failureResponse));
                    }
                );              
                });
            },
            function(failureResponse) {
                console.log("MFP Push failed to initialize: " + JSON.stringify(failureResponse));
            }
        );      
    });
  }
}

Array.prototype["findByProperty"] = function(property, value){
  for (let i=0; i<this.length; i++){
    if (this[i][property] === value){
      return this[i];
    }
  }
  return null;
}
Array.prototype["findById"] = function(id){
  return this.findByProperty("id", id);
}
Array.prototype["replaceById"] = function(item, id){
  return this.replaceByProperty(item, "id", id); 
}
Array.prototype["replaceByProperty"] = function(item, property, value){
  for (let i=0; i<this.length; i++){
    if (this[i][property] === value){
      this.splice(i, 1, item);
    }
  }
}
function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
ionicBootstrap(InspectorApp)
