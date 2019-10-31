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
  gettingData: boolean = false;
  blockchain: Blockchain = null;

  constructor(private apiSvc: ApiService) { }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    this.gettingData = true;
    this.apiSvc.getUserData()
        .subscribe(data => {
          this.gettingData = false;
          this.savedSearches = data;
          this.savedSearches.forEach((value, key: number) => {
            value.blockchain = null;
            this.blockchains[key] = 0;
          })
        })
  }

  loadEmptyMap(){
    if(this.savedSearches.length === 0) return;

    for(let i = 0; i < this.savedSearches.length; i++){
      this.blockchains[i] = null;
    }
  }

  onRefresh(event, data: UserData) {
    const idx = 0; /// TODO GET INDEX of savedSearches for the selected data, null blockchain out
    event.index = idx;
    this.onExpand(event);
  }

  onExpand(event) {
    const idx = event.index;
    const toSearch = this.savedSearches[idx];
    if(this.savedSearches[idx].blockchain !== null) {
      return;
    }
    this.blockchains[idx] = 0;

    if(toSearch.type === "address") {
      this.apiSvc.getAddress(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.savedSearches[idx].blockchain = data;
            this.blockchains[idx] = data;
            this.blockchain = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    } else if (toSearch.type === "contract"){
      this.apiSvc.getContract(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.savedSearches[idx].blockchain = data;
            this.blockchains[idx] = data;
            this.blockchain = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    } else if (toSearch.type === "transaction"){
      this.apiSvc.getTransaction(toSearch.symbol, toSearch.hash)
          .subscribe(data => {
            this.savedSearches[idx].blockchain = data;
            this.blockchains[idx] = data;
            this.blockchain = data;
          }, err => {
            this.blockchains[idx] = -1
          });
    }
  }

}
