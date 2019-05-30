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
import { BnbAddressTransaction } from 'src/app/classes/BNB/BnbAddressTransaction';
import { BnbTransaction } from 'src/app/classes/BNB/BnbTransaction';
import { BnbAddress } from 'src/app/classes/BNB/BnbAddress';
import { BnbService } from 'src/app/services/bnb-svc.service';
import { NeoAddressTxn } from 'src/app/classes/NEO/NeoAddressTxn';
import { NeoTransaction } from 'src/app/classes/NEO/NeoTransaction';
import { NeoAddress } from 'src/app/classes/NEO/NeoAddress';
import { NeoService } from 'src/app/services/neo-svc.service';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { stringify } from 'querystring';
import { EthBlock } from 'src/app/classes/ETH/EthBlock';

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
    @Output() bnbAddress: BnbAddress = null;
    @Output() bnbTransaction: BnbTransaction = null;
    @Output() bnbTransactions: BnbAddressTransaction[] = null;
    bnbFound: boolean = false;
    viewBnb: boolean = false;
    bnbComplete: boolean = true;
    bnbIcon: string;
    @Output() ethAddress: EthAddress = null;
    @Output() ethTransaction: EthTransaction = null;
    @Output() ethTransactions: EthTransaction[] = null;
    ethFound: boolean = false;
    ethBlockCount: number = 0;
    ethLatestBlock: string = null;
    ethBlocks: Map<string, EthBlock> = new Map<string, EthBlock>();
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
    @Output() neoAddress: NeoAddress = null;
    @Output() neoTransaction: NeoTransaction = null;
    @Output() neoTransactions: NeoAddressTxn[] = null;
    neoFound: boolean = false;
    viewNeo: boolean = false;
    neoIcon: string;
    neoComplete: boolean = true;
    items: MenuItem[];
    emptyHanded: boolean = false;
    notRunning: boolean = true;
    @Output() samplesIndex = null;
    @Output() blockchain: Blockchain = null;
    map: Map<string, Blockchain> = new Map<string, Blockchain>();
    menuItems: MenuItem[];
    selectedChain: string = "";

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
        this.bchFound = false;
        this.bnbFound = false;
        this.btcFound = false;
        this.ethFound = false;
        this.ltcFound = false;
        this.neoFound = false;
        this.rvnFound = false;
        this.xrpFound = false;
        this.btcAddress = null;
        this.btcTransaction = null;
        this.btcTransactions = null;
        this.bnbAddress = null;
        this.bnbTransaction = null;
        this.bnbTransactions = null;
        this.bchAddress = null;
        this.bchTransaction = null;
        this.bchTransactions = null;
        this.ethAddress = null;
        this.ethTransaction = null;
        this.ethTransactions = null;
        this.ltcAddress = null;
        this.ltcTransaction = null;
        this.neoAddress = null;
        this.neoTransaction = null;
        this.neoTransactions = null;
        this.rvnAddress = null;
        this.rvnTransaction = null;
        this.rvnTransactions = null;
        this.xrpAddress = null;
        this.xrpTransaction = null;
        this.xrpTransactions = null;
        this.emptyHanded = false;
        this.btcComplete = this.bnbComplete = this.bchComplete = 
        this.ethComplete = this.ltcComplete = this.neoComplete = 
        this.rvnComplete = this.xrpComplete = false;
        this.map = new Map<string, Blockchain>();
        this.calculateIcons();
    }

    chainHunt(){
        this.samplesIndex = -100;
        this.hideAll();
        this.nullOut();
        this.buildMap();
        this.notRunning = false;
        this.btcService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.err_no === 0 && address.data !== null) {
                    this.btcAddress = address.data
                    this.btcFound = true;
                    let btc = this.getBlockchain("BTC");
                    btc.address = this.btcService.addressConvert(address.data);
                    this.setMap(btc);
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
        this.bnbService.getAddress(this.addyTxn)
            .subscribe(address => {
                this.bnbAddress = address;
                this.bnbFound = true;
                this.getBnbTransactions();
                this.emptyHanded = false;
                this.bnbComplete = true;
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
                    this.bchAddress = address.data
                    this.bchFound = true;
                    let bch = this.getBlockchain("BCH");
                    bch.address = this.bchService.addressConvert(address.data);
                    this.setMap(bch);
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
                if((addressResponse.status === "1" || addressResponse.message === "OK") 
                    && addressResponse.result !== "0" ) {
                    this.ethAddress = new EthAddress();
                    this.ethAddress.Address = this.addyTxn;
                    this.ethAddress.Balance = parseInt(addressResponse.result);
                    this.ethFound = true;
                    this.ethBlocks = new Map<string, EthBlock>();
                    this.ethLatestBlock = null;
                    let eth = this.getBlockchain("ETH");
                    eth.address = this.ethService.addressConvert(this.ethAddress);
                    this.setMap(eth);
                    this.getEthTokens();
                    //this.getEthTransactions();
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
        this.neoService.getAddress(this.addyTxn)
            .subscribe(address => {
                this.neoAddress = address;
                this.neoFound = true;
                this.getNeoTransactions();
                this.emptyHanded = false;
                this.neoComplete = true;
                this.calculateIcons();
                console.log("neo address found");
            },
            error => {
                this.getNeoTransaction();
                console.log("neo address error:" + error);
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

    getBtcTransactions() {
        this.btcService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.btcTransactions = txns.data
                let btc = this.getBlockchain("BTC");
                btc.address.transactions = this.btcService.transactionsConvert(txns.data.list);
                this.setMap(btc);
            });
    }

    getBnbTransaction() {
        this.bnbService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.bnbComplete = true;
                this.bnbTransaction = txn;
                this.bnbFound = true;
                this.emptyHanded = false;
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
        this.bnbService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.bnbTransactions = txns.tx
            });
    }

    getBchTransaction() {
        this.bchService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.bchComplete = true;
                if(txn.err_no === 0) {
                    this.bchTransaction = txn.data
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
        this.bchService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.bchTransactions = txns.data;
                let bch = this.getBlockchain("BCH");
                bch.address.transactions = this.bchService.transactionsConvert(txns.data.list);
                this.setMap(bch);
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
                    this.ethTransaction = txn.result
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
            });
    }

    getEthBlock(block: string) {
        this.ethService.getBlock(block).subscribe(result => {
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
                if(this.ethTxnReady()) {
                    this.buildEthTransactions();
                }
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

    getNeoTransaction() {
        this.neoService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.neoComplete = true;
                this.neoTransaction = txn;
                this.neoFound = true;
                this.emptyHanded = false;
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
        this.neoService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                this.neoTransactions = txns.entries
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
        this.bnbIcon = this.getIcon("bnb", this.bnbFound);
        this.btcIcon = this.getIcon("btc", this.btcFound);
        this.ethIcon = this.getIcon("eth", this.ethFound);
        this.ltcIcon = this.getIcon("ltc", this.ltcFound);
        this.neoIcon = this.getIcon("neo", this.neoFound);
        this.rvnIcon = this.getIcon("rvn", this.rvnFound);
        this.xrpIcon = this.getIcon("xrp", this.xrpFound);
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
        this.items = [
            { label: 'btc', icon: this.btcIcon, styleClass: this.btcFound ? 'found-bg' : 'not-found-bg', command: (event) => { this.showBtc() } },
            { label: 'bch', icon: this.bchIcon, command: (event) => { this.showBch() } },
            { label: 'eth', icon: this.ethIcon, command: (event) => { this.showEth() } },
            { label: 'ltc', icon: this.ltcIcon, command: (event) => { this.showLtc() } },
            { label: 'neo', icon: this.neoIcon, command: (event) => { this.showNeo() } },
            { label: 'rvn', icon: this.rvnIcon, command: (event) => { this.showRvn() } },
            { label: 'xrp', icon: this.xrpIcon, command: (event) => { this.showXrp() } },
            { label: 'bnb', icon: this.bnbIcon, command: (event) => { this.showBnb() } },
        ]
        this.menuItems = [];
        this.map.forEach((value: Blockchain, key: string) => {
            this.menuItems.push({ 
                label: value.symbol, 
                icon: value.icon,
                command: (event) => { this.showItem(value.symbol) }
            });
        });
    }

    buildMap(){
        this.map = new Map<string, Blockchain>();
        this.map.set("BTC", this.btcService.getBlockchain());
        this.map.set("BCH", this.bchService.getBlockchain());
        this.map.set("ETH", this.ethService.getBlockchain());

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

    // getMenuIcon(symbol: string): string {
    //     let chain = this.getBlockChain(symbol);

    //     return chain.getIcon();
    // }

    seeItem: boolean = false;

    showItem(symbol: string) {
        if(this.seeItem && this.selectedChain === symbol) {
            this.blockchain = null;
            this.seeItem = false;
            this.selectedChain = "";
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