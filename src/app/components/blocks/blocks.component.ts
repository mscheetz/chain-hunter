import { Component, OnInit, Input } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {
  @Input() blockchain: Blockchain;
  
  constructor() {
   }

  ngOnInit() {
  }

}
