import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chain-hunter';
  showNotice: boolean = true;
    
  constructor(private messageSvc: MessageService) {}

  cookieOk(cookie: boolean){
    this.showNotice = false;
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
