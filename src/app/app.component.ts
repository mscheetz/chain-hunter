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
}
