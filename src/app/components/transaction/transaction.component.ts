import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from 'src/app/classes/ChainHunter/Transaction';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  @Input() transaction: Transaction;
  @Input() address: string;
  @Input() showHash: boolean;

  constructor() { }

  ngOnInit() {
  }

}
