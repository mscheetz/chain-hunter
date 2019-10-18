import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() showLogin: boolean;
  loginDisabled: boolean = true;
  pwdDisabled: boolean = true;
  email: string;
  password: string;

  constructor(private authSvc: AuthenticationService, private messageSvc: MessageService) { }

  ngOnInit() {
  }

  modelChange(event) {
    this.pwdDisabled = this.email.length > 0 ? false : true;
    this.loginDisabled = this.email.length > 0 && this.password.length > 0 ? false : true;
  }

  onLogin(event) {
    if(this.loginDisabled) {
      return;
    }
    this.authSvc.login(this.email, this.password)
        .subscribe(
          res => {
            this.showLogin = false;
            this.messageSvc.add(
                {
                    key:'login-toast',
                    severity:'success', 
                    summary:'Login Status', 
                    detail: 'Login Success',
                    sticky: true
                });
          }, 
          err => {
            this.messageSvc.clear();
            this.messageSvc.add(
                {
                    key:'login-toast',
                    severity:'error', 
                    summary:'Login Error', 
                    detail: err.error,
                    sticky: true
                });
          });
    this.showLogin = false;
  }

  onForgotPassword(event) {
    if(this.pwdDisabled) {
      return;
    }
    //this.showLogin = false;
  }
}
