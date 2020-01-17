import { OnInit, Component, Output, Input, isDevMode, HostListener } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { HelperService } from 'src/app/services/helper.service';
import { ApiService } from 'src/app/services/api.service';
import { Chain } from 'src/app/classes/ChainHunter/chain.class';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { CookieData } from 'src/app/classes/ChainHunter/cookie-data.class';
import { CookieService } from 'ngx-cookie-service';
import { CookieRequest } from 'src/app/classes/ChainHunter/cookie-request.class';
import { Asset } from 'src/app/classes/ChainHunter/asset.class';
import { Interval, ResultType } from '../../classes/Enums';
import { SearchService } from 'src/app/services/search.service';
import { SearchSpec } from 'src/app/classes/ChainHunter/search-spec.class';
import { ActivatedRoute } from '@angular/router';

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
    searchLimitCookie: string = "tch-cookie-search";
    searchLimit: boolean = false;
    searchLimitSize: number = 3;
    unlimited: boolean = false;
    windowWidth: number = 0;
    @Output() tokenContent: string;
    searchSpec: SearchSpec = null;
    latestBlocks: boolean = false;

    constructor(private titleService: Title,
                private helperService: HelperService,
                private apiSvc: ApiService,
                private domSanitizer: DomSanitizer,
                private cookieSvc: CookieService,
                private messageSvc: MessageService,
                private searchSvc: SearchService,
                private route: ActivatedRoute) {
        let symbol = this.route.snapshot.paramMap.get('symbol');
        let type = this.route.snapshot.paramMap.get('type');
        let toFind = this.route.snapshot.paramMap.get('toFind');

        if(typeof symbol !== 'undefined' && symbol !== null && symbol !== "" 
            && typeof type !== 'undefined' && type !== null && type !== ""
            && typeof toFind !== 'undefined' && toFind !== null && toFind !== "") {
                let searchType = type === "a" ? ResultType.address 
                               : type === "b" ? ResultType.block
                               : type === "bx" ? ResultType.blocks
                               : type === "c" ? ResultType.contract
                               : type === "t" ? ResultType.transaction
                               : ResultType.none;

                this.searchSvc.setSearchSpec(symbol, searchType, toFind);
                this.searchSpec = new SearchSpec();
                this.searchSpec.chain = symbol;
                this.searchSpec.searchString = toFind;
                this.searchSpec.type = searchType;
                this.startSearch();
            }
        this.titleService.setTitle("The Chain Hunter : Multi Blockchain Search | BTC, ETH, LTC, BCH, XRP, and more!");
        this.searchSvc.newSearch.subscribe(val => {
            this.searchSpec = val;
            if(this.searchSpec !== null) {
                this.startSearch();
            }
        })
    }

    startSearch() {
        this.addyTxn = this.searchSpec.searchString;
        this.chainHunt();
    }

    ngOnInit() {
        this.windowWidth = window.innerWidth;
        this.guestAccountSearchLimit();
        this.getChains();
        this.nullOut();
        this.updateMenuItems();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event){
        this.windowWidth = window.innerWidth;
    }

    guestAccountSearchLimit() {
        this.apiSvc.getAccountTypes()
            .subscribe(res => {
                res.forEach(r =>{
                    if(r.name === 'Guest') {
                        this.searchLimitSize = +r.searchLimit;
                    }
                })
            })
    }

    /**
     * Get active and future blockchains
     */
    getChains() {
        this.apiSvc.getActiveChains()
            .subscribe(chains => {
                this.activeChains = chains;
            },
            error => {
                this.offLine = true;
            });
        this.apiSvc.getFutureChains()
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
        this.addyTxn = this.addyTxn.toString().trim();        
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
        this.apiSvc.getEmptyBlockchains()
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
        this.latestBlocks = false;
        this.requestedChains = this.map.size;
        if(this.map.size > 0) {
            this.map.forEach((value: Blockchain, key: string) => {
                if(this.searchSpec === null && !this.latestBlocks) {
                    this.generalSearch(key, this.addyTxn);
                } else {
                    if(this.searchSpec !== null && this.searchSpec.chain.toLowerCase() === "all") {
                        this.latestBlocks = true;
                        this.searchSpec = null;
                    }
                    this.targetedSearch(key);
                }
            });
        }
    }

    /**
     * Targeted blockchain search
     * 
     * @param symbol blockchain symbol
     */
    targetedSearch(symbol: string){
        if(this.latestBlocks){
                this.latestBlocksSearch(symbol);
        } else if(this.searchSpec) {
            if(this.searchSpec.chain.toLowerCase() === symbol.toLowerCase()) {
                //this.addyTxn = this.searchSpec.searchString;
                this.requestedChains = 1;
                if(this.searchSpec.type === ResultType.address) {
                    this.addressSearch(this.searchSpec.chain, this.searchSpec.searchString);
                } else if(this.searchSpec.type === ResultType.block) {
                    this.blockSearch(this.searchSpec.chain, this.searchSpec.searchString);
                } else if(this.searchSpec.type === ResultType.blocks) {
                    this.latestBlocksSearch(this.searchSpec.chain);
                } else if(this.searchSpec.type === ResultType.contract) {
                    this.addressSearch(this.searchSpec.chain, this.searchSpec.searchString);
                } else if(this.searchSpec.type === ResultType.transaction) {
                    this.transactionSearch(this.searchSpec.chain, this.searchSpec.searchString);
                }
            }
        }
    }

    /**
     * Search for an address
     * 
     * @param symbol symbol of blockchain
     * @param address search string 
     */
    addressSearch(symbol: string, address: string) {
        this.apiSvc.getAddress(symbol, address)
            .subscribe(chain => {
                this.searchSpec = null;
                this.processSearchResult(chain);
            });
    }

    /**
     * Search for a block
     * 
     * @param symbol symbol of blockchain
     * @param blockNumber search string 
     */
    blockSearch(symbol: string, blockNumber: string) {
        this.apiSvc.getBlock(symbol, blockNumber)
            .subscribe(chain => {
                this.searchSpec = null;
                this.processSearchResult(chain);
            });
    }

    /**
     * Search for a block
     * 
     * @param symbol symbol of blockchain
     */
    latestBlocksSearch(symbol: string) {
        this.apiSvc.getLatestBlocks(symbol)
            .subscribe(chain => {
                this.searchSpec = null;
                this.processSearchResult(chain);
            });
    }

    /**
     * Search for a contract
     * 
     * @param symbol symbol of blockchain
     * @param address search string 
     */
    contractSearch(symbol: string, address: string) {
        this.apiSvc.getContract(symbol, address)
            .subscribe(chain => {
                this.searchSpec = null;
                this.processSearchResult(chain);
            });
    }

    /**
     * Search for a transaction
     * 
     * @param symbol symbol of blockchain
     * @param hash search string 
     */
    transactionSearch(symbol: string, hash: string) {
        this.apiSvc.getTransaction(symbol, hash)
            .subscribe(chain => {
                this.searchSpec = null;
                this.processSearchResult(chain);
            });
    }

    /**
     * General search of a blockchain
     * 
     * @param symbol symbol of blockchain
     * @param toSearch search string
     */
    generalSearch(symbol: string, toSearch: string) {
        this.apiSvc.getBlockchain(symbol, toSearch)
            .subscribe(chain => {
                this.processSearchResult(chain);
            });
    }

    processSearchResult(chain: Blockchain) {
        this.requestedChains--;
        this.setMap(chain);
        if(chain.address || chain.block || chain.blocks || chain.transaction || chain.contract) {
            this.resultsFound.push(chain.name);
        }
        this.updateMenuItems();
        this.checkCompleted();
    }

    /**
     * Read cookies for search counts
     */
    getCookies() {
        let cookies = this.cookieSvc.getAll();
        const unlimited = this.cookieSvc.get(this.unlimitedCookie);
        if(typeof unlimited !== "undefined" && unlimited !== null && unlimited !== "") {
            this.unlimited = true;
            this.searchLimit = false;
            return;
        }
        const searchCookie = this.cookieSvc.get(this.searchLimitCookie);
        if(typeof searchCookie !== "undefined" && searchCookie !== null && searchCookie !== "") {
            this.searchLimitSize = parseInt(JSON.parse(searchCookie));
        }
        const countCookie = this.cookieSvc.get(this.cookieName);
        if(this.cookieData != null) {
            this.cookieData = JSON.parse(countCookie);
            let cookieRequests: CookieRequest[] = [];
            this.cookieData.requests.forEach(req => {
                const age = this.helperService.getTimestampAge(req.time, Interval.Hour);
                if(age < 24) {
                    cookieRequests.push(req);
                }
            });
            this.cookieData.requests = cookieRequests;
        } else {
            this.cookieData = new CookieData();
            this.cookieData.requests = [];
        }
        if(this.cookieData.requests.length > +this.searchLimitSize) {
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
        const expiry = this.helperService.getFutureUnixTimestamp(1, Interval.Day);

        this.cookieSvc.set(this.cookieName, JSON.stringify(this.cookieData), expiry);
    }

    /**
     * Check if search is complete
     */
    checkCompleted() {
        if(this.requestedChains === 0) {
            this.notRunning = true;
            this.latestBlocks = false;
            this.huntStatus = this.resultsFound.length === 0 ? 2 : 3;
            if(this.resultsFound.length === 0) {
                this.apiSvc.emptySearch()
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
        this.apiSvc.getAddressTransactions(symbol, chain.address.address)
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
        this.apiSvc.getAddressTokens(symbol, chain.address.address)
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
            let visible = this.windowWidth < 768 ? false : true;
            if (value.address || value.block || value.contract || value.transaction) {
                visible = true;
         //       this.huntStatus = 3;
            }
            this.menuItems.push({ 
                label: value.symbol, 
                icon: value.icon,
                visible: visible,
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