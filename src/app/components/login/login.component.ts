import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MessageService, SelectItem } from 'primeng/api';
import { ThrowStmt } from '@angular/compiler';
import { ApiService } from 'src/app/services/api-svc.service';
import { HelperService } from 'src/app/services/helper-svc.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() toggleLogin: EventEmitter<any> = new EventEmitter();
  @Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
  actionTypes: SelectItem[];
  selectedAction: number = 0;
  loginView: boolean = true;
  registerView: boolean = false;
  confirmView: boolean = false;
  loginDisabled: boolean = true;
  registerDisabled: boolean = true;
  pwdDisabled: boolean = true;
  email: string;
  password: string;
  newEmail: string;
  newPassword: string;
  newPasswordConfirm: string;
  inviteCode: string;

  constructor(private authSvc: AuthenticationService, 
              private messageSvc: MessageService, 
              private apiSvc: ApiService, 
              private helperSvc: HelperService,
              private loginSvc: LoginService) { }

  ngOnInit() {
    this.actionTypes = [
      { label: 'Login', value: 0 },
      { label: 'Register', value: 1 }
    ]
  }

  modelChange(event) {
  }

  onPasswordConfirm() {
    if(this.newPassword.length > 0 && this.newPasswordConfirm.length > 0) {
      return this.newPassword === this.newPasswordConfirm;
    } else {
      return true;
    }
  }

  onLogin(event) {
    if((typeof this.email === 'undefined') || (typeof this.password === 'undefined') || this.email.length === 0 || this.password.length === 0){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Incomplete', 
              detail: 'Enter all the required fields',
              life: 5000
          });
          return;
    } else if(!this.helperSvc.validateEmail(this.email)){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Email', 
              detail: 'Not a valid email address',
              life: 5000
          });
          return;
    } 
    
    this.authSvc.login(this.email, this.password)
        .subscribe(
          res => {
            this.loginSuccess.emit(true);
            this.messageSvc.clear();
            this.loginSvc.toggleLogin();
            this.email = "";
            this.password = "";
            this.messageSvc.add(
                {
                    key:'login-toast',
                    severity:'success', 
                    summary:'Login Status', 
                    detail: 'Login Success',
                    life: 5000
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
                    life: 5000
                });
          });
  }

  onForgotPassword(event) {
    if((typeof this.email === 'undefined') || this.email.length === 0){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Email', 
              detail: 'Enter a valid email address',
              life: 5000
          });
          return;
    } else if(!this.helperSvc.validateEmail(this.email)){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Email', 
              detail: 'Not a valid email address',
              life: 5000
          });
          return;
    }
    this.apiSvc.forgotPassword(this.email)
        .subscribe(res => {
          this.messageSvc.clear();
          this.loginSvc.toggleLogin();
          this.messageSvc.add(
              {
                  key:'login-toast',
                  severity:'success', 
                  summary:'Forgot Password', 
                  detail: 'You wil receive an email with password reset instructions.',
                  life: 5000
              });
        }, err => {
          this.messageSvc.clear();
          this.messageSvc.add(
              {
                  key:'login-toast',
                  severity:'error', 
                  summary:'Forgot Password', 
                  detail: 'Please re-submit your request.',
                  life: 5000
              });
        })
  }

  onRegister(event) {
    if((typeof this.email === 'undefined') || (typeof this.newPassword === 'undefined') || (typeof this.newPasswordConfirm === 'undefined') 
          || this.newEmail.length === 0 || this.newPassword.length === 0 || this.newPasswordConfirm.length === 0){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Incomplete', 
              detail: 'Enter all the required fields',
              life: 5000
          });
          return;
    } else if(!this.helperSvc.validateEmail(this.newEmail)){
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Email', 
              detail: 'Not a valid email address',
              life: 5000
          });
          return;
    } else if(this.newPassword.length < 8) {
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Password', 
              detail: 'Password is less than 8 characters',
              life: 5000
          });
          return;
    } else if (!this.onPasswordConfirm()) {
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Password', 
              detail: 'Passwords to not match',
              life: 5000
          });
          return;
    }

    if(this.inviteCode !== "") {
      this.apiSvc.validateInviteCode(this.inviteCode)
          .subscribe(res => {
            this.register();
          }, err => {
            this.messageSvc.clear();
            this.messageSvc.add(
                {
                    key:'login-toast',
                    severity:'warn', 
                    summary:'Invite Code', 
                    detail: 'Invalid Invite Code',
                    life: 5000
                });
                return;
          })
    } else {
      this.register();
    }
  }

  register(){
    this.apiSvc.register(this.newEmail, this.newPassword, this.inviteCode)
        .subscribe(res => {
          this.registerView = false;
          this.confirmView = true;
        }, err => {
          this.messageSvc.clear();
          this.messageSvc.add(
              {
                  key:'login-toast',
                  severity:'warn', 
                  summary:'Registration Error', 
                  detail: err,
                  life: 5000
              });
              return;
        })
  }

  typeChange(event){
    this.email = "", this.password = this.email, this.newEmail = this.email, this.newPassword = this.email, this.newPasswordConfirm = this.email;
    if(this.selectedAction === 0 ) {
      this.loginView = true;
      this.registerView = false;
    } else {
      this.loginView = false;
      this.registerView = true;
    }
  }
}
