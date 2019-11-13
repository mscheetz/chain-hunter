import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  verified: boolean = false;
  doWork: boolean = true;
  userId: string;
  verifyId: string;

  constructor(private apiSvc: ApiService, private route: ActivatedRoute) { 
    this.userId = window.location.pathname;
    this.onVerifyAccount();
  }

  ngOnInit() {
    this.verifyId = this.route.snapshot.paramMap.get('id');
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
