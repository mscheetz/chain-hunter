import { OnInit, Component, Output, Input, isDevMode } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { HelperService } from 'src/app/services/helper-svc.service';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';
import { Chain } from 'src/app/classes/ChainHunter/Chain';
import { DomSanitizer } from '@angular/platform-browser';
import { CookieData } from 'src/app/classes/ChainHunter/CookieData';
import { CookieService } from 'ngx-cookie-service';
import { CookieRequest } from 'src/app/classes/ChainHunter/CookieRequest';

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
    cookieData: CookieData = null;
    cookieName: string = "tch-cookie-cnt";
    unlimitedCookie: string = "tch-cookie-unlimited";
    searchLimit: boolean = false;
    unlimited: boolean = false;

    constructor(private helperService: HelperService,
                private chainService: ChainHunterService,
                private domSanitizer: DomSanitizer,
                private cookieSvc: CookieService,
                private messageSvc: MessageService) {}

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
        this.getCookies();
        if(this.searchLimit) {
            this.messageSvc.add(
                {
                    key:'search-toast',
                    severity:'warn', 
                    summary:'Search Limit', 
                    detail:'You have exceeded your daily search limit of 5 searches per day. Please come back tomorrow. Unlimited searches coming soon. Follow us on twitter to be the first to find out!',
                    sticky: true
                });
            return;
        }
        this.addyTxn = this.addyTxn.trim();        
        if(!this.devMode && (this.previousSearch === this.addyTxn || this.addyTxn === "")) {
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
    }

    startHunt() {
        this.requestedChains = this.map.size;
        this.map.forEach((value: Blockchain, key: string) => {
            this.chainService.getBlockchain(key, this.addyTxn)
                .subscribe(chain => {
                    this.requestedChains--;
                    this.setMap(chain);
                    if(chain.address || chain.transaction || chain.contract) {
                        this.resultsFound.push(chain.name);
                    }
                    this.calculateIcons();
                    this.checkCompleted();
                })
        });
    }

    getCookies() {
        const unlimited = this.cookieSvc.get(this.unlimitedCookie);
        if(unlimited != null && unlimited !== "") {
            this.unlimited = true;
            this.searchLimit = false;
            return;
        }
        const cookie = this.cookieSvc.get(this.cookieName);
        if(this.cookieData != null) {
            this.cookieData = JSON.parse(cookie);
            let cookieRequests: CookieRequest[] = [];
            this.cookieData.requests.forEach(req => {
                const age = this.helperService.getTimestampAge(req.time, "hrs");
                if(age < 24) {
                    cookieRequests.push(req);
                }
            });
            this.cookieData.requests = cookieRequests;
        } else {
            this.cookieData = new CookieData();
            this.cookieData.requests = [];
        }
        if(this.cookieData.requests.length > 4) {
            this.searchLimit = true;
        } else {
            this.searchLimit = false;
        }
    }

    setCookie() {
        if(this.unlimited) {
            return;
        }
        if(this.cookieData == null) {
            this.cookieData = new CookieData();
            this.cookieData.requests = [];
        }
        let request = new CookieRequest();
        request.symbols = this.resultsFound;
        request.time = this.helperService.getUnixTimestamp();
        this.cookieData.requests.push(request);
        const expiry = this.helperService.getFutureUnixTimestamp(1, "days");

        this.cookieSvc.set(this.cookieName, JSON.stringify(this.cookieData), expiry);
    }

    checkCompleted() {
        if(this.requestedChains === 0) {
            this.notRunning = true;
            this.huntStatus = this.resultsFound.length === 0 ? 2 : 3;
            this.setCookie();
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

        chain.icon = iconBase + property + "/" + chain.symbol.toLowerCase() + ".png";

        return chain;
    }
    
    cookieOk(cookie: boolean){
        this.showNotice = false;
    }

    styles: string = `
    <style>
        .img-overlay {
            display: none;
        }
    </style>`;

    getStyles() {
        return this.domSanitizer.bypassSecurityTrustHtml(this.styles); 
    }

    getTopAd() {
        let adContent = `
        <div id="amzn-assoc-ad-698f5215-519e-45fe-87ef-c04a8c734a9d"></div>
        <script async
            src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=698f5215-519e-45fe-87ef-c04a8c734a9d">
        </script>`;
        return this.domSanitizer.bypassSecurityTrustHtml(adContent);
    }

    getBottomAd() {
        let adContent = `
        <div class="alignleft">
          <script type="text/javascript">
            amzn_assoc_ad_type = "banner";
            amzn_assoc_marketplace = "amazon";
            amzn_assoc_region = "US";
            amzn_assoc_placement = "assoc_banner_placement_default";
            amzn_assoc_campaigns = "echodonutkids_2019";
            amzn_assoc_banner_type = "category";
            amzn_assoc_p = "48";
            amzn_assoc_isresponsive = "false";
            amzn_assoc_banner_id = "0MGAVQMJRAZWAZMEA382";
            amzn_assoc_width = "728";
            amzn_assoc_height = "90";
            amzn_assoc_tracking_id = "cnhntr-20";
            amzn_assoc_linkid = "20a4f8d68c90734de973b36c43a5e116";
          </script>
          <script
            src="//z-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&Operation=GetScript&ID=OneJS&WS=1"></script>
        </div>`;
        return this.domSanitizer.bypassSecurityTrustHtml(adContent);
    }
}