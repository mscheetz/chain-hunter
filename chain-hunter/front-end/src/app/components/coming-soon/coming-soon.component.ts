import { OnInit, Input, Component } from '@angular/core';
import { Chain } from 'src/app/classes/ChainHunter/Chain';

@Component({
    selector: 'coming-soon',
    templateUrl: './coming-soon.component.html',
    styleUrls: ['./coming-soon.component.css']
})

export class ComingSoonComponent implements OnInit{    
    constructor() {
    }

    @Input() futureChains: Chain[] = [];

    ngOnInit() {        
    }
}