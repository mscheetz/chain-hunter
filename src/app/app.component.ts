import { Component, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { User } from './classes/User';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

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
  
  constructor(private router: Router, private authSvc: AuthenticationService, private messageSvc: MessageService) {
    this.showLogin = false;
    this.authSvc.currentUser.subscribe(c => this.currentUser = c);
  }

  @Output() loggedIn: boolean = this.authSvc.isLoggedIn();
  
  cookieOk(cookie: boolean){
    this.showNotice = false;
  }
  
  onToggleLogin(event) {
    this.showLogin = this.showLogin ? false : true;
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

  logout(){
    this.authSvc.logout();
  }

  onLoginSuccess(event) {
    this.loggedIn = event;
    if(!this.loggedIn) {
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
