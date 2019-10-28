import { Component, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { User } from './classes/User';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { LoginService } from './services/login.service';

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

  constructor(private router: Router, private authSvc: AuthenticationService, private messageSvc: MessageService, private loginSvc: LoginService) {
    //this.showLogin = false;
    this.authSvc.currentUser.subscribe(c => this.currentUser = c);
    this.loginSvc.showLogin.subscribe(val => this.showLogin = val);
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
  }

  //@Output() loggedIn: boolean = this.authSvc.isLoggedIn();
  
  cookieOk(cookie: boolean){
    this.showNotice = false;
  }
  
  onToggleLogin(event) {
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
    this.currentUser = this.authSvc.getUser();
    if(!this.loggedIn) {
      this.currentUser = null;
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
}
