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
import { EosService } from 'src/app/services/eos-svc.service';
import { EosAddress } from 'src/app/classes/EOS/EosAddress';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    @Output() addyTxn: string;
    
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
    requestedChains: number = 0;
    @Output() resultsFound: string[] = [];
    @Output() huntStatus: number = 0; // 0 = no search yet, 1 = searching, 2 = nothing found, 3 = something found

    constructor(private helperService: HelperService,
                private chainService: ChainHunterService) {}

    ngOnInit() {
        this.nullOut();
        this.updateMenuItems();
    }

    nullOut(){
        this.map = new Map<string, Blockchain>();
        this.resultsFound = [];
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
        //this.startHunt();
    }

    startHunt() {
        this.requestedChains = this.map.size;
        this.map.forEach((value: Blockchain, key: string) => {
            this.chainService.getBlockchain(key, this.addyTxn)
                .subscribe(chain => {
                    this.requestedChains--;
                    this.setMap(chain);
                    if(chain.address || chain.transaction) {
                        this.resultsFound.push(chain.symbol);
                    }
                    this.calculateIcons();
                    this.checkCompleted();
                })
        });
    }

    checkCompleted() {
        if(this.requestedChains === 0){            
            this.notRunning = true;
        }
    }

    getAddressTxns(symbol: string): any {
        let chain = this.getBlockchain(symbol);
        this.chainService.getAddressTransactions(symbol, chain.address.address)
            .subscribe(txns => {
                chain.address.transactions = txns;
            });
    }

    getAddressTokens(symbol: string): any {
        let chain = this.getBlockchain(symbol);
        this.chainService.getAddressTokens(symbol, chain.address.address)
            .subscribe(tokens => {
                chain.address.tokens = tokens;
            });
    }

    calculateIcons() {
        this.updateMenuItems();
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
        this.chainService.getEmptyBlockchains()
            .subscribe(map => {
                this.map = new Map<string, Blockchain>();
                Object.keys(map).forEach(e => {
                    this.map.set(e, map[e]);
                });
                this.setBlockchainIcons();
                this.startHunt();
            });
    }

    setBlockchainIcons() {
        this.map.forEach((value: Blockchain, key: string) => {
            value = this.getMenuIcon(value);
            this.setMap(value);
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