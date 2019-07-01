import { OnInit, Input, Component } from '@angular/core';
import { Chain } from 'src/app/classes/ChainHunter/Chain';

@Component({
    selector: 'active-chains',
    templateUrl: './active-chains.component.html',
    styleUrls: ['./active-chains.component.css']
})

export class ActiveChainsComponent implements OnInit{    
    constructor() {
    }

    @Input() activeChains: Chain[] = [];

    ngOnInit() {        
    }
}