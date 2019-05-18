import { OnInit, Input, Component } from '@angular/core';
import { BchAddress } from 'src/app/classes/BCH/BchAddress';
import { BchPagedResponse } from 'src/app/classes/BCH/BchPagedResponse';
import { BchTransaction } from 'src/app/classes/BCH/BchTransaction';

@Component({
    selector: 'bch-results',
    templateUrl: './bch-results.component.html',
    styleUrls: ['./bch-results.component.css']
})

export class BchResultsComponent implements OnInit{
    @Input() bchAddress: BchAddress;
    @Input() bchTransaction: BchTransaction;
    @Input() bchTransactions: BchPagedResponse<BchTransaction[]>;

    constructor() {}

    ngOnInit() {
    }
}