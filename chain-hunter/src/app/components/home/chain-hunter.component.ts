import { OnInit, Component, Output, Input } from '@angular/core';
import { BtcAddress } from 'src/app/classes/BTC/BtcAddress';
import { BtcTransaction } from 'src/app/classes/BTC/BtcTransaction';
import { BtcService } from 'src/app/services/btc-svc.service';
import { BtcPage } from '../../classes/BTC/BtcPage';
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
import { RvnService } from 'src/app/services/rvn-svc.service';
import { MenuItem } from 'primeng/api';
import { XrpAddress } from 'src/app/classes/XRP/XrpAddress';
import { XrpTransaction } from 'src/app/classes/XRP/XrpTransaction';
import { XrpAddressTransaction } from 'src/app/classes/XRP/XrpAddressTransaction';
import { XrpService } from 'src/app/services/xrp-svc.service';

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
    viewBtc: boolean = false;
    btcComplete: boolean = true;
    btcIcon: string;
    @Output() ethAddress: EthAddress = null;
    @Output() ethTransaction: EthTransaction = null;
    @Output() ethTransactions: EthTransaction[] = null;
    ethFound: boolean = false;
    viewEth: boolean = false;
    ethComplete: boolean = true;
    ethIcon: string;
    @Output() bchAddress: BchAddress = null;
    @Output() bchTransaction: BchTransaction = null;
    @Output() bchTransactions: BchPagedResponse<BchTransaction[]> = null;
    bchFound: boolean = false;
    viewBch: boolean = false;
    bchIcon: string;
    bchComplete: boolean = true;
    @Output() ltcAddress: LtcAddress = null;
    @Output() ltcTransaction: LtcTransaction = null;    
    ltcFound: boolean = false;
    viewLtc: boolean = false;
    ltcComplete: boolean = true;
    ltcIcon: string;
    @Output() rvnAddress: RvnAddress = null;
    @Output() rvnTransaction: RvnTransaction = null;
    @Output() rvnTransactions: RvnTransaction[] = null;
    rvnFound: boolean = false;
    viewRvn: boolean = false;
    rvnComplete: boolean = true;
    rvnIcon: string;
    @Output() xrpAddress: XrpAddress = null;
    @Output() xrpTransaction: XrpTransaction = null;
    @Output() xrpTransactions: XrpAddressTransaction[] = null;
    xrpFound: boolean = false;
    viewXrp: boolean = false;
    xrpIcon: string;
    xrpComplete: boolean = true;
    items: MenuItem[];
    emptyHanded: boolean = false;
    notRunning: boolean = true;
    @Output() samplesIndex = null;

    constructor(private btcService: BtcService, 
                private bchService: BchService,
                private ethService: EthService,
                private ltcService: LtcService,
                private rvnService: RvnService,
                private xrpService: XrpService) {}

    ngOnInit() {
        this.nullOut();
        this.updateMenuItems();
    }

    nullOut(){
        this.bchFound = false;
        this.btcFound = false;
        this.ethFound = false;
        this.ltcFound = false;
        this.rvnFound = false;
        this.xrpFound = false;
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
        this.xrpAddress = null;
        this.xrpTransaction = null;
        this.xrpTransactions = null;
        this.emptyHanded = false;
        this.btcComplete = this.bchComplete = this.ethComplete = this.ltcComplete = this.rvnComplete = this.xrpComplete = false;
        this.calculateIcons();
    }

    chainHunt(){
        this.samplesIndex = -100;
        this.hideAll();
        this.nullOut();
        this.notRunning = false;
        this.btcService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.btcAddress = address.data
                    this.btcFound = true;
                    this.getBtcTransactions();
                    this.emptyHanded = false;
                    this.btcComplete = true;
                    this.calculateIcons();
                    console.log("btc address found");
                } else {
                    console.log("btc address not found");
                    this.getBtcTransaction();
                }
            },
            error => {
                this.getBtcTransaction();
                console.log("btc address error:" + error);
            });
        this.bchService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.bchAddress = address.data
                    this.bchFound = true;
                    this.getBchTransactions();
                    this.emptyHanded = false;
                    this.bchComplete = true;
                    this.calculateIcons();
                    console.log("bch address found");
                } else {
                    console.log("bch address not found");
                    this.getBchTransaction();
                }
            },
            error => {
                this.getBchTransaction();
                console.log("bch address error:" + error);
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
                    this.ethComplete = true;
                    this.calculateIcons();
                    console.log("eth address found");
                } else {
                    console.log("eth address not found");
                    this.getEthTransaction();
                }
            },
            error => {
                this.getEthTransaction();
                console.log("eth address error:" + error);
            });
        this.ltcService.getAddress(this.addyTxn)
            .subscribe(balance => {
                if(balance > 0) {
                    this.ltcAddress = new LtcAddress();
                    this.ltcAddress.address = this.addyTxn;
                    this.ltcAddress.balance = balance;
                    this.ltcFound = true;
                    this.emptyHanded = false;
                    this.ltcComplete = true;
                    this.calculateIcons();
                    console.log("ltc address found");   
                } else {
                    this.ltcComplete = true;
                    console.log("ltc address not found");                    
                }
            },
            error => {
                this.ltcComplete = true;
                this.calculateIcons();
                console.log("ltc address error:" + error);
            });
        this.rvnService.getAddress(this.addyTxn)
            .subscribe(addressResponse => {
                if(addressResponse) {
                    this.rvnAddress = addressResponse;
                    this.rvnFound = true;
                    this.getRvnTransactions();
                    this.emptyHanded = false;
                    this.rvnComplete = true;
                    this.calculateIcons();
                    console.log("rvn address found");
                } else {
                    console.log("rvn address not found");
                    this.getRvnTransaction();
                }
            },
            error => {
                this.getRvnTransaction();
                console.log("rvn address error:" + error);
            });
        this.xrpService.getAddress(this.addyTxn)
            .subscribe(addressResponse => {
                if(addressResponse) {
                    this.xrpAddress = addressResponse;
                    this.xrpFound = true;
                    this.getXrpTransactions();
                    this.emptyHanded = false;
                    this.xrpComplete = true;
                    this.calculateIcons();
                    console.log("xrp address found");
                } else {
                    console.log("xrp address not found");
                    this.getXrpTransaction();
                }
            },
            error => {
                this.getXrpTransaction();
                console.log("xrp address error:" + error);
            });
    }

    getBtcTransaction() {
        this.btcService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.btcComplete = true;
                if(txn.err_no === 0) {
                    this.btcTransaction = txn.data
                    this.btcFound = true;
                    this.emptyHanded = false;
                    console.log("btc transaction found");
                } else {
                    console.log("btc transaction not found");
                }
                this.calculateIcons();
            },
            error => {
                this.btcComplete = true;
                this.calculateIcons();
                console.log("btc transaction error:" + error);
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
                this.bchComplete = true;
                if(txn.err_no === 0) {
                    this.bchTransaction = txn.data
                    this.bchFound = true;
                    this.emptyHanded = false;
                    console.log("bch transaction found");
                } else {
                    console.log("bch transaction not found");
                }
                this.calculateIcons();
            },
            error => {
                this.bchComplete = true;
                this.calculateIcons();
                console.log("bch transaction error:" + error);
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
                this.ethComplete = true;
                if(!txn.error) {
                    this.ethTransaction = txn.result
                    this.ethFound = true;
                    this.emptyHanded = false;
                    console.log("eth transaction found");
                } else {
                    console.log("eth transaction not found");
                }
                this.calculateIcons();
            },
            error => {
                this.ethComplete = true;
                this.calculateIcons();
                console.log("eth transaction error:" + error);
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
                this.rvnComplete = true;
                if(txn) {
                    this.rvnTransaction = txn
                    this.rvnFound = true;
                    this.emptyHanded = false;
                    console.log("rvn transaction found");
                } else {
                    console.log("rvn transaction not found");                    
                }
                this.calculateIcons();
            },
            error => {
                this.rvnComplete = true;
                this.calculateIcons();
                console.log("rvn transaction error:" + error);
            });
    }

    getRvnTransactions() {
        this.rvnService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.rvnTransactions = txns.txs;
            });
    }

    getXrpTransaction() {
        this.xrpService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.xrpComplete = true;
                if(txn) {
                    this.xrpTransaction = txn
                    this.xrpFound = true;
                    this.emptyHanded = false;
                    console.log("xrp transaction found");  
                } else {
                    console.log("xrp transaction not found");                    
                }
                this.calculateIcons();
            },
            error => {
                this.xrpComplete = true;
                this.calculateIcons();
                console.log("xrp transaction error:" + error);
            });
    }

    getXrpTransactions() {
        this.xrpService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.xrpTransactions = txns.payments;
            });
    }

    calculateIcons() {
        this.bchIcon = this.getIcon("bch", this.bchFound);
        this.btcIcon = this.getIcon("btc", this.btcFound);
        this.ethIcon = this.getIcon("eth", this.ethFound);
        this.ltcIcon = this.getIcon("ltc", this.ltcFound);
        this.rvnIcon = this.getIcon("rvn", this.rvnFound);
        this.xrpIcon = this.getIcon("xrp", this.xrpFound);
        this.updateMenuItems();
        this.checkComplete();
    }

    checkComplete() {
        if(this.btcComplete && this.bchComplete && this.ethComplete && this.ltcComplete 
            && this.rvnComplete && this.xrpComplete ){
            this.notRunning = true;
        }
    }

    updateMenuItems() {
        this.items = [
            { label: 'btc', icon: this.btcIcon, styleClass: this.btcFound ? 'found-bg' : 'not-found-bg', command: (event) => { this.showBtc() } },
            { label: 'bch', icon: this.bchIcon, command: (event) => { this.showBch() } },
            { label: 'eth', icon: this.ethIcon, command: (event) => { this.showEth() } },
            { label: 'ltc', icon: this.ltcIcon, command: (event) => { this.showLtc() } },
            { label: 'rvn', icon: this.rvnIcon, command: (event) => { this.showRvn() } },
            { label: 'xrp', icon: this.xrpIcon, command: (event) => { this.showXrp() } },
        ]        
    }

    getIcon(symbol: string, exists: boolean): string {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = exists ? "color" : "white";

        return iconBase + property + "/" + symbol + ".svg";
    }

    hideAll() {
        this.viewBch = false;
        this.viewBtc = false;
        this.viewEth = false;
        this.viewLtc = false;
        this.viewRvn = false;
        this.viewXrp = false;
    }

    showBtc() {
        if(this.viewBtc === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewBtc = true;
        }
    }

    showBch() {
        if(this.viewBch === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewBch = true;
        }
    }

    showEth() {
        if(this.viewEth === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewEth = true;
        }
    }

    showLtc() {
        if(this.viewLtc === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewLtc = true;
        }
    }

    showRvn() {
        if(this.viewRvn === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewRvn = true;
        }
    }

    showXrp() {
        if(this.viewXrp === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewXrp = true;
        }
    }
}