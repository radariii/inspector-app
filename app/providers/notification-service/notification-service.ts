import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class NotificationService {

  public eventEmitter:EventEmitter<any> = new EventEmitter();
  eventCount: number = 0;

  constructor() {
  	// Called when we receive an inspection action from the watch (via the iOS app)
    WL.App.addActionReceiver("inspectionAction", 
      (inspectionData: any) => {
        console.error("FROM WEB: inspectionData = " + JSON.stringify(inspectionData));
        //$rootScope.$broadcast("inspectionWatchAction", inspectionData.data);
        this.eventEmitter.emit(inspectionData.data);
      }
    );    
  }

  sendToWatch(data) {
		data.sequence = this.eventCount++;
		data.direction = "Web to phone to watch";
		WL.App.sendActionToNative("inspectionAction", data);    
  }

}

