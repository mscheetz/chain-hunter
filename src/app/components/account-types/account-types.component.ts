import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api-svc.service';
import { AccountType } from 'src/app/classes/AccountType';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';

@Component({
  selector: 'app-account-types',
  templateUrl: './account-types.component.html',
  styleUrls: ['./account-types.component.css']
})
export class AccountTypesComponent implements OnInit {
  accounts: AccountType[];
  loggedIn: boolean;
  user: User;

  constructor(private apiSvc: ApiService, private authSvc: AuthenticationService) { 
    this.apiSvc.getAccountTypes()
      .subscribe(res => {
        this.accounts = res;
      })
      this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
      this.authSvc.currentUser.subscribe(val => this.user = val);
  }

  ngOnInit() {
  }

  onOrder(accountTypeId: number) {
    const hi = true;
  }
  
  onUpgrade(accountTypeId: number) {
    const hi = true;
  }
}
