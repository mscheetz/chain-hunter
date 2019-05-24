import { OnInit, Component, Output, Input } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcService } from 'src/app/services/btc-svc.service';
import { BtcPage } from '../../classes/BTC/BtcPage';
import { delay } from 'q';
import { EthService } from 'src/app/services/eth-svc.service';
import { EthAddress } from 'src/app/classes/ETH/EthAddress';
import { BchAddress } from 'src/app/classes/BCH/BchAddress';
import { BchTransaction } from 'src/app/classes/BCH/BchTransaction';
import { LtcTransaction } from 'src/app/classes/LTC/LtcTransaction';
import { LtcService } from 'src/app/services/ltc-svc.service';
import { BchService } from 'src/app/services/bch-svc.service';
import { BchPagedResponse } from 'src/app/classes/BCH/BchPagedResponse';
import { EthTransaction } from 'src/app/classes/ETH/EthTransaction';
import { LtcAddress } from 'src/app/classes/LTC/LtcAddress';
import { RvnAddress } from 'src/app/classes/RVN/RvnAddress';
import { RvnTransaction } from 'src/app/classes/RVN/RvnTransaction';
import { RvnPaged } from 'src/app/classes/RVN/RvnPaged';
import { RvnService } from 'src/app/services/rvn-svc.service';
import { ThrowStmt } from '@angular/compiler';
import { MenuItem } from 'primeng/api';

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
    @Output() ethTransaction: EthTransaction = null;
    @Output() ethTransactions: EthTransaction[] = null;
    ethFound: boolean = false;
    @Output() bchAddress: BchAddress = null;
    @Output() bchTransaction: BchTransaction = null;
    @Output() bchTransactions: BchPagedResponse<BchTransaction[]> = null;
    bchFound: boolean = false;
    @Output() ltcAddress: LtcAddress = null;
    @Output() ltcTransaction: LtcTransaction = null;    
    ltcFound: boolean = false;
    @Output() rvnAddress: RvnAddress = null;
    @Output() rvnTransaction: RvnTransaction = null;
    @Output() rvnTransactions: RvnTransaction[] = null;
    rvnFound: boolean = false;
    emptyHanded: boolean = false;
    btcIcon: string;
    bchIcon: string;
    ethIcon: string;
    ltcIcon: string;
    rvnIcon: string;
    items: MenuItem[];
    icons: string[];

    constructor(private btcService: BtcService, 
                private bchService: BchService,
                private ethService: EthService,
                private ltcService: LtcService,
                private rvnService: RvnService) {}

    ngOnInit() {
        this.nullOut();
        this.items = [
            { label: 'btc', icon: this.btcIcon },
            { label: 'bch', icon: this.bchIcon },
            { label: 'eth', icon: this.ethIcon },
            { label: 'ltc', icon: this.ltcIcon },
            { label: 'rvn', icon: this.rvnIcon }
        ]
        this.icons = [
            this.btcIcon,
            this.bchIcon,
            this.ethIcon,
            this.ltcIcon,
            this.rvnIcon
        ]
    }

    nullOut(){
        this.bchFound = false;
        this.btcFound = false;
        this.ethFound = false;
        this.ltcFound = false;
        this.rvnFound = false;
        this.btcAddress = null;
        this.btcTransaction = null;
        this.btcTransactions = null;
        this.bchAddress = null;
        this.bchTransaction = null;
        this.bchTransactions = null;
        this.ethAddress = null;
        this.ethTransaction = null;
        this.ethTransactions = null;
        this.ltcAddress = null;
        this.ltcTransaction = null;
        this.rvnAddress = null;
        this.rvnTransaction = null;
        this.rvnTransactions = null;
        this.emptyHanded = false;
        this.calculateIcons();
    }

    chainHunt(){
        this.nullOut();
        this.btcService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.btcAddress = address.data
                    this.btcFound = true;
                    this.getBtcTransactions();
                    this.emptyHanded = false;
                    this.calculateIcons();
                } else {
                    this.getBtcTransaction();
                }
            });
        this.bchService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.bchAddress = address.data
                    this.bchFound = true;
                    this.getBchTransactions();
                    this.emptyHanded = false;
                    this.calculateIcons();
                } else {
                    this.getBchTransaction();
                }
            });
        this.ethService.getAddress(this.addyTxn)
            .subscribe(addressResponse => {
                if(addressResponse.status === "1" || addressResponse.message === "OK") {
                    this.ethAddress = new EthAddress();
                    this.ethAddress.Address = this.addyTxn;
                    this.ethAddress.Balance = addressResponse.result;
                    this.ethFound = true;
                    this.getEthTransactions();
                    this.emptyHanded = false;
                    this.calculateIcons();
                } else {
                    this.getEthTransaction();
                }
            });
        this.ltcService.getAddress(this.addyTxn)
            .subscribe(balance => {
                if(balance > 0) {
                    this.ltcAddress = new LtcAddress();
                    this.ltcAddress.address = this.addyTxn;
                    this.ltcAddress.balance = balance;
                    this.ltcFound = true;
                    this.emptyHanded = false;
                    this.calculateIcons();
                }
            });
        this.rvnService.getAddress(this.addyTxn)
            .subscribe(addressResponse => {
                if(addressResponse) {
                    this.rvnAddress = addressResponse;
                    this.rvnFound = true;
                    this.getRvnTransactions();
                    this.emptyHanded = false;
                    this.calculateIcons();
                } else {
                    this.getRvnTransaction();
                }
            });

        console.log(this.btcAddress);
    }

    getBtcTransaction() {
        this.btcService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(txn.err_no === 0) {
                    this.btcTransaction = txn.data
                    this.btcFound = true;
                    this.emptyHanded = false;
                    this.calculateIcons();
                }
            });
    }

    getBtcTransactions() {
        this.btcService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.btcTransactions = txns.data
            });
    }

    getBchTransaction() {
        this.bchService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(txn.err_no === 0) {
                    this.bchTransaction = txn.data
                    this.bchFound = true;
                    this.emptyHanded = false;
                    this.calculateIcons();
                }
            });
    }

    getBchTransactions() {
        this.bchService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.bchTransactions = txns.data;
            });
    }

    getEthTransaction() {
        this.ethService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(!txn.error) {
                    this.ethTransaction = txn.result
                    this.ethFound = true;
                    this.emptyHanded = false;
                    this.calculateIcons();
                }
            });
    }

    getEthTransactions() {
        this.ethService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.ethTransactions = txns.result
            });
    }

    getRvnTransaction() {
        this.rvnService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(txn) {
                    this.rvnTransaction = txn
                    this.rvnFound = true;
                    this.emptyHanded = false;
                    this.calculateIcons();
                }
            });
    }

    getRvnTransactions() {
        this.rvnService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.rvnTransactions = txns.txs;
            });
    }

    calculateIcons() {
        this.bchIcon = this.getIcon("bch", this.bchFound);
        this.btcIcon = this.getIcon("btc", this.btcFound);
        this.ethIcon = this.getIcon("eth", this.ethFound);
        this.ltcIcon = this.getIcon("ltc", this.ltcFound);
        this.rvnIcon = this.getIcon("rvn", this.rvnFound);
    }

    getIcon(symbol: string, exists: boolean): string {
        let iconBase = "/assets/cryptoicons/";
        let property = exists ? "color" : "white";

        return iconBase + property + "/" + symbol + ".svg";
    }
}