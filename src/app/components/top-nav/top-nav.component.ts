import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  //@Output() toggleLogin: EventEmitter<any> = new EventEmitter();
  loggedIn: boolean;
  //@Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private loginSvc: LoginService, 
              private authSvc: AuthenticationService,
              private router: Router) { 
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
  }

  ngOnInit() {
  }

  goTo(route: string) {
    route = `/${route}`;
    this.hideNav();
    this.router.navigate([route]);
  }

  login(event) {
    console.log("Login toggle from top-nav.component");
    this.loginSvc.toggleLogin();
    this.hideNav();
    //this.toggleLogin.emit(event);
  }

  logout(event) {
    this.authSvc.logout();
    this.hideNav();
    //this.loginSuccess.emit(false);
  }

  navExpand() {
    const nav = document.getElementById("topNav");
    if(nav.className === "top-nav") {
      nav.className += " responsive";
    } else {
      nav.className = "top-nav";
    }
  }

  hideNav() {
    const nav = document.getElementById("topNav");
    nav.className = "top-nav";
  }
}
