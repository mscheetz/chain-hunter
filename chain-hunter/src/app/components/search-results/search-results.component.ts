import { OnInit, Input, Component, Output, EventEmitter } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';

@Component({
    selector: 'search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.css']
})

export class SearchResultsComponent implements OnInit{
    @Input() blockchain: Blockchain;
    @Input() transactionsComplete: boolean;
    @Input() tokensComplete: boolean;
    @Input() huntStatus: number = 0;
    @Output() getTransactions: EventEmitter<any> = new EventEmitter();
    @Output() getTokens: EventEmitter<any> = new EventEmitter();
    @Input() selectedChain: string;

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

}