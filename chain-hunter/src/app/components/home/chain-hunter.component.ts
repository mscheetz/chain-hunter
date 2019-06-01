import { OnInit, Component, Output, Input } from '@angular/core';
import { BtcService } from 'src/app/services/btc-svc.service';
import { EthService } from 'src/app/services/eth-svc.service';
import { EthAddress } from 'src/app/classes/ETH/EthAddress';
import { LtcService } from 'src/app/services/ltc-svc.service';
import { BchService } from 'src/app/services/bch-svc.service';
import { EthTransaction } from 'src/app/classes/ETH/EthTransaction';
import { RvnService } from 'src/app/services/rvn-svc.service';
import { MenuItem } from 'primeng/api';
import { XrpService } from 'src/app/services/xrp-svc.service';
import { BnbService } from 'src/app/services/bnb-svc.service';
import { NeoService } from 'src/app/services/neo-svc.service';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { EthBlock } from 'src/app/classes/ETH/EthBlock';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    @Output() addyTxn: string;
    btcFound: boolean = false;
    viewBtc: boolean = false;
    btcComplete: boolean = true;
    btcIcon: string;
    bnbFound: boolean = false;
    viewBnb: boolean = false;
    bnbComplete: boolean = true;
    bnbIcon: string;
    ethTransaction: EthTransaction = null;
    ethTransactions: EthTransaction[] = null;
    ethFound: boolean = false;
    ethBlockCount: number = 0;
    ethLatestBlock: string = null;
    ethBlocks: Map<string, EthBlock> = new Map<string, EthBlock>();
    viewEth: boolean = false;
    ethComplete: boolean = true;
    ethIcon: string;
    bchFound: boolean = false;
    viewBch: boolean = false;
    bchIcon: string;
    bchComplete: boolean = true;    
    ltcFound: boolean = false;
    viewLtc: boolean = false;
    ltcComplete: boolean = true;
    ltcIcon: string;
    rvnFound: boolean = false;
    viewRvn: boolean = false;
    rvnComplete: boolean = true;
    rvnIcon: string;
    xrpFound: boolean = false;
    viewXrp: boolean = false;
    xrpIcon: string;
    xrpComplete: boolean = true;
    neoFound: boolean = false;
    viewNeo: boolean = false;
    neoIcon: string;
    neoComplete: boolean = true;
    items: MenuItem[];
    emptyHanded: boolean = false;
    notRunning: boolean = true;
    seeItem: boolean = false;
    activeItem: MenuItem;
    @Output() samplesIndex = null;
    @Output() blockchain: Blockchain = null;
    map: Map<string, Blockchain> = new Map<string, Blockchain>();
    menuItems: MenuItem[];
    selectedChain: string = "";
    txnsComplete: boolean = true;
    previousSearch: string = "";

    constructor(private btcService: BtcService, 
                private bchService: BchService,
                private bnbService: BnbService,
                private ethService: EthService,
                private ltcService: LtcService,
                private neoService: NeoService,
                private rvnService: RvnService,
                private xrpService: XrpService) {}

    ngOnInit() {
        this.nullOut();
        this.updateMenuItems();
    }

    nullOut(){
        this.ethTransaction = null;
        this.ethTransactions = null;
        this.btcComplete = this.bnbComplete = this.bchComplete = 
        this.ethComplete = this.ltcComplete = this.neoComplete = 
        this.rvnComplete = this.xrpComplete = false;
        this.map = new Map<string, Blockchain>();
        this.calculateIcons();
    }

    chainHunt(){
        if(this.previousSearch === this.addyTxn || this.addyTxn === "") {
            return;
        }
        this.blockchain = new Blockchain();
        this.samplesIndex = -100;
        this.hideAll();
        this.nullOut();
        this.buildMap();
        this.notRunning = false;
        this.previousSearch = this.addyTxn;
        this.btcService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.btcFound = true;
                    let btc = this.getBlockchain("BTC");
                    btc.address = this.btcService.addressConvert(address.data);
                    this.setMap(btc);
                    //this.getBtcTransactions();
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
        this.bnbService.getAddress(this.addyTxn)
            .subscribe(address => {
                this.bnbFound = true;
                //this.getBnbTransactions();
                this.emptyHanded = false;
                this.bnbComplete = true;
                let bnb = this.getBlockchain("BNB");
                bnb.address = this.bnbService.addressConvert(address);
                this.setMap(bnb);
                this.calculateIcons();
                console.log("bnb address found");
            },
            error => {
                this.getBnbTransaction();
                console.log("bnb address error:" + error);
        });
        this.bchService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.bchFound = true;
                    let bch = this.getBlockchain("BCH");
                    bch.address = this.bchService.addressConvert(address.data);
                    this.setMap(bch);
                    //this.getBchTransactions();
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
                if((addressResponse.status === "1" || addressResponse.message === "OK") 
                    && addressResponse.result !== "0" ) {
                    let ethAddress = new EthAddress();
                    ethAddress.Address = this.addyTxn;
                    ethAddress.Balance = parseInt(addressResponse.result);
                    this.ethFound = true;
                    this.ethBlocks = new Map<string, EthBlock>();
                    this.ethLatestBlock = null;
                    let eth = this.getBlockchain("ETH");
                    eth.address = this.ethService.addressConvert(ethAddress);
                    this.setMap(eth);
                    this.getEthTokens();
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
            .subscribe(address => {
                this.ltcFound = true;
                this.emptyHanded = false;
                this.ltcComplete = true;
                let ltc = this.getBlockchain("LTC");
                ltc.address = this.ltcService.addressConvert(address);
                this.setMap(ltc);
                this.calculateIcons();
                console.log("ltc address found");  
            },
            error => {
                this.getLtcTransaction();
                console.log("ltc address error:" + error);
            });
        this.neoService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.balance.length > 0) {
                    this.neoFound = true;
                    //this.getNeoTransactions();
                    this.emptyHanded = false;
                    this.neoComplete = true;
                    let neo = this.getBlockchain("NEO");
                    neo.address = this.neoService.addressConvert(address);
                    this.setMap(neo);
                    this.calculateIcons();
                console.log("neo address found");
                } else {
                    console.log("neo address not found");
                    this.getNeoTransaction();
                }
            },
            error => {
                this.getNeoTransaction();
                console.log("neo address error:" + error);
        });
        this.rvnService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address) {
                    this.rvnFound = true;
                    //this.getRvnTransactions();
                    this.emptyHanded = false;
                    this.rvnComplete = true;
                    let rvn = this.getBlockchain("RVN");
                    rvn.address = this.rvnService.addressConvert(address);
                    this.setMap(rvn);
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
            .subscribe(address => {
                if(address) {
                    this.xrpFound = true;
                    //this.getXrpTransactions();
                    this.emptyHanded = false;
                    this.xrpComplete = true;
                    let xrp = this.getBlockchain("XRP");
                    xrp.address = this.xrpService.addressConvert(address);
                    this.setMap(xrp);
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
                    let btc = this.getBlockchain("BTC");
                    btc.transaction = this.btcService.transactionConvert(txn.data);
                    this.setMap(btc);
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

    getAddressTransactions(symbol: string): any {
        if(symbol === "BTC") {
            return this.getBtcTransactions();
        } else if (symbol === "BCH") {
            return this.getBchTransactions();
        } else if (symbol === "ETH") {
            return this.getEthTransactions();
        } else if (symbol === "LTC") {
            return this.getLtcTransactions();
        } else if (symbol === "NEO") {
            return this.getNeoTransactions();
        } else if (symbol === "RVN") {
            return this.getRvnTransactions();            
        } else if (symbol === "XRP") {
            return this.getXrpTransactions();
        } else if (symbol === "BNB") {
            return this.getBnbTransactions();
        }
    }

    getBtcTransactions() {
        this.txnsComplete = false;
        this.btcService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let btc = this.getBlockchain("BTC");
                btc.address.transactions = this.btcService.transactionsConvert(txns.data.list);
                this.setMap(btc);
                this.txnsComplete = true;
            });
    }

    getBnbTransaction() {
        this.bnbService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.bnbComplete = true;
                this.bnbFound = true;
                this.emptyHanded = false;
                let bnb = this.getBlockchain("BNB");
                bnb.transaction = this.bnbService.transactionConvert(txn);
                this.setMap(bnb);
                console.log("bnb transaction found");
                this.calculateIcons();
            },
            error => {
                this.bnbComplete = true;
                this.calculateIcons();
                console.log("bnb transaction error:" + error);
            });
    }

    getBnbTransactions() {
        this.txnsComplete = false;
        this.bnbService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                // let bnb = this.getBlockchain("BNB");
                // bnb.address.transactions = this.bnbService.transactionsConvert(txns.tx);
                // this.setMap(bnb);
                this.txnsComplete = true;
            });
    }

    getBchTransaction() {
        this.bchService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.bchComplete = true;
                if(txn.err_no === 0) {
                    let bch = this.getBlockchain("BCH");
                    bch.transaction = this.bchService.transactionConvert(txn.data);
                    this.setMap(bch);
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
        this.txnsComplete = false;
        this.bchService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let bch = this.getBlockchain("BCH");
                bch.address.transactions = this.bchService.transactionsConvert(txns.data.list);
                this.setMap(bch);
                this.txnsComplete = true;
            });
    }

    getEthTokens() {
        this.ethService.getTokens(this.addyTxn).subscribe(result => {
            let eth = this.getBlockchain("ETH");
            eth.address.tokens = this.ethService.tokenConvert(result.tokens);
            this.setMap(eth);
        });
    }

    getEthTransaction() {
        this.ethService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(!txn.error && txn.result !== null) {
                    this.ethFound = true;
                    this.emptyHanded = false;
                    this.ethBlockCount = 1;
                    this.ethBlocks.set(txn.result.blockNumber, null);
                    this.getEthBlock(txn.result.blockNumber);
                    this.getEthLastBlock();
                    console.log("eth transaction found");
                } else {
                    this.ethComplete = true;
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
        this.txnsComplete = false;
        this.ethService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let keepers = txns.result.splice(0, 10);
                this.ethBlockCount = 0;
                this.ethTransactions = keepers;
                this.getEthLastBlock(true);
                keepers.forEach(txn => {
                    if(!this.ethBlocks.has(txn.blockNumber)){
                        this.ethBlockCount++;
                        this.ethBlocks.set(txn.blockNumber, null);
                        this.getEthBlock(txn.blockNumber);
                    }
                });
                this.txnsComplete = true;
                if(this.ethTxnReady()) {
                    this.buildEthTransactions();
                }
            });
    }

    getEthBlock(block: string) {
        let intBlock = parseInt(block);
        this.ethService.getBlock(intBlock).subscribe(result => {
            let blockInfo = result.result;
            this.ethBlocks.set(block, blockInfo);
            this.ethBlockCount--;
            if(this.ethTxnReady()) {
                this.buildEthTransactions();
            }
        })
    }

    /**
     * Build Eth transactions
     */
    buildEthTransactions(){
        let multi = this.ethTransaction !== null ? false : true;
        let eth = this.getBlockchain("ETH");

        if(multi) {
            this.ethTransactions.forEach(txn => {
                let blockInfo = this.ethBlocks.get(txn.blockNumber);
                txn.timestamp = blockInfo.timestamp;
            });
            eth.address.transactions = this.ethService.transactionsConvert(this.ethTransactions);
        } else {
            this.ethComplete = true;
            let blockInfo = this.ethBlocks.get(this.ethTransaction.blockNumber);
            this.ethTransaction.timestamp = blockInfo.timestamp;
            eth.transaction = this.ethService.transactionConvert(this.ethTransaction);
        }
        this.setMap(eth);
    }    

    /**
     * Get latest eth block number
     * 
     * @param multi Is this for multiple transactions?
     */
    getEthLastBlock(multi: boolean = false) {
        this.ethService.getLatestBlock().subscribe(block => {
            this.ethLatestBlock = block.result;
            if(multi) {
                this.ethTransactions.forEach(txn => {
                    txn.currentBlock = block.result;
                });
            } else {
                this.ethTransaction.currentBlock = block.result;
                // if(this.ethTxnReady()) {
                //     this.buildEthTransactions();
                // }
            }
            if(this.ethTxnReady()) {
                this.buildEthTransactions();
            }
        });
    }

    /**
     * Eth transactions ready to process?
     */
    ethTxnReady(): boolean {
        if(this.ethBlockCount === 0 && this.ethLatestBlock !== null) {
            return true
        }
        return false;
    }

    getLtcTransaction() {
        this.ltcService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.ltcComplete = true;
                let ltc = this.getBlockchain("LTC");
                ltc.transaction = this.ltcService.transactionConvert(txn);
                this.setMap(ltc);
                this.calculateIcons();
            },
            error => {
                this.ltcComplete = true;
                this.calculateIcons();
                console.log("ltc transaction error:" + error);
            });
    }

    getLtcTransactions() {
        this.txnsComplete = false;
        this.ltcService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let ltc = this.getBlockchain("LTC");
                ltc.address.transactions = this.ltcService.transactionsConvert(txns.txs);
                this.setMap(ltc);
                this.txnsComplete = true;
            });
    }

    getNeoTransaction() {
        this.neoService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.neoComplete = true;
                this.neoFound = true;
                this.emptyHanded = false;
                let neo = this.getBlockchain("NEO");
                neo.transaction = this.neoService.transactionConvert(txn);
                this.setMap(neo);
                console.log("neo transaction found");
                this.calculateIcons();
            },
            error => {
                this.neoComplete = true;
                this.calculateIcons();
                console.log("neo transaction error:" + error);
            });
    }

    getNeoTransactions() {
        this.txnsComplete = false;
        this.neoService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let neo = this.getBlockchain("NEO");
                neo.address.transactions = this.neoService.transactionsConvert(txns.entries);
                this.setMap(neo);
                this.txnsComplete = true;
            });
    }

    getRvnTransaction() {
        this.rvnService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.rvnComplete = true;
                if(txn) {
                    this.rvnFound = true;
                    this.emptyHanded = false;
                    let rvn = this.getBlockchain("RVN");
                    rvn.transaction = this.rvnService.transactionConvert(txn);
                    this.setMap(rvn);
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
        this.txnsComplete = false;
        this.rvnService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let rvn = this.getBlockchain("RVN");
                rvn.address.transactions = this.rvnService.transactionsConvert(txns.txs);
                this.setMap(rvn);
                this.txnsComplete = true;
            });
    }

    getXrpTransaction() {
        this.xrpService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.xrpComplete = true;
                if(txn) {
                    this.xrpFound = true;
                    this.emptyHanded = false;
                    let xrp = this.getBlockchain("XRP");
                    xrp.transaction = this.xrpService.transactionConvert(txn);
                    this.setMap(xrp);
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
        this.txnsComplete = false;
        this.xrpService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let xrp = this.getBlockchain("XRP");
                xrp.address.transactions = this.xrpService.transactionsConvert(txns.payments);
                this.setMap(xrp);
                this.txnsComplete = true;
            });
    }

    calculateIcons() {
        this.updateMenuItems();
        this.checkComplete();
    }

    checkComplete() {
        if(this.btcComplete && this.bnbComplete && this.bchComplete 
            && this.ethComplete && this.ltcComplete && this.neoComplete
            && this.rvnComplete && this.xrpComplete ){
            this.notRunning = true;
        }
    }

    updateMenuItems() {
        this.menuItems = [];
        this.map.forEach((value: Blockchain, key: string) => {
            this.menuItems.push({ 
                label: value.symbol, 
                icon: value.icon,
                command: (event) => { this.showItem(value.symbol, event) }
            });
        });
    }

    buildMap(){
        this.map = new Map<string, Blockchain>();
        this.map.set("BTC", this.btcService.getBlockchain());
        this.map.set("BCH", this.bchService.getBlockchain());
        this.map.set("ETH", this.ethService.getBlockchain());
        this.map.set("LTC", this.ltcService.getBlockchain());
        this.map.set("NEO", this.neoService.getBlockchain());
        this.map.set("RVN", this.rvnService.getBlockchain());
        this.map.set("XRP", this.xrpService.getBlockchain());
        this.map.set("BNB", this.bnbService.getBlockchain());

        this.map.forEach((value: Blockchain, key: string) => {
            value = this.getMenuIcon(value);
        });
    }

    getBlockchain(symbol: string): Blockchain {
        let chain = this.map.get(symbol);
        return chain;
    }

    setMap(chain: Blockchain) {
        chain = this.getMenuIcon(chain);
        this.map.set(chain.symbol, chain);
    }

    showItem(symbol: string, event: any) {
        if(this.seeItem && this.selectedChain === symbol) {
            this.blockchain = null;
            this.seeItem = false;
            this.selectedChain = "";
            this.activeItem = null;
        } else {
            this.blockchain = this.getBlockchain(symbol);
            this.seeItem = true;
            this.selectedChain = symbol;            
        }
    }

    getMenuIcon(chain: Blockchain): Blockchain {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = chain.address || chain.transaction ? "color" : "white";

        chain.icon = iconBase + property + "/" + chain.symbol.toLowerCase() + ".svg";

        return chain;
    }

    getIcon(symbol: string, exists: boolean): string {
        let iconBase = ""; //"/assets/cryptoicons/";
        let property = exists ? "color" : "white";

        return iconBase + property + "/" + symbol + ".svg";
    }

    hideAll() {
        this.viewBch = false;
        this.viewBnb = false;
        this.viewBtc = false;
        this.viewEth = false;
        this.viewLtc = false;
        this.viewNeo = false;
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

    showBnb() {
        if(this.viewBnb === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewBnb = true;
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

    showNeo() {
        if(this.viewNeo === true) {
            this.hideAll();
        } else {
            this.hideAll();
            this.viewNeo = true;
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