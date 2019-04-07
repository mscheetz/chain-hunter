import { OnInit, Component, Output, Input } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcService } from 'src/app/services/btc-svc.service';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    @Output() addyTxn: string;
    @Output() btcAddress: BtcAddress;
    @Output() btcTransaction: BtcTransaction;

    constructor(private btcService: BtcService) {}

    ngOnInit() {
    }

    chainHunt(){
        this.btcService.getAddress(this.addyTxn)
        .subscribe(address => this.btcAddress = address.data);

        console.log(this.btcAddress);

        this.btcService.getTransaction(this.addyTxn)
        .subscribe(txn => this.btcTransaction = txn.data);

        console.log(this.btcTransaction);
    }
}