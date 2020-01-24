import { Component, OnInit, Input } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { ResultType, Severity } from 'src/app/classes/Enums';
import { ApiService } from 'src/app/services/api.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() blockchain: Blockchain;
  @Input() transactionSaved: boolean = false;
  @Input() saveId: string;
  saveThisMessage: string;
  loggedIn: boolean = false;
  searchUrl: string;

  constructor(private apiSvc: ApiService, 
              private messageSvc: MessageService, 
              private authSvc: AuthenticationService, 
              private loginSvc: LoginService) { 
    this.authSvc.isLoggedIn.subscribe(val => {
      this.loggedIn = val
    });
  }

  ngOnInit() {
    this.searchUrl = `${location.origin}/search/${this.blockchain.symbol.toLowerCase()}/t/${this.blockchain.transaction.hash}`;
  }

  saveHover(event, type: string, overlayPanel: OverlayPanel) {
    this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
  
    overlayPanel.toggle(event);
  }

  unSaveHover(event, type: string, overlayPanel: OverlayPanel) {
    this.saveThisMessage = "Un-save this " + this.blockchain.symbol + " " + type;
  
    overlayPanel.toggle(event);
  }

  saveResult(event, type: string) {
    if(!this.loggedIn) {
        this.loginSvc.toggleLogin();
        this.addToast('notification-toast', Severity.warn, 'Login', 'You must login before saving results', 5000);
        return;
    }
    let hash = "";
    let objType: ResultType = ResultType.nothing;
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
            this.transactionSaved = true;
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
    let hash = "";
    let objType: ResultType = ResultType.nothing;
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
    this.apiSvc.deleteData(this.saveId)
        .subscribe(res => {
            this.transactionSaved = false;
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

  copySuccess(event) {
      const message = `This ${this.blockchain.symbol} Transaction Hash has been copied to the clipboard!`;
      this.addToast('notification-toast', Severity.success, 'Copied', message);
  }

  linkCopySuccess(event) {
      const message = `Direct search URL for this ${this.blockchain.symbol} Transaction has been copied to the clipboard!`;
      this.addToast('notification-toast', Severity.success, 'Copied', message);
  }
}
