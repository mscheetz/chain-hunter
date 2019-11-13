import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AccountType } from 'src/app/classes/AccountType';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';
import { Router } from '@angular/router';
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

  constructor(private apiSvc: ApiService, private authSvc: AuthenticationService, private router: Router, private loginSvc: LoginService) { 
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
  
  onUpgrade(accountTypeId: number) {
    const hi = true;
    this.router.navigate(['payment']);
  }
}
