import { Component, ViewChild } from '@angular/core';
import { ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { AdapterService } from './providers/adapter-service/adapter-service';

import { MainPage } from './pages/main/main';

declare var WL: any;
declare var ibmmfpfanalytics: any;

@Component({
  templateUrl: 'build/app.html',
  providers: [AdapterService]
})
class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = MainPage;

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

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
Array.prototype["findByName"] = function(name){
  return this.findByProperty("name", name);
}

var wlInitOptions = {
    mfpContextRoot : '/mfp', 
    applicationId : 'com.ibm.inspector.headquarters' 
};

WL.Client.init(wlInitOptions).then (
    function() {
        console.debug("MFP is ready for action! location = " + window.location);
        ibmmfpfanalytics.addEvent({'SessionStarted':1});
        ibmmfpfanalytics.addEvent({'SessionID': new Date().getTime()});
        setInterval(function() {
          try {
            ibmmfpfanalytics.send();
          } catch (e){

          }
        }, 5000);
    }
);

ionicBootstrap(MyApp);
