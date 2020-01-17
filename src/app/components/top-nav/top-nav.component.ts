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
  loggedIn: boolean;
  isAdmin: boolean;

  constructor(private loginSvc: LoginService, 
              private authSvc: AuthenticationService,
              private router: Router) { 
    this.authSvc.isLoggedIn.subscribe(val => this.loggedIn = val);
    this.authSvc.isAdmin.subscribe(val => this.isAdmin = val);
  }

  ngOnInit() {
  }

  goTo(route: string) {
    route = `/${route}`;
    this.hideNav();
    this.router.navigate([route]);
  }

  login(event) {
    this.loginSvc.toggleLogin();
    this.hideNav();
  }

  logout(event) {
    this.authSvc.logout();
    this.hideNav();
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

  latestBlocks() {
    this.hideNav();
    this.router.navigate([`/search/all/b/latest`]);
  }
}
