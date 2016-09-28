import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import {Page, NavController, Modal, ViewController, NavParams, Toast} from 'ionic-angular';
import {AdapterService} from '../../providers/adapter-service/adapter-service';
import * as moment from 'moment';
import { CHART_DIRECTIVES } from 'angular2-highcharts';

//import {GOOGLE_MAPS_DIRECTIVES} from 'angular2-google-maps/core';

declare var Paho:any;

@Component({
  selector: 'sensor-modal',
  templateUrl: 'build/components/sensor-modal/sensor-modal.html',
  directives: [CHART_DIRECTIVES] // GOOGLE_MAPS_DIRECTIVES]
})
export class SensorModal {
    
  @ViewChild('content') content; 
  
  inspection: any;
  options: any;
  loading: boolean = true;
  loadingError: string = "";
  chart: any;
  client: any;
  pointsAdded: number = 0;
  sensorData: Array<[Number, Number]>;
    
  constructor(private viewCtrl: ViewController, private _adapterService:AdapterService, private ngZone: NgZone, navParams: NavParams) {
  }
  
  ngAfterViewInit(){
    // Create a client instance
    if (!this.client){
      this.client = new Paho.MQTT.Client("hvulhy.messaging.internetofthings.ibmcloud.com", 1883, "a:hvulhy:mery194ajr");
    }

    var __this = this;

    // set callback handlers
    this.client.onConnectionLost = 
      (responseObject) => {
        console.log("onConnectionLost");        
        if (responseObject && responseObject.errorCode !== 0) {
          console.log("onConnectionLost:"+responseObject.errorMessage);
        }
      };
    this.client.onMessageArrived = 
      (message) => {
        console.log("onMessageArrived:"+message.payloadString);
        let payload = JSON.parse(message.payloadString);
        let chartSeries = __this.chart.get("temperatureSeries");
        chartSeries.addPoint([moment().add(__this.pointsAdded++, "day").toDate().getTime(), payload.d.temp]);
      }

    // connect the client
    this.client.connect({userName: "a-hvulhy-mery194ajr", password: "@)D9R_&r8zThp94?Kk",
      onSuccess: function(){
        console.log("onConnect");
        __this.client.subscribe("iot-2/type/Thermostat-Dept-Sporting-Goods/id/Thermostat-Dept-Sporting-Goods/evt/update/fmt/json");
      }
    });   

    this._adapterService.callApi("/api/sensors", "GET", null, null).then(
      (sensorDataFromDB) => {
        this.ngZone.run(() => {
          this.sensorData = [];
          for (var i=0; i<sensorDataFromDB.length; i++){
            this.sensorData.push([moment().subtract(sensorDataFromDB.length - i, "days").subtract(5, "hours").toDate().getTime(), 
                                  sensorDataFromDB[i].payload.d.temp]);
          }

          this.options = {
              chart: {  type: 'areaspline'},
              title: {  text: ''},
              xAxis: {
                  type: 'datetime',
                  dateTimeLabelFormats: {month: '%e. %b',  year: '%b'}
              },
              yAxis: {
                  title: {  text: 'Temperature (C)'}
              },
              tooltip: { shared: true, valueSuffix: ' (C)'},
              credits: { enabled: false},
              plotOptions: {
                  areaspline: {
                      fillOpacity: 0.5
                  }
              },
              series: [{
                  id: "temperatureSeries",
                  name: 'Store Temperature',
                  data: this.sensorData
              }]
          };          
          this.loading = false;
          this.loadingError = "";
        });
      },
      (error) => {
        this.ngZone.run(() => {
         this.loading = false;
         this.loadingError = "Something went wrong loading the list of temperature sensor values. Sorry! :(";
        });        
      }
    )    
  }

  saveInstance(chartInstance){
    this.chart = chartInstance;
  }    

  dismiss() {
    this.client.disconnect();
    this.viewCtrl.dismiss();
  }
}