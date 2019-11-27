import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

import { environment } from 'src/environments/environment';
import { AccountType } from 'src/app/classes/account-type.class';
import { ApiService } from 'src/app/services/api.service';
import { PaymentTypeDetail } from 'src/app/classes/payment-type-detail.class';
import { PaymentType } from 'src/app/classes/payment-type.class';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  @Input() total: number;
  promoCode: string = "";
  account: AccountType;
  validCode: boolean = false;
  promoCodeDetail: string;
  paymentTypes: PaymentType[] = [];
  paymentTypeDetails: PaymentTypeDetail[] = [];
  orderId: string = "";
  accountUpgraded: boolean = false;
  processing: boolean = false;

  constructor(private cookieSvc: CookieService, 
              private apiSvc: ApiService,
              private messageSvc: MessageService,
              private router: Router,
              private helperSvc: HelperService,
              private authSvc: AuthenticationService) { }

  ngOnInit() {
    this.getTypes();
    const cookie = this.cookieSvc.get("tch-upgrade");
    if(typeof cookie !== "undefined" && cookie !== null && cookie !== "") {
      this.account = JSON.parse(cookie);
      this.total = this.helperSvc.currencyRound(this.account.yearly);   
    } else {
      if(typeof this.total === 'undefined') {
        this.total = 10.99;
      }
    }
  }

  ngOnDestroy(){
    if(this.accountUpgraded) {
      this.userRefresh();
    }
  }

  async userRefresh(){
    await this.authSvc.userRefresh();
  }

  getTypes() {
    this.apiSvc.getPaymentTypes()
        .subscribe(res => {
          res.forEach(r => {
            const type = new PaymentType();
            type.id = r.id;
            type.name = r.name;
            type.paymentTypeDetails = [];
            this.paymentTypes.push(type);
          })
          this.updatePaymentTypes();
        });
    this.apiSvc.getPaymentTypeDetails()
        .subscribe(res => {
          this.paymentTypeDetails = res;
          this.updatePaymentTypes();
        });
  }

  updatePaymentTypes(){
    if(this.paymentTypes.length > 0 && this.paymentTypeDetails.length > 0) {
      this.paymentTypes.forEach(payment => {
        const cryptos = this.paymentTypeDetails.filter(c => c.paymentTypeId === payment.id);
        payment.paymentTypeDetails = cryptos;
      })
    }
  }

  onApplyCode(){
    this.validCode = false;
    this.promoCodeDetail = "";
    if(this.promoCode === "") {
      return;
    }
    this.apiSvc.getPromoCode(this.promoCode, this.account.uuid)
      .subscribe(res => {
        this.validCode = true;
        if(res.percentOff !== null && res.percentOff > 0) {
          this.promoCodeDetail = `Take ${res.percentOff*100}% off`;
          this.total = this.account.yearly - (this.account.yearly * res.percentOff);
        } else {
          const printPrice = res.price === null ? 0 : res.price;
          this.promoCodeDetail = `${this.account.name} Account for $${printPrice}`;
          this.total = res.price;
        }
        if(res.days !== null && res.days > 0) {
          this.promoCodeDetail += ` for ${res.days} days`;
        }
        this.total = this.helperSvc.currencyRound(this.total);
        this.messageSvc.add({
          key: 'notification-toast',
          severity: 'success', 
          summary: 'Code Applied', 
          detail: 'Promo code applied',
          life: 5000
        })
      }, err => {
        this.total = this.account.yearly;
        this.showErrorMessage(err.error);
      })
  }

  showErrorMessage(message: string) {
        this.messageSvc.add({
          key: 'notification-toast',
          severity: 'error', 
          summary: 'Invalid Code', 
          detail: message,
          life: 5000
        })
  }

  async upgradeAccount() {
    if(this.processing) {
      this.messageSvc.add({
        key: 'notification-toast',
        severity: 'error', 
        summary: 'Error', 
        detail: 'Account is currently upgrading',
        life: 5000
      });
      return;
    }
    if(this.accountUpgraded) {
      this.messageSvc.add({
        key: 'notification-toast',
        severity: 'error', 
        summary: 'Error', 
        detail: 'Your account is already upgraded',
        life: 5000
      });
      return;
    }
    this.processing = true;
    await this.apiSvc.upgradeAccount(this.account.uuid, this.promoCode)
      .subscribe(res => {
        this.processing = false;
        this.accountUpgraded = true;
        this.messageSvc.add({
          key: 'notification-toast',
          severity: 'success', 
          summary: 'Account Upgraded', 
          detail: 'Your account has been upgraded',
          life: 5000
        })
      }, err => {
        this.messageSvc.add({
          key: 'notification-toast',
          severity: 'error', 
          summary: 'Error', 
          detail: err.error,
          life: 5000
        })
      });
  }

  async createOrder(paymentTypeId: string) {
    const payment = this.paymentTypes.find(f => f.id === paymentTypeId);
    if(payment.name === "Cryptocurrency") {
      this.messageSvc.add({
        key: 'notification-toast',
        severity: 'warn', 
        summary: 'Coming Soon', 
        detail: 'Cryptocurrency payments coming soon!',
        life: 5000
      })
      return;
    }
    await this.apiSvc.createOrder(this.account.uuid, paymentTypeId, this.total, this.promoCode )
              .subscribe(res => {
                if(payment.name === "Credit Card") { 
                  console.log('credit card payment')
                  this.router.navigate([`cc-checkout`, res]);
                } else {
                  console.log('crypto payment')
                }
              }, err => {
                this.showErrorMessage(err.error);
              })
  }
}
