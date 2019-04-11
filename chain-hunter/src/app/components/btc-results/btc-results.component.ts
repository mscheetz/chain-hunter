import { OnInit, Input, Component } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcPage } from '../../classes/BTC/BtcPage';

@Component({
    selector: 'btc-results',
    templateUrl: './btc-results.component.html',
    styleUrls: ['./btc-results.component.css']
})

export class BtcResultsComponent implements OnInit{
    @Input() btcAddress: BtcAddress;
    @Input() btcTransaction: BtcTransaction;
    @Input() btcTransactions: BtcPage<BtcTransaction[]>;

    constructor() {}

    ngOnInit() {
    }
}