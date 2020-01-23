import { Component, OnInit, Input } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { ApiService } from 'src/app/services/api.service';
import { Asset } from 'src/app/classes/ChainHunter/asset.class';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Severity, ResultType } from 'src/app/classes/Enums';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-address-detail',
  templateUrl: './address-detail.component.html',
  styleUrls: ['./address-detail.component.css']
})
export class AddressDetailComponent implements OnInit {
  @Input() blockchain: Blockchain;
  transactionsComplete: boolean = true;
  tokensComplete: boolean = true;
  tokenContent: string;
  saveThisMessage: string;
  loggedIn: boolean = false;
  @Input() saveId: string;
  @Input() addressSaved: boolean = false;
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
    this.searchUrl = `${location.origin}/search/${this.blockchain.symbol.toLowerCase()}/a/${this.blockchain.address.address}`;
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
              this.addressSaved = true;
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
              this.addressSaved = false;
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
      const message = `This ${this.blockchain.symbol} Address has been copied to the clipboard!`;
      this.addToast('notification-toast', Severity.success, 'Copied', message);
  }

  linkCopySuccess(event) {
      const message = `Direct search URL for this ${this.blockchain.symbol} Address has been copied to the clipboard!`;
      this.addToast('notification-toast', Severity.success, 'Copied', message);
  }

  onTxnsOpen(e: any) {
      if(e.index === 0) {
          if(this.blockchain.address.transactions === null || this.blockchain.address.transactions === undefined) {
            this.getAddressTxns();
          }
      } else if(e.index === 1) {
          if(this.blockchain.address.tokens === null || this.blockchain.address.tokens === undefined) {
            this.getAddressTokens();
          } else {
            this.buildTokens();
          }
      }
  }

  /**
   * Get Address transactions
   */
  getAddressTxns(): any {
    this.transactionsComplete = false;
    this.apiSvc.getAddressTransactions(this.blockchain.symbol, this.blockchain.address.address)
        .subscribe(txns => {
            this.blockchain.address.transactions = txns;
            this.transactionsComplete = true;
        });
  }

  /**
   * Get Address tokens
   */
  getAddressTokens(): any {
      this.tokensComplete = false;
      this.apiSvc.getAddressTokens(this.blockchain.symbol, this.blockchain.address.address)
          .subscribe(tokens => {
              this.tokensComplete = true;
              this.blockchain.address.tokens = tokens;
              this.buildTokens();
          });
  }

  /**
   * Build token display
   */
  buildTokens() {
      let i = 1;
      this.tokenContent = ``;
      this.blockchain.address.tokens.forEach(token => {            
          this.tokenContent += `<div class="p-col-12 p-md-6 p-lg-4"><div class="box token-format">` + this.getTokenInfo(token) + `</div></div>`;
          if(i === 3) {
              i = 1;
          } else {
              i++;
          }
      });

      while(i < 3) {
          i++;
          this.tokenContent += `<div class="p-col-12 p-md-6 p-lg-4"></div>`;
      }
  }

    /**
     * Get token information to display
     * 
     * @param token Token object
     */
    getTokenInfo(token: Asset): string {
        let info = ``;
        if(token.name !== null) {
            info += `<p>Name: ` + token.name + `</p>`;
        }
        if(token.symbol !== null || token.hasIcon) {
            info += `<p>`;
            if(token.symbol !== null) {
                info += `Symbol: ` + token.symbol;
            }
            if(token.hasIcon) {
                if(token.symbol !== null) {
                    info += `&nbsp;&nbsp;`;
                }
                info += `<img src="/assets/cryptoicons/color/` + token.symbol.toLowerCase() + `.png" />`;
            }
            info += `</p>`;
        }
        info += `<p>Quantity: ` + token.quantity + `</p>`;        

        return info;        
    }

}
