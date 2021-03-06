import { OnInit, Input, Component, Output, EventEmitter } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { Chain } from 'src/app/classes/ChainHunter/chain.class';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ApiService } from 'src/app/services/api.service';
import { MessageService } from 'primeng/api';
import { ResultType, Severity } from 'src/app/classes/Enums';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
    selector: 'search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.css']
})

export class SearchResultsComponent implements OnInit{
    @Input() activeChains: Chain[];
    @Input() blockchain: Blockchain;
    @Input() transactionsComplete: boolean;
    @Input() tokensComplete: boolean;
    @Input() huntStatus: number = 0;
    @Output() getTransactions: EventEmitter<any> = new EventEmitter();
    @Output() getTokens: EventEmitter<any> = new EventEmitter();
    @Input() selectedChain: string;
    @Input() resultsFound: string[];
    @Input() tokenContent: string;
    loggedIn: boolean;
    saveThisMessage: string;

    constructor(private apiSvc: ApiService, 
                private messageSvc: MessageService, 
                private authSvc: AuthenticationService,
                private loginSvc: LoginService) {
                    authSvc.getLoggedInStatus().subscribe(val => {
                        this.loggedIn = val;
                    })
                }

    ngOnInit() {
    }

    onTxnsOpen(e: any) {
        if(e.index === 0) {
            if(this.blockchain.address.transactions === null || this.blockchain.address.transactions === undefined) {
                this.getTransactions.emit(this.blockchain.symbol);
            }
        } else if(e.index === 1) {
            if(this.blockchain.address.tokens === null || this.blockchain.address.tokens === undefined) {
                this.getTokens.emit(this.blockchain.symbol);
            }
        }
    }
    saveAddress(event) {
        console.log('You want to save an address');
    }

    saveHover(event, type: string, overlayPanel: OverlayPanel) {
        this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
      
      overlayPanel.toggle(event);
    }

    saveResult(event, type: string) {
        if(!this.loggedIn) {
            this.loginSvc.toggleLogin();
            this.messageSvc.add(
                {
                    key:'login-toast',
                    severity:'warn', 
                    summary:'Login', 
                    detail: 'You must login before saving results',
                    life: 5000
                });
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
                const message = `${this.blockchain.symbol} ${type} saved!`;
                this.addToast('notification-toast', Severity.success, 'Saved', message, 5000);
            }, err => {
                const message = `Something happened when attempting to save this ${objType.toString()}`;
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