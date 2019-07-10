import { OnInit, Component, Output, Input, isDevMode } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { HelperService } from 'src/app/services/helper-svc.service';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';
import { Chain } from 'src/app/classes/ChainHunter/Chain';

@Component({
    selector: 'chain-hunter',
    templateUrl: './chain-hunter.component.html',
    styleUrls: ['./chain-hunter.component.css']
})

export class ChainHunterComponent implements OnInit {
    offLine: boolean = false;
    @Output() addyTxn: string;
    @Output() activeChains: Chain[] = [];
    @Output() futureChains: Chain[] = [];
    comingSoon: string = "";
    notRunning: boolean = true;
    seeItem: boolean = false;
    activeItem: MenuItem;
    @Output() blockchain: Blockchain = null;
    map: Map<string, Blockchain> = new Map<string, Blockchain>();
    menuItems: MenuItem[];
    selectedChain: string = "";
    @Output() txnsComplete: boolean = true;
    previousSearch: string = "";
    tokensComplete: boolean = true;
    requestedChains: number = 0;
    @Output() resultsFound: string[] = [];
    @Output() huntStatus: number = 0; // 0 = no search yet, 1 = searching, 2 = nothing found, 3 = something found
    devMode: boolean = isDevMode();
    showNotice: boolean = true;

    constructor(private helperService: HelperService,
                private chainService: ChainHunterService) {}

    ngOnInit() {
        this.getChains();
        this.nullOut();
        this.updateMenuItems();
    }

    nullOut(){
        this.resultsFound = [];
        this.calculateIcons();
    }

    getChains() {
        this.chainService.getActiveChains()
            .subscribe(chains => {
                this.activeChains = chains;
            },
            error => {
                this.offLine = true;
            });
        this.chainService.getFutureChains()
            .subscribe(chains => {
                this.futureChains = chains;
                chains.forEach(chain => {
                    const iconClass = `class="chain-logo-pad"`;
                    const iconSrc = `src="assets/cryptoicons/color/${chain.symbol.toLowerCase()}.svg"`;
                    const iconName = `title="${chain.name}"`;
                    const icon = `<img ${iconClass} ${iconSrc} ${iconName} />`;
                    this.comingSoon += icon;
                });
            });
    }

    chainHunt(){
        this.addyTxn = this.addyTxn.trim();
        if(this.previousSearch === this.addyTxn || this.addyTxn === "") {
            return;
        }
        this.huntStatus = 1;
        this.blockchain = new Blockchain();
        this.selectedChain = '';
        this.nullOut();
        if(this.map.size > 0) {
            this.clearMap();
        } else {
            this.map = new Map<string, Blockchain>();
            this.buildMap();
        }
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
                    if(chain.address || chain.transaction || chain.contract) {
                        this.resultsFound.push(chain.symbol);
                    }
                    this.calculateIcons();
                    this.checkCompleted();
                })
        });
    }

    checkCompleted() {
        if(this.requestedChains === 0) {
            this.notRunning = true;
            this.huntStatus = this.resultsFound.length === 0 ? 2 : 3;
        }
    }

    getAddressTxns(symbol: string): any {
        this.txnsComplete = false;
        let chain = this.getBlockchain(symbol);
        this.chainService.getAddressTransactions(symbol, chain.address.address)
            .subscribe(txns => {
                chain.address.transactions = txns;
                this.txnsComplete = true;
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
       // this.huntStatus = this.addyTxn === undefined ? 0 : this.notRunning ? 2 : 1;
        this.map.forEach((value: Blockchain, key: string) => {
            if (value.address || value.transaction || value.contract) {
         //       this.huntStatus = 3;
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

    clearMap() {
        this.map.forEach((chain, key) => {
            chain.address = null;
            chain.transaction = null;
            chain.icon = chain.icon.replace('color', 'white');
        });
        this.updateMenuItems();
        this.startHunt();
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
        //chain = this.getMenuIcon(chain);
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
    
    cookieOk(){
        this.showNotice = false;
    }
}