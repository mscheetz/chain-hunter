import { Component, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { User } from './classes/user.class';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { LoginService } from './services/login.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chain-hunter';
  currentUser: User;
  showNotice: boolean = true;
  @Output() showLogin: boolean;
  loggedIn: boolean = false;
  @Output() loginView: boolean = true;
  @Output() registerView: boolean = false;
  @Output() confirmView: boolean = false;

  constructor(private router: Router, 
              private authSvc: AuthenticationService, 
              private messageSvc: MessageService, 
              private loginSvc: LoginService,
              private cookieSvc: CookieService) {
    //this.showLogin = false;
    this.authSvc.currentUser.subscribe(c => this.currentUser = c);
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
    this.loginSvc.showLogin.subscribe(val => this.showLogin = val);
    this.cookieCheck();
  }

  //@Output() loggedIn: boolean = this.authSvc.isLoggedIn();
  
  cookieCheck() {
    let cookieCookie = this.cookieSvc.get("tch-cookie-ok");
    if(cookieCookie != null && cookieCookie !== "") {
      this.showNotice = false;
    }
  }

  cookieOk(cookie: boolean){
    this.showNotice = false;
  }
  
  onToggleLogin(event) {
    console.log("Login toggle from app.component");
    this.loginSvc.toggleLogin();
    //this.showLogin = this.showLogin ? false : true;
  }
  /**
   * Login to account
   */
  login() {
    this.messageSvc.add(
        {
            key:'login-notice-toast',
            severity:'info', 
            summary:'Coming Soon', 
            detail:'Account registrations coming soon. Follow us on twitter to be the first to sign up!',
            sticky: true
        });
  }

  loginHidden() {
    this.loginSvc.setLogin(false);
  }

  logout(){
    this.authSvc.logout();
  }

  onLoginSuccess(event) {
    this.loggedIn = event;
    //this.currentUser = this.authSvc.getUser();
    if(!this.loggedIn) {
      //this.currentUser = null;
      this.authSvc.logout();
    }
  }

  /**
   * Alert message
   */
  notification(message: string) {
    this.messageSvc.add(
        {
            key:'notification-toast',
            severity:'success', 
            detail:message,
            life: 3000
        });
  }

  resetLoginBools() {
    this.loginView = true;
    this.registerView = false;
    this.confirmView = false;
  }
}
