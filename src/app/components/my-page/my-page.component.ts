import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api-svc.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';
import { HelperService } from 'src/app/services/helper-svc.service';
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

  onUpgradeAccount(event) {
    this.router.navigate(['accounts']);
  }
}
