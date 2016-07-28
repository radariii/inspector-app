import { Injectable } from '@angular/core';

declare var WLResourceRequest: any;

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
}

