import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  verified: boolean = false;
  doWork: boolean = true;
  userId: string;

  constructor(private apiSvc: ApiService) { 
    this.userId = window.location.pathname;
    this.onVerifyAccount();
  }

  ngOnInit() {
  }

  onVerifyAccount(){
    this.doWork = true;
    this.verified = false;
    this.apiSvc.verifyAccount(this.userId)
        .subscribe(res => {
          this.verified = true;
          this.doWork = false;
        }, err => {
          this.doWork = false;
          this.verified = false;
        })
  }
}
