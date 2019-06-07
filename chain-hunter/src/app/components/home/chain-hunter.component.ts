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
import { AionService } from 'src/app/services/aion-svc.service';
import { AionTokenDetail } from 'src/app/classes/AION/AionTokenDetail';
import { AionToken } from 'src/app/classes/AION/AionToken';
import { HelperService } from 'src/app/services/helper-svc.service';
import { TrxAddress } from 'src/app/classes/TRX/TrxAddress';
import { TrxService } from 'src/app/services/trx-svc.service';
import { TrxToken20 } from 'src/app/classes/TRX/TrxToken20';
import { TrxToken10 } from 'src/app/classes/TRX/TrxToken10';
import { IfStmt } from '@angular/compiler';
import { TrxAddress20Token } from 'src/app/classes/TRX/TrxAddress20Token';
import { TrxAddress10Token } from 'src/app/classes/TRX/TrxAddress10Token';
import { strictEqual } from 'assert';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    @Output() addyTxn: string;
    bchComplete: boolean = true;   
    btcComplete: boolean = true;
    bnbComplete: boolean = true;
    ethComplete: boolean = true; 
    ltcComplete: boolean = true;
    neoComplete: boolean = true;
    rvnComplete: boolean = true;
    aionComplete: boolean = true;
    xrpComplete: boolean = true;    
    trxComplete: boolean = true;

    /*ETH materials*/
    ethBlockFound: boolean = true;
    ethBlockCount: number = 0;
    ethLatestBlock: string = null;
    ethBlocks: string[] = [];

    /*AION materials */
    aionLatestBlock: string = null;
    aionTokenCount: number = 0;
    aionTokenContracts: string[];
    aionTokens: AionTokenDetail[] = [];

    /*TRX materials */
    trxAddress: TrxAddress = null;
    trx10Complete: boolean = true;
    trx20Complete: boolean = true;
    trxTokens: Map<string, string> = new Map<string, string>();
    trxTokenPage: number = 1;
    trx10s: TrxAddress10Token[];
    trx20s: TrxAddress20Token[];
    trx10Count: number = 0;
    
    notRunning: boolean = true;
    seeItem: boolean = false;
    activeItem: MenuItem;
    @Output() blockchain: Blockchain = null;
    map: Map<string, Blockchain> = new Map<string, Blockchain>();
    menuItems: MenuItem[];
    selectedChain: string = "";
    txnsComplete: boolean = true;
    previousSearch: string = "";
    tokensComplete: boolean = true;
    @Output() huntStatus: number = 0; // 0 = no search yet, 1 = searching, 2 = nothing found, 3 = something found

    constructor(private helperService: HelperService,
                private btcService: BtcService, 
                private bchService: BchService,
                private bnbService: BnbService,
                private ethService: EthService,
                private ltcService: LtcService,
                private neoService: NeoService,
                private rvnService: RvnService,
                private xrpService: XrpService,
                private aionService: AionService,
                private trxService: TrxService) {}

    ngOnInit() {
        this.nullOut();
        this.updateMenuItems();
    }

    nullOut(){
        this.btcComplete = this.bnbComplete = this.bchComplete = 
        this.ethComplete = this.ltcComplete = this.neoComplete = 
        this.rvnComplete = this.xrpComplete = this.aionComplete = 
        this.trxComplete = false;
        this.map = new Map<string, Blockchain>();
        this.calculateIcons();
    }

    chainHunt(){
        this.addyTxn = this.addyTxn.trim();
        if(this.previousSearch === this.addyTxn || this.addyTxn === "") {
            return;
        }
        this.huntStatus = 1;
        this.blockchain = new Blockchain();
        this.nullOut();
        this.buildMap();
        this.notRunning = false;
        this.previousSearch = this.addyTxn;
        this.getAddresses();
    }

    getAddresses() {
        this.getBtcAddress();
        this.getBchAddress();
        this.getBnbAddress();
        this.getEthAddress();
        this.getLtcAddress();
        this.getNeoAddress();
        this.getRvnAddress();
        this.getXrpAddress();
        this.getAionAddress();
        this.getTrxAddress();
    }

    getAddressTxns(symbol: string): any {
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
        } else if (symbol === "AION") {
            return this.getAionTransactions();
        } else if (symbol === "TRX") {
            return this.getTrxTransactions();
        }
    }

    getAddressTokens(symbol: string): any {
        if(symbol === "BTC") {
        } else if (symbol === "BCH") {
        } else if (symbol === "ETH") {
            return this.getEthTokens();
        } else if (symbol === "LTC") {
        } else if (symbol === "NEO") {
        } else if (symbol === "RVN") {
        } else if (symbol === "XRP") {
        } else if (symbol === "BNB") {
        } else if (symbol === "AION") {
            return this.getAionTokens();
        } else if (symbol === "TRX") {
            return this.getTrxTokens();
        }
    }

    getBtcAddress() {
        this.btcService.getAddress(this.addyTxn)
            .subscribe(address => {
            if(address.err_no === 0 && address.data !== null) {
                let btc = this.getBlockchain("BTC");
                btc.address = this.btcService.addressConvert(address.data);
                this.setMap(btc);
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
    }

    getBnbAddress() {
        this.bnbService.getAddress(this.addyTxn)
            .subscribe(address => {
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
    }

    getAionAddress() {
        this.aionService.getAddress(this.addyTxn)
            .subscribe(response => {
                if((typeof response.content === "undefined") || response.content.length === 0){
                    console.log("aion address not found");
                    this.getAionTransaction();
                } else {
                    this.aionTokenCount = response.content[0].tokens.length;
                    this.aionTokens = [];
                    this.aionTokenContracts = [];
                    this.setAionTokens(response.content[0].tokens);
                    this.aionComplete = true;
                    let aion = this.getBlockchain("AION");
                    aion.address = this.aionService.addressConvert(response.content[0]);
                    this.setMap(aion);
                    this.calculateIcons();
                    console.log("aion address found");
                }
            },
            error => {
                console.log("aion address error:" + error);
                this.getAionTransaction();
        });
    }

    setAionTokens(tokens: AionToken[]) {
        tokens.forEach(token => {
            this.aionTokenContracts.push(token.contractAddr);
        })
    }

    getBchAddress() {
        this.bchService.getAddress(this.addyTxn)
        .subscribe(address => {
            if(address.err_no === 0 && address.data !== null) {
                let bch = this.getBlockchain("BCH");
                bch.address = this.bchService.addressConvert(address.data);
                this.setMap(bch);
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
    }

    getEthAddress() {
        this.ethService.getAddress(this.addyTxn)
        .subscribe(addressResponse => {
            if((addressResponse.status === "1" || addressResponse.message === "OK") 
                && addressResponse.result !== "0" ) {
                let ethAddress = new EthAddress();
                ethAddress.Address = this.addyTxn;
                ethAddress.Balance = parseInt(addressResponse.result);
                this.ethBlocks = [];
                this.ethLatestBlock = null;
                let eth = this.getBlockchain("ETH");
                eth.address = this.ethService.addressConvert(ethAddress);
                this.setMap(eth);
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
    }

    getLtcAddress() {
        this.ltcService.getAddress(this.addyTxn)
        .subscribe(address => {
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
    }

    getNeoAddress() {
        this.neoService.getAddress(this.addyTxn)
        .subscribe(address => {
            if(address.balance.length > 0) {
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
    }

    getRvnAddress() {
        this.rvnService.getAddress(this.addyTxn)
        .subscribe(address => {
            if(address) {
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
    }

    getXrpAddress() {
        this.xrpService.getAddress(this.addyTxn)
        .subscribe(address => {
            if(address) {
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
                let bnb = this.getBlockchain("BNB");
                bnb.address.transactions = this.bnbService.transactionsConvert(txns.txArray);
                this.setMap(bnb);
                this.txnsComplete = true;
            });
    }

    getAionTransaction() {
        this.aionService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(typeof txn.content === "undefined") {
                    console.log("aion transaction not found");
                    this.aionComplete = true;
                } else {
                    this.aionComplete = true;
                    let aion = this.getBlockchain("AION");
                    aion.transaction = this.aionService.transactionConvert(txn.content[0]);
                    this.setMap(aion);
                    console.log("aion transaction found");
                    this.getAionLatestBlock();
                    this.calculateIcons();
                }
            },
            error => {
                this.aionComplete = true;
                this.calculateIcons();
                console.log("aion transaction error:" + error);
            });
    }

    /**
     * Get latest AION block number
     * 
     * @param multi Is this for multiple transactions?
     */
    getAionLatestBlock(multi: boolean = false) {
        this.aionLatestBlock = null;
        this.aionService.getLatestBlock()
            .subscribe(response => {
                this.aionLatestBlock = response.content[0].blockNumber.toString();
                let aion = this.getBlockchain("AION");
                if(multi) {
                    aion.address.transactions.forEach(txn => {
                        txn.latestBlock = parseInt(this.aionLatestBlock);
                        txn.confirmations = txn.latestBlock - txn.block;
                    })
                } else {
                    aion.transaction.latestBlock = parseInt(this.aionLatestBlock);
                    aion.transaction.confirmations = aion.transaction.latestBlock - aion.transaction.block;
                }
                this.setMap(aion);
            })
    }

    getAionTransactions() {
        this.txnsComplete = false;
        this.aionService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let aion = this.getBlockchain("AION");
                aion.address.transactions = this.aionService.transactionsConvert(txns.content);
                this.setMap(aion);
                this.getAionLatestBlock(true);
                this.txnsComplete = true;
            });
    }

    getAionTokens() {
        this.tokensComplete = false;
        if(this.aionTokenContracts.length === 0){
            this.tokensComplete = true;
            this.aionTokens = [];
            this.buildAionTokens();
        }
        let address = this.getBlockchain("AION").address.address;
        this.aionTokenContracts.forEach(contr => {
            this.aionService.getTokens(address, contr)
                .subscribe(response => {
                    this.aionTokenCount--;
                    this.aionTokens.push(response.content[0]);
                    if(this.aionTokenCount === 0){
                        this.buildAionTokens();
                    }
                })
        })
    }

    buildAionTokens() {
        let aion = this.getBlockchain("AION");
        aion.address.tokens = this.aionService.tokensConvert(this.aionTokens);
        this.setMap(aion);
        this.tokensComplete = true;
    }

    getBchTransaction() {
        this.bchService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                this.bchComplete = true;
                if(txn.err_no === 0) {
                    let bch = this.getBlockchain("BCH");
                    bch.transaction = this.bchService.transactionConvert(txn.data);
                    this.setMap(bch);
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
        this.tokensComplete = false;
        this.ethService.getTokens(this.addyTxn).subscribe(result => {
            this.tokensComplete = true;
            let eth = this.getBlockchain("ETH");
            eth.address.tokens = this.ethService.tokenConvert(result.tokens);
            this.setMap(eth);
        });
    }

    getEthTransaction() {
        this.ethService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(!txn.error && txn.result !== null) {
                    this.ethBlockCount = 1;
                    this.ethBlocks.push(txn.result.blockNumber);
                    let eth = this.getBlockchain("ETH");
                    eth.transaction = this.ethService.transactionConvert(txn.result);
                    this.setMap(eth);
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
                let eth = this.getBlockchain("ETH");
                eth.address.transactions = this.ethService.transactionsConvert(keepers);
                this.setMap(eth);
                this.getEthLastBlock(true);
                keepers.forEach(txn => {
                    if(this.ethBlocks.length === 0 || this.ethBlocks.indexOf(txn.blockNumber) < 0) {
                        this.ethBlockCount++;
                        this.ethBlocks.push(txn.blockNumber);
                        this.getEthBlock(txn.blockNumber, true);
                    }
                });
                this.txnsComplete = true;
                if(this.ethTxnReady()) {
                    this.buildEthTransactions();
                }
            });
    }

    getEthBlock(block: string, multi: boolean = false) {
        let intBlock = parseInt(block);
        this.ethService.getBlock(intBlock).subscribe(result => {
            let blockInfo = result.result;
            this.ethBlockCount--;
            let eth = this.getBlockchain("ETH");
            let time = this.helperService.unixToUTC(parseInt(blockInfo.timestamp));
            if(multi) {
                eth.address.transactions.forEach(txn => {
                    if(txn.block == parseInt(block)){
                        txn.date = time;
                    }
                });
            } else {
                eth.transaction.date = time;
            }            
            this.setMap(eth);
            if(this.ethTxnReady()) {
                this.buildEthTransactions();
            }
        })
    }

    /**
     * Build Eth transactions
     */
    buildEthTransactions(){
        let eth = this.getBlockchain("ETH");
        let multi = eth.transaction !== null ? false : true;

        if(!multi){
            this.ethComplete = true;
        }
    }

    /**
     * Get latest eth block number
     * 
     * @param multi Is this for multiple transactions?
     */
    getEthLastBlock(multi: boolean = false) {
        this.ethBlockFound = false;
        this.ethService.getLatestBlock().subscribe(block => {
            this.ethLatestBlock = block.result;
            let eth = this.getBlockchain("ETH");
            if(multi) {
                eth.address.transactions.forEach(txn => {
                    txn.latestBlock = parseInt(block.result);
                    txn.confirmations = txn.latestBlock - txn.block;
                })
            } else {
                eth.transaction.latestBlock = parseInt(block.result);
                eth.transaction.confirmations = eth.transaction.latestBlock - eth.transaction.block;
            }
            this.setMap(eth);
            this.ethBlockFound = true;
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

    getTrxAddress() {
        this.trxAddress = null;
        this.trxService.getAddress(this.addyTxn)
            .subscribe(address => {
                if(address.address) {
                    this.trxComplete = true;
                    this.trxAddress = address;
                    this.trx10s = address.tokenBalances;
                    this.trx20s = address.trc20token_balances;
                    this.trx10Count = this.trx10s.length;
                    let trx = this.getBlockchain("TRX");
                    trx.address = this.trxService.addressConvert(address);
                    this.setMap(trx);
                    console.log("trx address found");  
                } else {
                    console.log("trx address not found");
                    this.getTrxTransaction();
                }
                this.calculateIcons();
            },
            error => {
                this.calculateIcons();
                console.log("trx address error:" + error);
            });
    }

    getTrxContract() {
        this.trxService.getContract(this.addyTxn)
            .subscribe(contract => {
                this.trxComplete = true;
                if(contract && contract.data.address !== "") {
                    this.trxComplete = true;
                    let trx = this.getBlockchain("TRX");
                    trx.contract = this.trxService.contractConvert(contract.data);
                    this.setMap(trx);
                    console.log("trx contract found");  
                } else {
                    console.log("trx contract not found");
                }
                this.calculateIcons();
            },
            error => {
                this.trxComplete = true;
                this.calculateIcons();
                console.log("trx contract error:" + error);
            });
    }

    getTrxTransaction() {
        this.trxService.getTransaction(this.addyTxn)
            .subscribe(txn => {
                if(txn.hash) {
                    this.trxComplete = true;
                    let trx = this.getBlockchain("TRX");
                    trx.transaction = this.trxService.transactionConvert(txn);
                    this.setMap(trx);
                    console.log("trx transaction found");  
                } else {                    
                    console.log("trx transaction not found");
                    this.getTrxContract();
                }
                this.calculateIcons();
            },
            error => {
                console.log("trx transaction error:" + error);
                this.getTrxContract();
                this.calculateIcons();
            });
    }

    getTrxTransactions() {
        this.txnsComplete = false;
        this.trxService.getAddressTransactions(this.addyTxn)
            .subscribe(txns => {
                let trx = this.getBlockchain("TRX");
                trx.address.transactions = this.trxService.transactionsConvert(txns.data);
                this.setMap(trx);
                this.txnsComplete = true;
            });
    }

    getTrxTokens() {
        this.tokensComplete = false;
        this.buildTrxTokenList();
        // let trx = this.getBlockchain("TRX");
        // trx.address.tokens = this.trxService.tokenConvert(this.trxAddress);
        // this.setMap(trx);
    }

    buildTrxTokenList() {
        this.tokensComplete = false;
        this.trx10Complete = false;
        this.trxTokenPage = 1;
        if(this.trxTokens.size > 0) {
            this.trx10Complete = true;
        }
        this.checkTrxTokenStatus();
    }

    getTrx10TokensMethod() {
        let limit = 200;
        this.trxService.getTrx10Tokens(this.trxTokenPage, limit)
            .subscribe(tokens => {
                tokens.data.forEach(token => {
                    // let idx = this.trx10s.findIndex(t => t.name === token.tokenID.toString())
                    // if(idx >= 0) {
                    //     this.trx10s[idx].symbol = token.abbr;
                    //     this.trx10Count--;
                    // }
                    this.trxTokens.set(token.tokenID.toString(), token.abbr);
                })
                if((this.trxTokenPage * limit) >= tokens.totalAll) {
                    this.trx10Complete = true;  
                } else {
                    this.trxTokenPage++;
                }
                this.checkTrxTokenStatus();
            })
    }

    checkTrxTokenStatus() {
        if(this.trx10Complete || this.trx10Count === 0) {
            this.buildTrxTokens();
        } else {
            this.getTrx10TokensMethod();
        }
    }

    buildTrxTokens() {
        this.trx10s.forEach(token => {
            let symbol = this.trxTokens.get(token.name);
            token.symbol = symbol;
        });

        let trx = this.getBlockchain("TRX");
        trx.address.tokens = this.trxService.tokensConvert(this.trx10s, this.trx20s);
        this.setMap(trx);
        this.tokensComplete = true;
    }

    getTrx20Tokens() {
        let getTokens: boolean = true;
        let doItAgain: boolean = true;
        let returned: boolean = false;
        let page: number = 1;
        let tokenList: TrxToken20[];
        while(getTokens) {
            if(doItAgain) {
                this.trxService.getTrx20Tokens(page)
                    .subscribe(tokens => {
                        returned = true;
                        tokens.trc20_tokens.forEach(token => {
                            tokenList.push(token);
                        })
                        if(tokens.total === tokens.rangeTotal) {
                            getTokens = false;
                            this.trx20Complete = true;
                            this.trxService.setTrx20s(tokenList);
                            if(this.trx10Complete) {
                                this.tokensComplete = true;
                            }
                            doItAgain = false;
                        } else {
                            page++;
                            doItAgain = true;
                        }
                    })
                if(returned) {
                    returned = false;
                } else {
                    doItAgain = false;
                }
            }
        }
    }
    
    calculateIcons() {
        this.checkComplete();
        this.updateMenuItems();
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
        this.huntStatus = this.addyTxn === undefined ? 0 : this.notRunning ? 2 : 1;
        this.map.forEach((value: Blockchain, key: string) => {
            if (value.address || value.transaction) {
                this.huntStatus = 3;
            }
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
        this.map.set("XRP", this.xrpService.getBlockchain());
        this.map.set("NEO", this.neoService.getBlockchain());
        this.map.set("RVN", this.rvnService.getBlockchain());
        this.map.set("TRX", this.trxService.getBlockchain());
        this.map.set("AION", this.aionService.getBlockchain());
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
        let iconBase = "";
        let property = chain.address || chain.transaction ? "color" : "white";

        chain.icon = iconBase + property + "/" + chain.symbol.toLowerCase() + ".svg";

        return chain;
    }
}