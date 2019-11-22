import { Component, OnInit, Input } from '@angular/core';
import valid from 'card-validator';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

import { environment } from 'src/environments/environment';
import { AccountType } from 'src/app/classes/account-type.class';
import { ApiService } from 'src/app/services/api.service';
import { IdName } from 'src/app/classes/id-name.class';
import { CryptoPaymentType } from 'src/app/classes/crypto-payment-type.class';
import { PaymentType } from 'src/app/classes/payment-type.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  @Input() total: number;
  promoCode: string = "";
  showCC: boolean = false;
  showCrypto: boolean = false;
  ccName: string;
  ccIcon: string = "credit-card";
  iconColor: string = "#333333";
  ccNumber: string;
  cardType: string;
  ccExpiration: string;
  codeName: string = "CCV";
  codeSize: number = 3;
  ccv: number;
  validCard: boolean = null;
  applicationId: string = environment.squareApplicationId;
  locationId: string = environment.squareLocationId;
  account: AccountType;
  validCode: boolean = false;
  promoCodeDetail: string;
  paymentTypes: PaymentType[] = [];
  cryptoPaymentTypes: CryptoPaymentType[] = [];
  orderId: string = "";

  constructor(private cookieSvc: CookieService, 
              private apiSvc: ApiService,
              private messageSvc: MessageService,
              private router: Router) { }

  ngOnInit() {
    this.getTypes();
    const cookie = this.cookieSvc.get("tch-upgrade");
    if(typeof cookie !== "undefined" && cookie !== null && cookie !== "") {
      this.account = JSON.parse(cookie);
      this.total = this.account.yearly;   
    } else {
      if(typeof this.total === 'undefined') {
        this.total = 10.99;
      }
    }
  }

  getTypes() {
    this.apiSvc.getPaymentTypes()
        .subscribe(res => {
          res.forEach(r => {
            const type = new PaymentType();
            type.id = r.id;
            type.name = r.name;
            type.cryptoTypes = [];
            this.paymentTypes.push(type);
          })
          this.updatePaymentTypes();
        });
    this.apiSvc.getCryptoPaymentTypes()
        .subscribe(res => {
          this.cryptoPaymentTypes = res;
          this.updatePaymentTypes();
        });
  }

  updatePaymentTypes(){
    if(this.paymentTypes.length > 0 && this.cryptoPaymentTypes.length > 0) {
      this.paymentTypes.forEach(payment => {
        const cryptos = this.cryptoPaymentTypes.filter(c => c.paymentTypeId === payment.id);
        payment.cryptoTypes = cryptos;
      })
    }
  }
  
  toggleCreditCard() {
    this.showCC = !this.showCC;
    this.resetCC();
  }

  toggleCryptocurrency(){
    this.showCrypto = !this.showCrypto;
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
          this.promoCodeDetail = `Take ${res.percentOff}% off`;
          this.total = this.account.yearly * res.percentOff;
        } else {
          this.promoCodeDetail = `${this.account.name} Account for $${res.price}`;
          this.total = res.price;
        }
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

  async createOrder(paymentTypeId: string) {
    const payment = this.paymentTypes.find(f => f.id === paymentTypeId);
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

  onShowCC() {
    console.log('showing cc form');
  }

  onHideCC() {
    console.log('hiding cc form');
    this.showCC = false;
    this.resetCC();
  }

  resetCC() {
    this.ccExpiration = null;
    this.ccName = null;
    this.ccNumber = null;
    this.ccv = null;
  }

  ccValidate(event) {
    this.ccNumber = this.ccNumber.trim();
    const numberValidation = valid.number(this.ccNumber);
    
    if(!numberValidation.isPotentiallyValid) {
      this.validCard = false;
      this.ccIcon = "credit-card";
      this.iconColor = "#bd0202";
    }
    if(numberValidation.card) {
      this.validCard = true;
      this.cardType = numberValidation.card.type;
      this.cardType = this.cardType === "american-express" ? "amex" : this.cardType;
      this.ccIcon = `cc-${this.cardType}`;
      this.iconColor = "#333333";
      this.codeName = numberValidation.card.code.name;
      this.codeSize = numberValidation.card.code.size;
    }
  }

  onPaypal(){

  }

  onStripe(){

  }

  onCrypto(symbol: string) {
    
  }  
}
