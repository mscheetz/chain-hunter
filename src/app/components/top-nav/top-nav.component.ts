import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  @Output() toggleLogin: EventEmitter<any> = new EventEmitter();
  @Input() loggedIn: boolean;
  @Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  login(event) {
    this.toggleLogin.emit(event);
  }

  logout(event) {
    this.loginSuccess.emit(false);
  }
}
