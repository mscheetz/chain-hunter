import { OnInit, Input, Component } from '@angular/core';
import { XrpAddressTransaction } from 'src/app/classes/XRP/XrpAddressTransaction';
import { XrpAddress } from 'src/app/classes/XRP/XrpAddress';
import { XrpTransaction } from 'src/app/classes/XRP/XrpTransaction';

@Component({
    selector: 'xrp-results',
    templateUrl: './xrp-results.component.html',
    styleUrls: ['./xrp-results.component.css']
})

export class XrpResultsComponent implements OnInit{
    @Input() xrpAddress: XrpAddress;
    @Input() xrpTransaction: XrpTransaction;
    @Input() xrpTransactions: XrpAddressTransaction[];

    constructor() {}

    ngOnInit() {
    }
}