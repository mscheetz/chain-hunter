import { OnInit, Input, Component } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';

@Component({
    selector: 'btc-results',
    templateUrl: './btc-results.component.html',
    styleUrls: ['./btc-results.component.css']
})

export class BtcResultsComponent implements OnInit{
    @Input() btcAddress: BtcAddress;
    @Input() btcTransaction: BtcTransaction;

    constructor() {}

    ngOnInit() {
    }

    isEmptyObject(obj) {
        return (obj && (Object.keys(obj).length === 0));
      }
}