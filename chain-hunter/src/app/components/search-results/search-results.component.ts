import { OnInit, Input, Component } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';

@Component({
    selector: 'search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.css']
})

export class SearchResultsComponent implements OnInit{
    @Input() blockchain: Blockchain;

    constructor() {}

    ngOnInit() {
    }
}