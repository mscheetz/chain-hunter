import { OnInit, Component, Output, Input, isDevMode } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { HelperService } from 'src/app/services/helper-svc.service';
import { ApiService } from 'src/app/services/api-svc.service';
import { Chain } from 'src/app/classes/ChainHunter/Chain';
import { DomSanitizer } from '@angular/platform-browser';
import { CookieData } from 'src/app/classes/ChainHunter/CookieData';
import { CookieService } from 'ngx-cookie-service';
import { CookieRequest } from 'src/app/classes/ChainHunter/CookieRequest';
import { Asset } from 'src/app/classes/ChainHunter/Asset';

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
    @Output() tokensComplete: boolean = true;
    previousSearch: string = "";
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
    @Output() tokenContent: string;

    constructor(private helperService: HelperService,
                private chainService: ApiService,
                private domSanitizer: DomSanitizer,
                private cookieSvc: CookieService,
                private messageSvc: MessageService) {}

    ngOnInit() {
        this.getChains();
        this.nullOut();
        this.updateMenuItems();
    }

    /**
     * Get active and future blockchains
     */
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
                    const iconSrc = `src="assets/cryptoicons/color/${chain.symbol.toLowerCase()}.png"`;
                    const iconName = `title="${chain.name}"`;
                    const icon = `<img ${iconClass} ${iconSrc} ${iconName} />`;
                    this.comingSoon += icon;
                });
            });
    }

    /**
     * Start hunting
     */
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

    /**
     * Null out elements
     */
    nullOut(){
        this.resultsFound = [];
        this.updateMenuItems();
    }

    /**
     * Build map of empty blockchain objects
     */
    buildMap(){
        this.chainService.getEmptyBlockchains()
            .subscribe(map => {
                this.map = new Map<string, Blockchain>();
                Object.keys(map).forEach(e => {
                    this.map.set(map[e].symbol, map[e]);
                });
                this.setBlockchainIcons();
                this.startHunt();
            });
    }

    /**
     * Clear out the current map of blockchains
     */
    clearMap() {
        this.map.forEach((chain, key) => {
            chain.address = null;
            chain.transaction = null;
            chain.icon = chain.icon.replace('color', 'white');
        });
        this.updateMenuItems();
        this.startHunt();
    }

    /**
     * Get results for blockchains
     */
    startHunt() {
        this.requestedChains = this.map.size;
        if(this.map.size > 0) {
            this.map.forEach((value: Blockchain, key: string) => {
                this.chainService.getBlockchain(key, this.addyTxn)
                    .subscribe(chain => {
                        this.requestedChains--;
                        this.setMap(chain);
                        if(chain.address || chain.transaction || chain.contract) {
                            this.resultsFound.push(chain.name);
                        }
                        this.updateMenuItems();
                        this.checkCompleted();
                    })
            });
        }
    }

    /**
     * Read cookies for search counts
     */
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

    /**
     * Set cookie for search counts
     */
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

    /**
     * Check if search is complete
     */
    checkCompleted() {
        if(this.requestedChains === 0) {
            this.notRunning = true;
            this.huntStatus = this.resultsFound.length === 0 ? 2 : 3;
            if(this.resultsFound.length === 0) {
                this.chainService.emptySearch()
                    .subscribe(res => {
                        return;
                    });
            }
            this.setCookie();
        }
    }

    /**
     * Get Address transactions
     * 
     * @param symbol Blockchain symbol
     */
    getAddressTxns(symbol: string): any {
        this.txnsComplete = false;
        let chain = this.getBlockchain(symbol);
        this.chainService.getAddressTransactions(symbol, chain.address.address)
            .subscribe(txns => {
                chain.address.transactions = txns;
                this.txnsComplete = true;
            });
    }

    /**
     * Get Address tokens
     * 
     * @param symbol Blockchain symbol
     */
    getAddressTokens(symbol: string): any {
        this.tokensComplete = false;
        let chain = this.getBlockchain(symbol);
        this.chainService.getAddressTokens(symbol, chain.address.address)
            .subscribe(tokens => {
                this.tokensComplete = true;
                chain.address.tokens = tokens;
                this.buildTokens();
            });
    }

    /**
     * Build token display
     */
    buildTokens() {
        let i = 1;
        this.tokenContent = ``;
        this.blockchain.address.tokens.forEach(token => {            
            this.tokenContent += `<div class="p-col-12 p-md-6 p-lg-4"><div class="box token-format">` + this.getTokenInfo(token) + `</div></div>`;
            if(i === 3) {
                i = 1;
            } else {
                i++;
            }
        });

        while(i < 3) {
            i++;
            this.tokenContent += `<div class="p-col-12 p-md-6 p-lg-4"></div>`;
        }
    }

    /**
     * Get token information to display
     * 
     * @param token Token object
     */
    getTokenInfo(token: Asset): string {
        let info = ``;
        if(token.name !== null) {
            info += `<p>Name: ` + token.name + `</p>`;
        }
        if(token.symbol !== null || token.hasIcon) {
            info += `<p>`;
            if(token.symbol !== null) {
                info += `Symbol: ` + token.symbol;
            }
            if(token.hasIcon) {
                if(token.symbol !== null) {
                    info += `&nbsp;&nbsp;`;
                }
                info += `<img src="/assets/cryptoicons/color/` + token.symbol.toLowerCase() + `.png" />`;
            }
            info += `</p>`;
        }
        info += `<p>Quantity: ` + token.quantity + `</p>`;        

        return info;        
    }

    /**
     * Update menu icons based on search results
     */
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

    /**
     * Set icons
     */
    setBlockchainIcons() {
        this.map.forEach((value: Blockchain, key: string) => {
            value = this.getMenuIcon(value);
            this.setMap(value);
        });
    }

    /**
     * Get a given blockchain
     * 
     * @param symbol Blockchain symbol
     */
    getBlockchain(symbol: string): Blockchain {
        let chain = this.map.get(symbol);
        return chain;
    }

    /**
     * Set blockchain in the map
     * 
     * @param chain Blockchain object
     */
    setMap(chain: Blockchain) {
        this.map.set(chain.symbol, chain);
    }

    /**
     * Show a given blockchain search result
     * 
     * @param symbol Blockchain symbol
     * @param event event object
     */
    showItem(symbol: string, event: any) {
        if(this.seeItem && this.selectedChain === symbol) {
            this.blockchain = null;
            this.seeItem = false;
            this.selectedChain = "";
            this.activeItem = null;
        } else {            
            this.blockchain = this.getBlockchain(symbol);
            if(this.blockchain.hasTokens 
                && this.blockchain.address !== null 
                && (typeof this.blockchain.address.tokens !== "undefined") 
                && this.blockchain.address.tokens !== null 
                && this.blockchain.address.tokens.length > 0) {
                this.buildTokens();
            }
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