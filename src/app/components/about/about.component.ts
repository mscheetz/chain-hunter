import { OnInit, Component } from '@angular/core';
import { ChainHunterService } from 'src/app/services/chainHunter-svc.service';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';

@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit{
    blockchains: Map<string, Blockchain> = new Map<string, Blockchain>();
    chains: Blockchain[] = [];

    constructor(private chainService: ChainHunterService) {
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
        Array.from(this.blockchains.values()).forEach(value => {
            this.chains.push(value);
        })
        this.blockchains.forEach((value: Blockchain, key: string) => {
            this.chains.push(value);
        });
    }
}