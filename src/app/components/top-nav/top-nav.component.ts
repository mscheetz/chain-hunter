import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  //@Output() toggleLogin: EventEmitter<any> = new EventEmitter();
  loggedIn: boolean;
  //@Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private loginSvc: LoginService, private authSvc: AuthenticationService) { 
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
  }

  ngOnInit() {
  }

  login(event) {
    this.loginSvc.toggleLogin();
    //this.toggleLogin.emit(event);
  }

  logout(event) {
    this.authSvc.logout();
    //this.loginSuccess.emit(false);
  }
}
