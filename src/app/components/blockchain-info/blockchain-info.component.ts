import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';

@Component({
  selector: 'blockchain-info',
  templateUrl: './blockchain-info.component.html',
  styleUrls: ['./blockchain-info.component.css']
})
export class BlockchainInfoComponent implements OnInit {
  blockchains: Map<string, Blockchain> = new Map<string, Blockchain>();
  chains: Blockchain[] = [];

  constructor(private chainService: ChainHunterService,
              private titleService: Title) {
    this.titleService.setTitle("Supported Blockchains - The Chain Hunter : Multi Blockchain Search | BTC, ETH, LTC, BCH, XRP, and more!");
  }

  ngOnInit() { 
      this.getChains();       
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
}
