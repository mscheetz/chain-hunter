import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';

import { ApiService } from 'src/app/services/api.service';
import { AccountType } from 'src/app/classes/AccountType';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-account-types',
  templateUrl: './account-types.component.html',
  styleUrls: ['./account-types.component.css']
})
export class AccountTypesComponent implements OnInit {
  accounts: AccountType[];
  loggedIn: boolean;
  user: User;

  constructor(private apiSvc: ApiService, 
              private authSvc: AuthenticationService, 
              private router: Router, 
              private loginSvc: LoginService,
              private cookieSvc: CookieService) { 
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
    this.loginSvc.toggleLogin();
  }
  
  onUpgrade(account: AccountType) {
    this.cookieSvc.delete("tch-upgrade");
    this.cookieSvc.set("tch-upgrade", JSON.stringify(account));
    this.router.navigate(['payment']);
  }
}
