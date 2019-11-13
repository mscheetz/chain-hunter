import { Component, OnInit, Input } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ResultType, Severity } from 'src/app/classes/Enums';
import { ApiService } from 'src/app/services/api.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent implements OnInit {
  @Input() blockchain: Blockchain;
  @Input() contractSaved: boolean = false;
  @Input() saveId: string;
  saveThisMessage: string;
  loggedIn: boolean;

  constructor(private apiSvc: ApiService, 
              private messageSvc: MessageService, 
              private authSvc: AuthenticationService, 
              private loginSvc: LoginService) { 
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
  }

  ngOnInit() {
  }

  saveHover(event, type: string, overlayPanel: OverlayPanel) {
      this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
    //this.saveThisMessage = "Coming Soon! Save this " + this.blockchain.symbol + " " + type;
    
    overlayPanel.toggle(event);
  }

  saveResult(event, type: string) {
      if(!this.loggedIn) {
          this.loginSvc.toggleLogin();
          this.addToast('notification-toast', Severity.warn, 'Login', 'You must login before saving results', 5000);
          return;
      }
      let hash = "";
      let objType: ResultType = ResultType.none;
      if(type === ResultType[ResultType.address]) {
          objType = ResultType.address;
          hash = this.blockchain.address.address;
      } else if (type === ResultType[ResultType.contract]) {
          objType = ResultType.contract;
          hash = this.blockchain.contract.address;
      } else if (type === ResultType[ResultType.transaction]) {
          objType = ResultType.transaction;
          hash = this.blockchain.transaction.hash;
      }
      this.apiSvc.saveData(hash, this.blockchain.symbol, objType)
          .subscribe(res => {
              this.contractSaved = true;
              this.saveId = res;
              const message = `${this.blockchain.symbol} ${type} saved!`;
              this.addToast('notification-toast', Severity.success, 'Saved', message, 5000);
          }, err => {
              const message = `Something happened when attempting to save this ${objType.toString()}`;
              this.addToast('notification-toast', Severity.error, 'Error', message, 5000);
          })

  }

  unSaveResult(event, type: string) {
      if(!this.loggedIn) {
          this.loginSvc.toggleLogin();
          this.addToast('notification-toast', Severity.warn, 'Login', 'You must login before un-saving results', 5000);
          return;
      }
      let hash = this.blockchain.contract.address;
      let objType: ResultType = ResultType.contract;
      
      this.apiSvc.deleteData(this.saveId)
          .subscribe(res => {
              this.contractSaved = false;
              const message = `${this.blockchain.symbol} ${type} un-saved!`;
              this.addToast('notification-toast', Severity.success, 'Un-Saved', message, 5000);
          }, err => {
              const message = `Something happened when attempting to un-save this ${objType.toString()}`;
              this.addToast('notification-toast', Severity.error, 'Error', message, 5000);
          })
  }

  addToast(key: string, severity: Severity, summary: string, message: string, life: number = 5000){
      const severityString = Severity[severity];
      this.messageSvc.add(
          {
              key: key,
              severity: severityString, 
              summary: summary, 
              detail: message,
              life: life
          });
  }
}
