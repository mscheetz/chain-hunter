import { Component, OnInit } from '@angular/core';
import { SelectItem, MessageService } from 'primeng/api';

import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { DiscountCode } from 'src/app/classes/discount-code.class';
import { UserCounts } from 'src/app/classes/user-counts.class';
import { AccountType } from 'src/app/classes/account-type.class';
import { ThrowStmt } from '@angular/compiler';
import { Blockchain } from 'src/app/classes/ChainHunter/blockchain.class';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  discountCodes: DiscountCode[] = [];
  displayCodes: DiscountCode[] = [];
  editDiscountCode: DiscountCode = new DiscountCode();
  accountTypes: AccountType[] = [];
  userCounts: UserCounts = new UserCounts();
  newObject: boolean = false;
  updateObject: boolean = false;
  showCodeDialog: boolean = false;
  showBCDialog: boolean = false;
  dialogHeader: string = "";
  activeCodes: boolean = true;
  bcStatus: number = null;
  accounts: SelectItem[] = [];
  dateVal: Date = null;
  timeZone: string = "UTC";
  timeZones: SelectItem[] = [];
  viewBlockchains: boolean = false;
  viewDiscountCodes: boolean = false;
  blockchains: Blockchain[] = [];
  editBlockchain: Blockchain = new Blockchain();
  blockchainStatuses: SelectItem[] = [];
  blockchainTypes: SelectItem[] = [];

  constructor(private apiSvc: ApiService, 
              private helperSvc: HelperService,
              private messageSvc: MessageService) { }

  ngOnInit() {
    this.timeZones.push({ label: 'UTC', value: 'UTC' });
    this.timeZones.push({ label: 'Eastern', value: 'Eastern' });
    this.timeZones.push({ label: 'Pacific', value: 'Pacific' });
    this.apiSvc.getUserCounts()
        .subscribe(res => {
          this.userCounts = res;
        });

    this.blockchainStatuses.push({ label: 'Active', value: 1 });
    this.blockchainStatuses.push({ label: 'Future', value: 0 });

    this.apiSvc.getAccountTypes()
        .subscribe(res => {
          this.accountTypes = res;
          this.accountTypes.forEach(type => {
            this.accounts.push({ label: type.name, value: type.id });
          })
          this.accounts.unshift({ label: '---', value: null });

          this.updateDiscountCodes();
        });
    this.getDiscountCodes();
    this.getBlockchains();
    this.getBlockchainTypes();
  }

  getBlockchainTypes() {
    const types = ['Payment','Protocol','Storage','Platform','Privacy','Computation','Stable Coin','Exchange','Streaming','Content','Enterprise','Gaming','Social','IoT', 'Database'];
    types.forEach(type => {
      this.blockchainTypes.push({ label: type, value: type });
    })
  }

  toggleBlockchains() {
    this.viewBlockchains = !this.viewBlockchains;
    this.viewDiscountCodes = false;
  }

  toggleDiscountCodes() {
    this.viewDiscountCodes = !this.viewDiscountCodes;
    this.viewBlockchains = false;
  }

  getDiscountCodes() {
    this.discountCodes = [];
    this.apiSvc.getDiscountCodes()
        .subscribe(res => {
          this.discountCodes = res;
          this.updateDiscountCodes();
        });
  }

  getBlockchains() {
    this.blockchains = [];
    this.apiSvc.getAllBlockchains()
        .subscribe(res => {
          this.blockchains = res;
        })
  }

  updateDiscountCodes(){
    if(this.accountTypes.length > 0 && this.discountCodes.length > 0) {
          this.discountCodes.forEach(dc => {
            let discount = "";
            if(dc.price !== null) {
              discount = `$${dc.price}`;
            } else if (dc.percentOff !== null) {
              discount = `${dc.percentOff}%`;
            } else {
              discount = 'Free';
            }
            dc.discount = discount;
            dc.validDate = dc.validTil !== null ? this.helperSvc.unixToUTC(dc.validTil, false) : '';
            const account: AccountType = this.accountTypes.find(a => a.id === +dc.accountTypeId);
            dc.accountName = dc.accountTypeId !== null ? account.name : 'All';
          });
          this.onFilterList();
    }
  }

  onFilterList() {
    this.displayCodes = [];
    const now = this.helperSvc.getUnixTimestamp();
    this.displayCodes = this.activeCodes
      ? this.discountCodes.filter(d => d.validTil <= now)
      : this.discountCodes;
  }

  createCode() {
    this.editDiscountCode = new DiscountCode();
    this.dialogHeader = "Create Code";
    this.showCodeDialog = true;
    this.newObject = true;
    this.updateObject = false;
  }

  editCode(event) {
    this.dialogHeader = "Edit Code";
    this.showCodeDialog = true;
    this.newObject = false;
    this.updateObject = true;
  }

  createBlockchain() {
    this.editBlockchain = new Blockchain();
    this.dialogHeader = "Create Blockchain"
    this.showBCDialog = true;
    this.newObject = true;
    this.updateObject = false;
  }

  onEditBlockchain(event) {
    this.dialogHeader = "Edit Blockchain"
    this.showBCDialog = true;
    this.newObject = false;
    this.updateObject = true;
  }

  onTimeSet() {
    let hi = true;
    hi = false;
    const unix = this.helperSvc.getUnixTimestampFromDate(this.dateVal, this.timeZone);
    this.editDiscountCode.validTil = unix;
  }

  saveCode() {
    if(this.newObject) {
      this.apiSvc.addDiscountCodes(this.editDiscountCode)
          .subscribe(res => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'success', 
              summary: 'Code Added', 
              detail: 'Code was added',
              life: 5000
            })
            this.showCodeDialog = false;
            this.getDiscountCodes();
          }, err => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'error', 
              summary: 'Code Added', 
              detail: `An error occurred: ${err.message}`,
              life: 5000
            })
          });
      return;
    }
    if(this.updateObject) {
      this.apiSvc.updateDiscountCodes(this.editDiscountCode)
          .subscribe(res => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'success', 
              summary: 'Code Added', 
              detail: 'Code was added',
              life: 5000
            })
            this.showCodeDialog = false;
            this.getDiscountCodes();            
          }, err => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'error', 
              summary: 'Code Added', 
              detail: `An error occurred: ${err.message}`,
              life: 5000
            })
          });
      return;
    }
  }

  saveBC() {
    if(this.newObject) {
      this.apiSvc.addBlockchain(this.editBlockchain)
          .subscribe(res => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'success', 
              summary: 'Blockchain Added', 
              detail: 'Blockchain was added',
              life: 5000
            })
            this.showBCDialog = false;
            this.getBlockchains();
          }, err => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'error', 
              summary: 'Blockchain Added', 
              detail: `An error occurred: ${err.message}`,
              life: 5000
            })
          });
      return;
    }
    if(this.updateObject) {
      this.apiSvc.updateBlockchain(this.editBlockchain)
          .subscribe(res => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'success', 
              summary: 'Blockchain Added', 
              detail: 'Blockchain was added',
              life: 5000
            })
            this.showBCDialog = false;
            this.getBlockchains();            
          }, err => {
            this.messageSvc.add({
              key: 'notification-toast',
              severity: 'error', 
              summary: 'Blockchain Added', 
              detail: `An error occurred: ${err.message}`,
              life: 5000
            })
          });
      return;
    }
  }

  cancelCode() {
    this.showCodeDialog = false;
    this.newObject = false;
    this.updateObject = false;
    this.editDiscountCode = new DiscountCode();
  }

  cancelBC() {
    this.showBCDialog = false;
    this.newObject = false;
    this.updateObject = false;
    this.editBlockchain = new Blockchain();
  }
}
