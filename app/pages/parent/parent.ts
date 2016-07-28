
export class ParentPage {

  static fromPage: string;
  toPage: string;
  
  constructor(pageName:string) {
      this.toPage = pageName;
  }

  ionViewWillLeave(){
    ParentPage.fromPage = this.toPage;
  }
  
  onPageDidEnter(){
    WL.Logger.debug("[did enter] from = " + ParentPage.fromPage + ", to = " + this.toPage);  
    WL.Analytics.log({"fromPage": ParentPage.fromPage, "toPage": this.toPage});
    WL.Analytics.send();
  }
}
