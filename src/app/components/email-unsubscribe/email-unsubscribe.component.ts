import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-email-unsubscribe',
  templateUrl: './email-unsubscribe.component.html',
  styleUrls: ['./email-unsubscribe.component.css']
})
export class EmailUnsubscribeComponent implements OnInit {
  address: string;

  constructor(private apiSvc: ApiService,
              private helperSvc: HelperService,
              private messageSvc: MessageService) { }

  ngOnInit() {
  }

  unsubscribe() {
    if(!this.helperSvc.validateEmail(this.address)) {
      this.messageSvc.add({
        key: 'notification-toast',
        severity:'error', 
        summary:'Email', 
        detail: 'Not a valid email address',
        life: 5000
      });
      return;
    }
    this.apiSvc.unSubscribeEmail(this.address)
        .subscribe(res => {
          this.address = "";
          this.messageSvc.add({
            key: 'notification-toast',
            severity:'success', 
            summary:'Email Subscription', 
            detail: 'Email address has been unsubscribed',
            life: 5000
          });
        })
  }

}
