import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { DiscountCode } from 'src/app/classes/discount-code.class';
import { UserCounts } from 'src/app/classes/user-counts.class';
import { AccountType } from 'src/app/classes/account-type.class';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  discountCodes: DiscountCode[] = [];
  editDiscountCode: DiscountCode = new DiscountCode();
  accountTypes: AccountType[] = [];
  userCounts: UserCounts = new UserCounts();
  newDiscountCode: boolean = false;
  updateDiscountCode: boolean = false;

  constructor(private apiSvc: ApiService, 
              private helperSvc: HelperService) { }

  ngOnInit() {
    this.apiSvc.getUserCounts()
        .subscribe(res => {
          this.userCounts = res;
        });

    this.apiSvc.getAccountTypes()
        .subscribe(res => {
          this.accountTypes = res;
          this.updateDiscountCodes();
        });
    this.apiSvc.getDiscountCodes()
        .subscribe(res => {
          this.discountCodes = res;
          this.updateDiscountCodes();
        });
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
            const account: AccountType = this.accountTypes.find(a => a.id === dc.accountTypeId);
            dc.accountName = dc.accountTypeId !== null ? account.name : 'All';
          })

    }
  }
}
