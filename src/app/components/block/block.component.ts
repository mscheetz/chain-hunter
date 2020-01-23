import { Component, OnInit, Input } from '@angular/core';

import { OverlayPanel } from 'primeng/overlaypanel';
import { MessageService } from 'primeng/api';

import { Severity, ResultType } from 'src/app/classes/Enums';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoginService } from 'src/app/services/login.service';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { Block } from 'src/app/classes/ChainHunter/block.class';
import { SearchService } from 'src/app/services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.css']
})
export class BlockComponent implements OnInit {
  @Input() blockchain: Blockchain;
  @Input() block: Block;
  transactionsComplete: boolean = true;
  tokensComplete: boolean = true;
  tokenContent: string;
  saveThisMessage: string;
  loggedIn: boolean = false;
  @Input() saveId: string;
  @Input() blockSaved: boolean = false;
  searchUrl: string;

  constructor(private apiSvc: ApiService, 
              private messageSvc: MessageService, 
              private authSvc: AuthenticationService, 
              private loginSvc: LoginService,
              private searchSvc: SearchService,
              private router: Router) { 
    this.authSvc.isLoggedIn.subscribe(val => {
      this.loggedIn = val
    });
  }

  ngOnInit() {
    this.searchUrl = `${location.origin}/search/${this.blockchain.symbol.toLowerCase()}/b/${this.block.blockNumber}`;
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
      } else if (type === ResultType[ResultType.block]) {
          objType = ResultType.block;
          hash = this.block.blockNumber.toString();
      } else if (type === ResultType[ResultType.contract]) {
          objType = ResultType.contract;
          hash = this.blockchain.contract.address;
      } else if (type === ResultType[ResultType.transaction]) {
          objType = ResultType.transaction;
          hash = this.blockchain.transaction.hash;
      }
      this.apiSvc.saveData(hash, this.blockchain.symbol, objType)
          .subscribe(res => {
              this.blockSaved = true;
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
      } else if (type === ResultType[ResultType.block]) {
          objType = ResultType.block;
          hash = this.block.blockNumber.toString();
      } else if (type === ResultType[ResultType.contract]) {
          objType = ResultType.contract;
          hash = this.blockchain.contract.address;
      } else if (type === ResultType[ResultType.transaction]) {
          objType = ResultType.transaction;
          hash = this.blockchain.transaction.hash;
      }
      this.apiSvc.deleteData(this.saveId)
          .subscribe(res => {
              this.blockSaved = false;
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

  onTxnsOpen(e: any) {
      if(e.index === 0) {
          if(this.block.transactions === null || this.block.transactions === undefined) {
            this.getTransactions();
          }
      }
  }

  /**
   * Get Block transactions
   */
  getTransactions(): any {
    this.transactionsComplete = false;
    this.apiSvc.getBlockTransactions(this.blockchain.symbol, this.block.blockNumber)
        .subscribe(txns => {
            this.block.transactions = txns;
            this.getVolume();
            this.transactionsComplete = true;
        });
  }

  getVolume() {            
    if (this.block.transactions === null || this.block.transactions.length === 0 || 
        this.block.transactionCount !== this.block.transactions.length) {
        return;
    }
    if(!this.block.transactionCount) {
        this.block.transactionCount = this.block.transactions.length;
    }
    let volume = 0;
    this.block.transactions.forEach(txn => {
        if(typeof txn.tos !== 'undefined') {
            for(let i = 0; i < txn.tos.length; i++) {
                if(txn.tos[i].symbol === this.blockchain.symbol) {
                    let quantity = txn.tos[i].quantity.toString().replace(/,/g, "");
                    volume += +quantity;
                }
            }
        }
      });
    this.block.volume = volume;
  }

  linkCopySuccess(event) {
      const message = `Direct search URL for this ${this.blockchain.symbol} Block has been copied to the clipboard!`;
      this.addToast('notification-toast', Severity.success, 'Copied', message);
  }

  getAddress(address: string) {
    this.routeCheck(ResultType.address, address);
  }

  routeCheck(type: ResultType, searcher: string) {
    if(this.router.url === "/hunts") {
      let itemType = type === ResultType.address ? 'a' 
                   : type === ResultType.block ? 'b'
                   : type === ResultType.contract ? 'c'
                   : 't';
      this.router.navigate([`/search/${this.blockchain.symbol.toLowerCase()}/${itemType}/${searcher}`]);
    }
    this.searchSvc.setSearchSpec(this.blockchain.symbol, type, searcher);
  }
}
