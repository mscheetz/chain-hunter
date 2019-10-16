import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() showLogin: boolean;
  email: string;
  password: string;

  constructor(private authSvc: AuthenticationService) { }

  ngOnInit() {
  }

  onLogin(event) {
    this.authSvc.login(this.email, this.password);
    this.showLogin = false;
  }

  onForgotPassword(event) {
    this.showLogin = false;
  }
}
