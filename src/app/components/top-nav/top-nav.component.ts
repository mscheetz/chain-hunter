import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  @Output() toggleLogin: EventEmitter<any> = new EventEmitter();
  @Input() loggedIn: boolean;
  @Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private loginSvc: LoginService) { }

  ngOnInit() {
  }

  login(event) {
    this.loginSvc.toggleLogin();
    //this.toggleLogin.emit(event);
  }

  logout(event) {
    this.loginSuccess.emit(false);
  }
}
