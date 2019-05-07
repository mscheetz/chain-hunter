import { OnInit, Input, Component } from '@angular/core';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcPage } from '../../classes/BTC/BtcPage';
import { EthAddress } from 'src/app/classes/ETH/EthAddress';

@Component({
    selector: 'eth-results',
    templateUrl: './eth-results.component.html',
    styleUrls: ['./eth-results.component.css']
})

export class EthResultsComponent implements OnInit{
    @Input() ethAddress: EthAddress;
    @Input() ethTransaction: BtcTransaction;
    @Input() ethTransactions: BtcPage<BtcTransaction[]>;

    constructor() {}

    ngOnInit() {
    }
}