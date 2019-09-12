import { Component, OnInit, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'blockchain-info',
  templateUrl: './blockchain-info.component.html',
  styleUrls: ['./blockchain-info.component.css']
})
export class BlockchainInfoComponent implements OnInit {
  blockchains: Map<string, Blockchain> = new Map<string, Blockchain>();
  chains: Blockchain[] = [];
  screenWidth: any;
  selectedChain: string;
  selectedChainType: string;

  constructor(private chainService: ChainHunterService,
              private titleService: Title) {
    this.titleService.setTitle("Supported Blockchains - The Chain Hunter : Multi Blockchain Search | BTC, ETH, LTC, BCH, XRP, and more!");
  }

  ngOnInit() { 
      this.getChains();
      this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    this.screenWidth = window.innerWidth;
  }

  getChains() {
      this.chainService.getEmptyBlockchains()
          .subscribe(chainMap => {
              this.blockchains = chainMap;
              this.buildChains();
          });
  }

  buildChains() {
      for(const [key, value] of Object.entries(this.blockchains)) {
          this.chains.push(value);
      }
  }

  selectChain(event, name: string, overlayPanel: OverlayPanel) {
    this.selectedChain = name;
    overlayPanel.toggle(event);
  }

  selectType(event, chain: Blockchain, overlayPanel: OverlayPanel) {
    this.selectedChainType = chain.type;
    overlayPanel.toggle(event);
  }

  getAbreviatedType(type: string): string {
    if(type === "Payment") {
      return "PAY";
    } else if ( type === "Protocol" ) {
      return "PROT";
    } else if ( type === "Platform" ) {
      return "PLAT";
    } else if ( type === "Storage" ) {
      return "STO";
    } else if ( type === "Privacy" ) {
      return "PRIV";
    } else if ( type === "Computation" ) {
      return "COMP";
    } else if ( type === "Stable Coin" ) {
      return "SC";
    } else if ( type === "Exchange" ) {
      return "EXCH";
    } else if ( type === "Streaming" ) {
      return "STR";
    } else if ( type === "Content" ) {
      return "CONT";
    } else if ( type === "Enterprise" ) {
      return "ENT";
    } else if ( type === "Gaming" ) {
      return "GA";
    } else if ( type === "Social" ) {
      return "SOC";
    } else if ( type === "IoT" ) {
      return "IoT";
    }
  }
}
