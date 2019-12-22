import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from 'src/app/classes/ChainHunter/transaction.class';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { SearchService } from 'src/app/services/search.service';
import { ResultType } from 'src/app/classes/Enums';

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

  constructor(private searchSvc: SearchService) { }

  ngOnInit() {
  }

  saveHover(event, type: string, overlayPanel: OverlayPanel) {
      this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
    
    overlayPanel.toggle(event);
  }

  getAddress(address: string) {
    this.searchSvc.setSearchSpec(this.blockchain.symbol, ResultType.address, address);
  }

  getBlock(blockNumber: string) {
    this.searchSvc.setSearchSpec(this.blockchain.symbol, ResultType.block, blockNumber);
  }

  getTransaction(hash: string) {
    this.searchSvc.setSearchSpec(this.blockchain.symbol, ResultType.transaction, hash);
  }
}
