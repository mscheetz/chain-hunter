import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MessageService, SelectItem } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { LoginService } from 'src/app/services/login.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
  actionTypes: SelectItem[];
  selectedAction: number = 0;
  performingAction: boolean = false;
  @Input() inLoginView: boolean = true;
  @Input() inRegisterView: boolean = false;
  @Input() inConfirmView: boolean = false;
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
  inviteCode: string = "";
  invalidEmail: boolean = false;
  invalidPassword0: boolean = false;
  invalidPassword1: boolean = false;
  invalidInvite: boolean = false;

  constructor(private authSvc: AuthenticationService, 
              private messageSvc: MessageService, 
              private apiSvc: ApiService, 
              private helperSvc: HelperService,
              private loginSvc: LoginService) { }

  ngOnInit() {
    this.loginView = this.inLoginView;
    this.registerView = this.inRegisterView;
    this.confirmView = this.inConfirmView;
    this.actionTypes = [
      { label: 'Login', value: 0 },
      { label: 'Register', value: 1 }
    ]
  }

  modelChange(event) {
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
    if(this.performingAction) {
      return;
    }
    
    this.performingAction = true;
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
            this.performingAction = false;
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
            this.performingAction = false;
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
    if(this.performingAction) {
      return;
    }
    
    this.performingAction = true;
    this.apiSvc.forgotPassword(this.email)
        .subscribe(res => {
          this.messageSvc.clear();
          console.log("Login toggle from login.component - forgot password");
          this.messageSvc.add(
              {
                  key:'login-toast',
                  severity:'success', 
                  summary:'Forgot Password', 
                  detail: 'You wil receive an email with password reset instructions.',
                  life: 5000
              });
          this.performingAction = false;
        }, err => {
          this.messageSvc.clear();
          this.messageSvc.add(
              {
                  key:'login-toast',
                  severity:'error', 
                  summary:'Forgot Password', 
                  detail: err.error,
                  life: 5000
              });
          this.performingAction = false;
        })
  }

  onRegister(event) {
    this.invalidEmail = this.invalidInvite = this.invalidPassword0 = this.invalidPassword1 = false;
    if((typeof this.email === 'undefined') || (typeof this.newPassword === 'undefined') || (typeof this.newPasswordConfirm === 'undefined') 
          || this.newEmail.length === 0 || this.newPassword.length === 0 || this.newPasswordConfirm.length === 0){
      this.invalidEmail = (typeof this.email === 'undefined') || this.email.length === 0;
      this.invalidPassword0 = (typeof this.newPassword === 'undefined') || this.newPassword.length === 0;
      this.invalidPassword1 = (typeof this.newPasswordConfirm === 'undefined') || this.newPasswordConfirm.length === 0;
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
      this.invalidEmail = true;
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
    const passwordConfirmationMessage = this.helperSvc.passwordConfirm(this.newPassword, this.newPasswordConfirm);
    if(passwordConfirmationMessage !== null){
      this.invalidPassword0 = this.invalidPassword1 = true;
      this.messageSvc.clear();
      this.messageSvc.add(
          {
              key:'login-toast',
              severity:'warn', 
              summary:'Password', 
              detail: passwordConfirmationMessage,
              life: 5000
          });
          return;
    }

    if(this.inviteCode !== "") {
      this.apiSvc.validateInviteCode(this.inviteCode)
          .subscribe(res => {
            this.register();
          }, err => {
            this.invalidInvite = true;
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
                  detail: err.error,
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

  onReturnLogin(event) {
    this.selectedAction = 0;
    this.confirmView = false;
    this.typeChange(event);
  }
}
