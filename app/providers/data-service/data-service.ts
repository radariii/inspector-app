import { Injectable, NgZone } from '@angular/core';
import { Connection, Network } from 'ionic-native';
import 'rxjs/add/operator/map';
import { AdapterService } from '../adapter-service/adapter-service';
import { StorageService } from '../storage-service/storage-service';

/*
  Generated class for the inspectionservice provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DataService {
  inspections: any;

  constructor(private _adapterService: AdapterService, private _storageService: StorageService) {
    this.inspections = [];
  }

  load(refreshFromServer: boolean = false) {
    if (this.inspections && this.inspections.length > 0 && !refreshFromServer) {
      // already loaded data
      return Promise.resolve(this.inspections);
    }

    // We don't have the data yet, or a forced refresh is requested    
    return new Promise((resolve, reject) => {
      if (Network.connection == Connection.NONE){ // || Network.connection == Connection.UNKNOWN){
        // No network connection, so loading from local storage is the best we can do!
        this._storageService.loadFromOfflineStorage().then(
          (offlineinspections) => {
            this.inspections = offlineinspections;
            resolve(this.inspections);
          },
          (error) => {
            reject(error);
          }
        )      
      } else {
        //this._adapterService.callAdapter("Inspections", "inspections", "GET", null).then(
        this._adapterService.callApi("/api/inspections", "GET", null, null).then( 
          (response) => {
            this.inspections = response;
            this._saveOffline(this.inspections, false).then(() => resolve(this.inspections), (error) => reject(error)); 
          },
          (error) => {
            reject(error);
// TESTING
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
                  "lat": 51.65,
                  "lng": 7.82,
                  "incidents": []
                },
                {
                  "id": "2",
                  "name": "The Snooty Fox",
                  "type": "FOOD",
                  "location": "5440 Yonge St, Toronto, ON",
                  "reason": "Regular inspection date reached. Inspection frequency: once per year",
                  "contactName": "Jimmy Jamison",
                  "contactPhone": "416-323-2121",
                  "status": "NOT_STARTED",
                  "startTime": "2014-07-01 15:16:17",
                  "duration": null,
                  "inspector": "1",
                  "lat": 51.62,
                  "lng": 7.84,
                  "incidents": []
                }                  
              ]
// TESTING END
          }
        );     
      }     
    });
  }

  // Save the inspections
  saveAll(inspections:any, localOnly: boolean = false){
    return new Promise((resolve, reject) => {
      this.inspections = inspections;
      if (localOnly || Network.connection == Connection.NONE || Network.connection == Connection.UNKNOWN){
        this._saveOffline(inspections, true).then(() => resolve(), (error) => reject(error));
      } else {
        // Try to save to the server first
        //this._adapterService.callAdapter("Inspections", "inspections", "POST", inspections).then(
        this._adapterService.callApi("/api/inspections", "POST", null, inspections).then(  
          (response) => {
            this._saveOffline(inspections, false).then(() => resolve(), (error) => reject(error));
          }, 
          (adapterError) => {
            // Don't throw an error... but mark dirty since we were only able to save locally
            return this._saveOffline(this.inspections, true);
          }
        );        
      }
    });
  }

  save(inspection:any, localOnly: boolean = false){
    return new Promise((resolve, reject) => {
      this.inspections.replaceById(inspection, inspection.id);
      if (localOnly || Network.connection == Connection.NONE || Network.connection == Connection.UNKNOWN){
        this._saveOffline(inspection, true).then(() => resolve(), (error) => reject(error));
      } else {
        // Try to save to the server first
        //this._adapterService.callAdapter("Inspections", "inspection/" + inspection.id, "PUT", inspection).then(
        this._adapterService.callApi("/api/inspections/" + inspection.id, "PUT", [], inspection).then(
          (response) => {
            this._saveOffline(inspection, false).then(() => resolve(), (error) => reject(error));
          }, 
          (adapterError) => {
            // Don't throw an error... but mark dirty since we were only able to save locally
            return this._saveOffline(inspection, true);
          }
        );        
      }      
    });
  }  

  _saveOffline(itemOrItems, markDirty){
    return new Promise((resolve, reject) => {    
      this._storageService.storeInOfflineStorage(itemOrItems, markDirty).then(
        () => {
            resolve();
        },
        (error) => {
          reject(error);
        }
      )
    });
  }
}

