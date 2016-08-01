import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

/*
  Generated class for the AdapterService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AdapterService {

  callAdapter (adapterName:string, path:string, verb:string, content: any): Promise<any> {
    verb = verb.toUpperCase();
    let rrVerb = verb === "GET" ? WLResourceRequest.GET : (verb === "POST" ? WLResourceRequest.POST : (verb === "PUT" ? WLResourceRequest.PUT : (verb === "DELETE" ? WLResourceRequest.DELETE : "")));
    var resourceRequest = new WLResourceRequest("/adapters/" + adapterName + "/" + path, rrVerb);
    resourceRequest.addHeader("Content-type", "application/json");
    
    return new Promise(
          (resolve, reject) => {
            resourceRequest.send(content).then(
              (response) => {
                resolve(response.responseJSON);
              },
              (error) => {
                console.error("ERROR calling adapter: %o", error);
                reject(error);
              }
            );
          }
    );
  }  

  callApi (apiPath:string, verb:string, queryParams: Array<{key: String, value: String}>, content: any): Promise<any> {
    let apiInvocationRequest = {
      httpVerb: verb.toUpperCase(),
      apiUrl: apiPath,
      data: content,
      queryParams: queryParams
    }
    var resourceRequest = new WLResourceRequest("/adapters/APIAdapter/callAPI", "POST");
    resourceRequest.addHeader("Content-type", "application/json");
    
    return new Promise(
          (resolve, reject) => {
            resourceRequest.send(apiInvocationRequest).then(
              (response) => {
                resolve(response.responseJSON);
              },
              (error) => {
                console.error("ERROR calling API: %o", error);
                reject(error);
              }
            );
          }
    );    
  }   
}

