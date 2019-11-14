import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
  error: string;

  constructor(private apiSvc: ApiService, private route: ActivatedRoute, private router: Router, private msgSvc: MessageService) { 
    this.userId = this.route.snapshot.paramMap.get('id');
    if(this.userId === null) {
      this.router.navigate(['']);
    } else {
      this.onVerifyAccount();
    }
  }

  ngOnInit() { }

  onVerifyAccount(){
    this.doWork = true;
    this.verified = false;
    this.apiSvc.validateAccount(this.userId)
        .subscribe(res => {
          this.verified = true;
          this.doWork = false;
          this.msgSvc.add(
            {
                key:'notification-toast',
                severity:'success', 
                summary:'Success', 
                detail: 'Account validated',
                life: 5000
            });
        }, err => {
          this.doWork = false;
          this.verified = false;
          this.error = err.error;
          this.msgSvc.add(
            {
                key:'notification-toast',
                severity:'error', 
                summary:'Error', 
                detail: err.error,
                life: 5000
            });
        })
  }
}
