import { OnInit, Input, Component } from '@angular/core';
import { NeoAddress } from 'src/app/classes/NEO/NeoAddress';
import { NeoAddressTxn } from 'src/app/classes/NEO/NeoAddressTxn';
import { NeoTransaction } from 'src/app/classes/NEO/NeoTransaction';

@Component({
    selector: 'neo-results',
    templateUrl: './neo-results.component.html',
    styleUrls: ['./neo-results.component.css']
})

export class NeoResultsComponent implements OnInit{
    @Input() neoAddress: NeoAddress;
    @Input() neoTransaction: NeoTransaction;
    @Input() neoTransactions: NeoAddressTxn[];

    constructor() {
    }

    ngOnInit() {        
    }
}