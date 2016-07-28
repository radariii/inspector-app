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

  private extractData(response: any){
      return response.responseJSON;
  }
  
  private handleError(err: any, source: Observable<any>, caught: Observable<any>) : Observable<any> {
      console.error("ERROR calling adapter: %o", err);
      return caught;
  }
}

