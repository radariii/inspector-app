import { Component, NgZone } from '@angular/core';
import { MediaPlugin, File } from 'ionic-native';
import { Page, NavController, ViewController, NavParams } from 'ionic-angular';

declare var cordova: any;
declare var LocalFileSystem: any;
declare var window: any;

@Component({
  selector: 'recording-modal',
  templateUrl: 'build/components/recording-modal/recording-modal.html'
})
export class RecordingModal {
    
  isRecording: boolean = false;
  isProcessing: boolean = false;
  isPulsing: boolean = false;
  isComplete: boolean = false;
  recordingCancelled: boolean = false;
  mediaRec: MediaPlugin;
  pulsingInterval: any;
  result: any;
  serverUrl: String;
  textOnly: boolean = false;
  submissionText: String = "";
  incident: any;
  fs: any;

  sentimentScores: any = {anger: 0, disgust: 0, fear: 0, joy: 0, sadness: 0};
      
  constructor(private viewCtrl: ViewController, private ngZone: NgZone, navParams: NavParams) {
    this.incident = navParams.get("incident");
    WL.App.getServerUrl((serverUrl) => this.serverUrl = serverUrl);
    // window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, (fs) => {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
        this.fs = fs;
    }, 
    (error) => {
      console.error("Error accessing filesystem: " + error);
    });
    this.textOnly = navParams.get("textMode");
    //this.textOnly = window.device.isVirtual;
    this.submissionText = (this.incident && this.incident.name ? this.incident.name + ". " + this.incident.description : "");
  }
  
  ngAfterViewInit(){  
  }
  
  submitText() {
    this.isProcessing = true;
    this.isComplete = false;
    this.callCognitiveAPI("application/json", JSON.stringify({text: this.submissionText}));
  }

  processSentimentResponse(response){
    return {
      anger: response.document_tone.tone_categories[0].tones[0].score,
      disgust: response.document_tone.tone_categories[0].tones[1].score,
      fear: response.document_tone.tone_categories[0].tones[2].score,
      joy: response.document_tone.tone_categories[0].tones[3].score,
      sadness: response.document_tone.tone_categories[0].tones[4].score
    }
  }

  record(){

    if (this.mediaRec){
      this.mediaRec.stopRecord();
      this.isProcessing = true;
      this.isPulsing = false;
      clearInterval(this.pulsingInterval);
      return;
    }

    this.isComplete = false;
    this.isProcessing = false;
    this.isRecording = true;
    this.isPulsing = true;
    this.pulsingInterval = setInterval(() => {
      this.isPulsing = !this.isPulsing;
    }, 750);    
    this.sentimentScores = {anger: 0, fear: 0, disgust: 0, joy: 0, sadness: 0}

    var src = "incident.wav";
		this.mediaRec = new MediaPlugin(src);
		this.mediaRec.init.then(
			() => {
        if (!this.recordingCancelled){
          console.log("recordAudio():Audio Success: " + this.mediaRec);
          var __this = this;

          // Load the File
          window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "/incident.wav",
          //this.fs.root.getFile(cordova.file.dataDirectory + "incident.wav" , { create: false, exclusive: false },
            (fileEntry) => {
              fileEntry.file((file) => {
                var reader = new FileReader();
                reader.onloadend = (event: any) => {
                    console.log("Successfully read file: " + event.target.result);
                    var blob = new Blob([new Uint8Array(event.target.result)], { type: "audio/wav" });
                    this.callCognitiveAPI("audio/wav", blob);
                };
                reader.readAsArrayBuffer(file);
              }, 
              (error) => {
                console.error("An error occurred get the file from the fileEntry: " + error);
              });              
            }, 
            (error) => {
              console.error("error creating file: " + error);
            }
          );          

        } else {
          this.isComplete = false;
          this.isProcessing = false;
          this.isRecording = false;
          this.mediaRec = null;
          this.viewCtrl.dismiss();
        }
			},
			(error) => {
				console.log("recordAudio():Audio Error: " + JSON.stringify(error));
        this.mediaRec = null;
        this.isComplete = false;
        this.isRecording = false;
        this.isProcessing = false;
        this.isPulsing = false;
        clearInterval(this.pulsingInterval);
			}
		);
		this.mediaRec.startRecord();

  }

  callCognitiveAPI(contentType, data){
    // Now send the blob to the Watsonian Institute for Higher Education
    var xhttp = new XMLHttpRequest();
    var __this = this;
    xhttp.open("POST", this.serverUrl + "/adapters/APIAdapter/callCognitiveAPI?continuous=true", true);
    xhttp.setRequestHeader("Content-type", contentType);
    xhttp.onreadystatechange = (event: any) => {
      if (event.currentTarget.readyState == 4 && event.currentTarget.status == 200) {
        var response = JSON.parse(event.currentTarget.responseText);
        __this.sentimentScores = __this.processSentimentResponse(response);
        __this.result = __this.processSentiment(__this.sentimentScores, response.sentences);                          
        __this.isProcessing = false;
        __this.isRecording = false;
        __this.isComplete = true;
        __this.mediaRec = null;
      }
    };
    xhttp.send(data);        
  }

  processSentiment(sentimentScores, sentences){
    var result:any = {};
    var parsingDescription = false;
    var defaultTitle = "", defaultDescription = "";
    for (var i=0; i<sentences.length; i++){
      // By default, take the first sentence as the title, and the rest as description, unless there is only one sentence
      if (i == 0){
        defaultTitle = sentences[i];
        defaultDescription += sentences[i];
      } else if (i == 1){
        defaultDescription = sentences[i];
      } else {
        defaultDescription += ". " + sentences[i];
      }
      if (sentences[i].toLowerCase() == "title" && sentences.length >= i+2){
        i += 1;
        result.name = sentences[i];
        parsingDescription = false;
      } else if (sentences[i].toLowerCase() == "description" && sentences.length >= i+2){
        i += 1;
        result.description = sentences[i];
        parsingDescription = true;
      } else if (parsingDescription){
        // We are still adding to the description, since there can be multiple sentences.
        result.description += ". " + sentences[i];
      }
    }

    var sevNum = Math.max(sentimentScores.anger, sentimentScores.disgust, sentimentScores.fear, sentimentScores.sadness);

    result.name = result.name ? result.name : defaultTitle;
    result.description = (result.description ? result.description : defaultDescription) + ".";
    result.severity = sevNum > 0.6 ? "HIGH" : (sevNum > 0.35 ? "MEDIUM" : "LOW");
    return result;
  }

  cancelRecording(){
    this.isComplete = false;
    this.isProcessing = false;
    this.isRecording = false;
    this.isPulsing = false;
    clearInterval(this.pulsingInterval);

    if (this.mediaRec){
      this.recordingCancelled = true;
      this.mediaRec.stopRecord();
    } else {
      this.viewCtrl.dismiss();
    }
  }

  finish(){
    this.viewCtrl.dismiss(this.result);
  }

}