import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {AdapterService} from '../adapter-service/adapter-service';
import 'rxjs/add/operator/map';

/*
  Generated class for the StorageService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class StorageService {

  observable: Observable<boolean>;
  observer: Observer<boolean>;
  
  constructor(private _adapterService: AdapterService) {
      this.observable = Observable.create(
          (observer) => {
              this.observer = observer   
          }
      );
  }

  initializeOfflineStorage() {
      // Initialize the offline storage
      var collections = { inspections: { searchFields: { id: 'integer' } } };
      var __this = this;
      return WL.JSONStore.init(collections).then(
          (collections) => {
              console.log("Offline storage initialized successfully");
              __this.syncRequired().then(
                  (syncRequired) => {
                      console.debug(syncRequired ? "SYNC REQUIRED" : "SYNC NOT REQUIRED");
                  }
              )
          },
          (error) => {
              console.error("Failed to initalize offline storage");
          }
      );
  }

  loadFromOfflineStorage(): WLPromise {
    return WL.JSONStore.get("inspections").findAll({}).then(
      (results: any) => {
        console.log("Successfully retrieved inspections from offline storage: %o", results);
        let inspections = [];
        for (var i=0; i<results.length; i++){
          inspections.push(results[i].json);
        }
        return inspections;
      }, 
      (error) => {
        console.error("Failed to retrieve inspections from offline storage");
      }
    )        
  }
  
  storeInOfflineStorage(inspections: any, markDirty: boolean): WLPromise {
      let query = inspections.id ? {id: inspections.id} : {};
      return WL.JSONStore.get("inspections").remove(query, {markDirty: markDirty}).then(
          (numDocsRemoved) => {
              console.log("Successfully removed " + numDocsRemoved + " documents from offline storage");
              return WL.JSONStore.get("inspections").add(inspections, {markDirty: markDirty}).then(
                  () => {
                      console.log("Successfully replaced inspections in offline storage.");
                      if (markDirty){
                          this.observer.next(true);
                      }
                  },
                  (error) => console.error("Error replacing inspections in offline storage: " + JSON.stringify(error))
              );
          },
          (error) => console.error("Error removing inspections from offline storage: " + JSON.stringify(error))
      );

  }
  
  syncRequired() {
      return WL.JSONStore.get("inspections").getAllDirty({}).then(
          (dirtyDocuments) => {
              console.debug("Dirty documents: " + dirtyDocuments.length);
              return (!!dirtyDocuments && dirtyDocuments.length > 0);
          },
          (error) => {
              console.error("An error occurred retrieving the dirty documents from offline storage");
              return false;
          }
      )
  }
  
  watchSyncState(): Observable<boolean> {
      return this.observable;
  }
  
  synchronize() {
      return new Promise(
          (resolve, reject) => {
              this.loadFromOfflineStorage().then(
                  (inspections) => {
                      this._adapterService.callAdapter("inspections", "inspections", "PUT", JSON.stringify(inspections))
                      .then( response => {
                          WL.JSONStore.get("inspections").getAllDirty({}).then(
                              (dirtyDocuments) => {
                                  WL.JSONStore.get("inspections").markClean(dirtyDocuments, {}).then(
                                      () => {
                                          console.debug("Synchronization complete.");
                                          this.observer.next(false);
                                          resolve();
                                      },
                                      (error) => {
                                          console.error("An error occurred while marking the dirty documents clean");
                                          reject(error);
                                      }
                                  );
                              },
                              (error) => {
                                  console.error("An error occurred while getting the dirty documents to mark clean");
                                  reject();
                                  return false;
                              }
                          )
                      });     
                  },
                  (error) => {
                      console.error("An error occurred while synchronizing the inspections to the server");
                      reject();
                  }
              )
              
          }
      )
  }  
}

