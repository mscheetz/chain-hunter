import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api-svc.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/classes/User';
import { HelperService } from 'src/app/services/helper-svc.service';

@Component({
  selector: 'app-my-page',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.css']
})
export class MyPageComponent implements OnInit {
  user: User;
  joinDate: string;
  expirationDate: string;
  saveLimit: string;
  searchLimit: string;
  
  constructor(private apiSvc: ApiService, private authSvc: AuthenticationService, private helperSvc: HelperService) { }

  ngOnInit() {
    this.user = this.authSvc.getUser();
    this.joinDate = this.helperSvc.unixToUTC(this.user.created);
    this.saveLimit = this.user.saveLimit === null ? 'Unlimited' : this.user.saveLimit.toString();
    this.searchLimit = this.user.searchLimit === null ? 'Unlimited' : this.user.searchLimit.toString();
  }

}
