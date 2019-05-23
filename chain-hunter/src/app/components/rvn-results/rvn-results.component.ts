import { OnInit, Input, Component } from '@angular/core';
import { RvnAddress } from 'src/app/classes/RVN/RvnAddress';
import { RvnTransaction } from 'src/app/classes/RVN/RvnTransaction';

@Component({
    selector: 'rvn-results',
    templateUrl: './rvn-results.component.html',
    styleUrls: ['./rvn-results.component.css']
})

export class RvnResultsComponent implements OnInit{
    @Input() rvnAddress: RvnAddress;
    @Input() rvnTransaction: RvnTransaction;
    @Input() rvnTransactions: RvnTransaction[];

    constructor() {}

    ngOnInit() {
    }
}