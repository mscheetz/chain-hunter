import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  doWork: boolean = true;
  validToken: boolean = false;
  passUpdated: boolean = false;
  requestToken: string;
  newPassword: string;
  newPasswordConfirm: string;

  constructor(private apiSvc: ApiService, private router: Router, private msgSvc: MessageService) { 
    this.doWork = true;
    this.requestToken = window.location.pathname;
    if(typeof this.requestToken === 'undefined' || this.requestToken === null || this.requestToken === "") {
      this.doWork = false;
      this.validToken = false;
    } else {
      this.apiSvc.forgotPasswordVerify(this.requestToken)
          .subscribe(res => {
            this.validToken = true;
            this.doWork = false;
          }, err => {
            this.validToken = false;
            this.doWork = false;
          });
    }
  }

  ngOnInit() {
  }

  onPasswordReset(event) {
    this.doWork = true;
    this.apiSvc.forgotPasswordAction(this.requestToken, this.newPassword)
        .subscribe(res => {
          this.doWork = false;
          this.passUpdated = true;
        }, err => {
          this.doWork = false;
          this.passUpdated = false;
          this.msgSvc.add(
            {
                key:'notification-toast',
                severity:'error', 
                summary:'Error', 
                detail: err.error,
                life: 5000
            });
            return;
        })
  }
}
