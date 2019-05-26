import { OnInit, Input, Component } from '@angular/core';
import { BnbAddressTransaction } from 'src/app/classes/BNB/BnbAddressTransaction';
import { BnbTransaction } from 'src/app/classes/BNB/BnbTransaction';
import { BnbAddress } from 'src/app/classes/BNB/BnbAddress';

@Component({
    selector: 'bnb-results',
    templateUrl: './bnb-results.component.html',
    styleUrls: ['./bnb-results.component.css']
})

export class BnbResultsComponent implements OnInit{
    @Input() bnbAddress: BnbAddress;
    @Input() bnbTransaction: BnbTransaction;
    @Input() bnbTransactions: BnbAddressTransaction[];

    constructor() {}

    ngOnInit() {
    }
}