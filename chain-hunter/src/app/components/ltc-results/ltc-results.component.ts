import { OnInit, Input, Component } from '@angular/core';
import { LtcTransaction } from 'src/app/classes/LTC/LtcTransaction';
import { LtcAddress } from 'src/app/classes/LTC/LtcAddress';

@Component({
    selector: 'ltc-results',
    templateUrl: './ltc-results.component.html',
    styleUrls: ['./ltc-results.component.css']
})

export class LtcResultsComponent implements OnInit{
    @Input() ltcAddress: LtcAddress;
    @Input() ltcTransaction: LtcTransaction;

    constructor() {}

    ngOnInit() {
    }
}