import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from 'src/app/classes/ChainHunter/Transaction';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() blockchain: Blockchain;
  @Input() transaction: Transaction;
  @Input() address: string;
  @Input() showHash: boolean;
  saveThisMessage: string;

  constructor() { }

  ngOnInit() {
  }

  saveHover(event, type: string, overlayPanel: OverlayPanel) {
      this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
    //this.saveThisMessage = "Coming Soon! Save this " + this.blockchain.symbol + " " + type;
    
    overlayPanel.toggle(event);
  }

}
