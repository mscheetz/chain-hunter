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
    @Output() txnsGetter: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {
    }

    onTxnsOpen(e: any) {
        if(e.index === 0) {
            if(this.blockchain.address.transactions === null || this.blockchain.address.transactions === undefined) {
                this.txnsGetter.emit(this.blockchain.symbol);
            }
        }
    }

}