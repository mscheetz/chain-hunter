import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from 'src/app/classes/ChainHunter/transaction.class';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';
import { SearchService } from 'src/app/services/search.service';
import { ResultType } from 'src/app/classes/Enums';
import { Router } from '@angular/router';

@Component({
  selector: 'transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionDetailComponent implements OnInit {
  @Input() blockchain: Blockchain;
  @Input() transaction: Transaction;
  @Input() address: string;
  @Input() showHash: boolean;
  saveThisMessage: string;

  constructor(private searchSvc: SearchService,
              private router: Router) { }

  ngOnInit() {
  }

  saveHover(event, type: string, overlayPanel: OverlayPanel) {
    this.saveThisMessage = "Save this " + this.blockchain.symbol + " " + type;
    
    overlayPanel.toggle(event);
  }

  getAddress(address: string) {
    this.routeCheck(ResultType.address, address);
  }

  getBlock(blockNumber: number) {
    this.routeCheck(ResultType.block, blockNumber.toString());
  }

  getTransaction(hash: string) {
    this.routeCheck(ResultType.transaction, hash);
  }

  routeCheck(type: ResultType, searcher: string) {
    if(this.router.url === "/hunts") {
      let itemType = type === ResultType.address ? 'a' 
                   : type === ResultType.block ? 'b'
                   : type === ResultType.contract ? 'c'
                   : 't';
      this.router.navigate([`/search/${this.blockchain.symbol.toLowerCase()}/${itemType}/${searcher}`]);
    }
    this.searchSvc.setSearchSpec(this.blockchain.symbol, type, searcher);
  }
}
