import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api-svc.service';
import { UserData } from 'src/app/classes/UserData';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.css']
})
export class MyPageComponent implements OnInit {
  savedSearches: UserData[] = [];
  blockchains: Map<number, Blockchain> = new Map<number, Blockchain>();

  constructor(private apiSvc: ApiService) { }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.apiSvc.getUserData()
        .subscribe(data => {
          this.savedSearches = data;
        })
  }

  loadEmptyMap(){
    if(this.savedSearches.length === 0) return;

    for(let i = 0; i < this.savedSearches.length; i++){
      this.blockchains[i] = null;
    }
  }

  onExpand(event) {
    const idx = event.index;
    const toSearch = this.savedSearches[idx];
    this.blockchains[idx] = 0;

    if(toSearch.type === "address") {
      this.apiSvc.getAddress(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.blockchains[idx] = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    } else if (toSearch.type === "contract"){
      this.apiSvc.getContract(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.blockchains[idx] = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    } else if (toSearch.type === "transaction"){
      this.apiSvc.getTransaction(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.blockchains[idx] = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    }
  }

}
