import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';
import { HelperService } from 'src/app/services/helper.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.css']
})
export class MyPageComponent implements OnInit {
  user: User;
  joinDate: string;
  expirationDate: string;
  saveLimit: string;
  searchLimit: string;
  editUser: boolean = false;
  updatingUser: boolean = false;
  updatingPassword: boolean = false;
  password: string;
  newPassword: string;
  newPasswordConfirm: string;
  invalidPassword0: boolean = false;
  invalidPassword1: boolean = false;
  invalidPassword2: boolean = false;
  
  constructor(private apiSvc: ApiService, private authSvc: AuthenticationService, private helperSvc: HelperService, private messageSvc: MessageService, private router: Router) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.joinDate = this.helperSvc.unixToUTC(this.user.created, false);
    this.saveLimit = this.user.saveLimit === null ? 'Unlimited' : this.user.saveLimit.toString();
    this.searchLimit = this.user.searchLimit === null ? 'Unlimited' : this.user.searchLimit.toString();
  }

  onToggleEdit(status: boolean) {
    this.editUser = status;
  }

  onUpdateUsername(event) {
    this.updatingUser = true;
    this.apiSvc.updateUser(this.user)
    .subscribe(res => {
      this.messageSvc.add({
        key: 'notification-toast',
        severity: 'success', 
        summary: 'Updated', 
        detail: 'Account updates saved',
        life: 5000
      })
      this.updatingUser = false;
      this.editUser = false;
    }, err => {
      this.messageSvc.add({
        key: 'notification-toast',
        severity: 'error', 
        summary: 'Update', 
        detail: `An error occured: ${err.message}`,
        life: 5000
      })
      this.updatingUser = false;
    })
  }

  onUpdatePassword(event) {
    this.invalidPassword0 = this.invalidPassword1 = this.invalidPassword2 = false;
    if((typeof this.password === 'undefined') || (typeof this.newPassword === 'undefined') || (typeof this.newPasswordConfirm === 'undefined') 
          || this.password.length === 0 || this.newPassword.length === 0 || this.newPasswordConfirm.length === 0){
      this.invalidPassword0 = (typeof this.password === 'undefined') || this.password.length === 0;
      this.invalidPassword1 = (typeof this.newPassword === 'undefined') || this.newPassword.length === 0;
      this.invalidPassword2 = (typeof this.newPasswordConfirm === 'undefined') || this.newPasswordConfirm.length === 0;
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'notification-toast',
              severity:'warn', 
              summary:'Incomplete', 
              detail: 'Enter all the required fields',
              life: 5000
          });
          return;
    }
    if(this.password.length < 8) {
      this.invalidPassword0 = true;
      this.messageSvc.add({
        key: 'notification-toast',
        severity:'warn', 
        summary:'Password', 
        detail: "Password is less than 8 characters",
        life: 5000
      })
      return;

    }
    const passwordConfirmationMessage = this.helperSvc.passwordConfirm(this.newPassword, this.newPasswordConfirm);
    if(passwordConfirmationMessage !== null) {
      this.invalidPassword1 = true;
      this.invalidPassword2 = true;
      this.messageSvc.add({
        key: 'notification-toast',
        severity:'warn', 
        summary:'Password', 
        detail: passwordConfirmationMessage,
        life: 5000
      })
      return;
    }
    this.updatingPassword = true;
    this.apiSvc.updatePassword(this.user.userId, this.password, this.newPassword)
      .subscribe(res => {
        this.password = "";
        this.newPassword = "";
        this.newPasswordConfirm = "";
        this.updatingPassword = false;
        this.messageSvc.add({
          key: 'notification-toast',
          severity:'success', 
          summary:'Password', 
          detail: res,
          life: 5000
        });
      }, err => {                
        this.messageSvc.add({
          key: 'notification-toast',
          severity:'error', 
          summary:'Password', 
          detail: err.error,
          life: 5000
        });
      })
  }

  onUpgradeAccount(event) {
    this.router.navigate(['accounts']);
  }
}
