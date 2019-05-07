import { OnInit, Component, Output, Input } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcService } from 'src/app/services/btc-svc.service';
import { BtcPage } from '../../classes/BTC/BtcPage';
import { delay } from 'q';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import { EthService } from 'src/app/services/eth-svc.service';
import { EthAddress } from 'src/app/classes/ETH/EthAddress';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    @Output() addyTxn: string;
    @Output() btcAddress: BtcAddress = null;
    @Output() btcTransaction: BtcTransaction = null;
    @Output() btcTransactions: BtcPage<BtcTransaction[]> = null;
    btcFound: boolean = false;
    @Output() ethAddress: EthAddress = null;
    ethFound: boolean = false;

    constructor(private btcService: BtcService, private ethService: EthService) {}

    ngOnInit() {
    }

    chainHunt(){
        this.btcAddress = null;
        this.btcTransaction = null;
        this.btcTransactions = null;
        this.btcService.getAddress(this.addyTxn)
        .subscribe(address => this.btcAddress = address.data);
        this.ethService.getAddress(this.addyTxn)
        .subscribe(addressResponse => {
            if(addressResponse.status === "1" || addressResponse.message === "OK") {
                this.ethAddress.Address = this.addyTxn;
                this.ethAddress.Balance = addressResponse.result;
                this.ethFound = true;
            }});

        console.log(this.btcAddress);

        if(this.btcAddress !== null){
            this.btcFound = true;
            this.btcService.getAddressTransactions(this.addyTxn)
                .subscribe(txns => this.btcTransactions = txns.data);
        } else{
            this.btcService.getTransaction(this.addyTxn)
            .subscribe(txn => this.btcTransaction = txn.data);

            if(this.btcTransaction !== null) {
                this.btcFound = true;
            }
            console.log(this.btcTransaction);
        }
    }
}