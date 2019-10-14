import { OnInit, Input, Component, Output, EventEmitter } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { Chain } from 'src/app/classes/ChainHunter/Chain';
import { OverlayPanel } from 'primeng/overlaypanel';

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
    saveThisMessage: string;

    constructor() {}

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

    saveClick(event, type: string, overlayPanel: OverlayPanel) {
      this.saveThisMessage = "Coming Soon! Save this " + this.blockchain.symbol + " " + type;
      
      overlayPanel.toggle(event);
    }
}