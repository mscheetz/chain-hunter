import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';

import { ApiService } from 'src/app/services/api.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-email-subscription',
  templateUrl: './email-subscription.component.html',
  styleUrls: ['./email-subscription.component.css']
})
export class EmailSubscriptionComponent implements OnInit {
  newAddress: string = "";

  constructor(private apiSvc: ApiService,
              private helperSvc: HelperService,
              private messageSvc: MessageService) { }

  ngOnInit() {
  }

  subscribe() {
    if(!this.helperSvc.validateEmail(this.newAddress)) {
      this.messageSvc.add({
        key: 'notification-toast',
        severity:'error', 
        summary:'Email', 
        detail: 'Not a valid email address',
        life: 5000
      });
      return;
    }
    this.apiSvc.subscribeEmail(this.newAddress)
        .subscribe(res => {
          this.newAddress = "";
          this.messageSvc.add({
            key: 'notification-toast',
            severity:'success', 
            summary:'Email Subscription', 
            detail: 'Email subscription created!',
            life: 5000
          });
        })
  }

}
