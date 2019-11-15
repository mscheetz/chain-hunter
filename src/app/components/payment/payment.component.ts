import { Component, OnInit, Input } from '@angular/core';
import valid from 'card-validator';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @Input() total: number;
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

  constructor() { }

  ngOnInit() {
  }

  toggleCreditCard() {
    this.showCC = !this.showCC;
    this.resetCC();
  }

  toggleCryptocurrency(){
    this.showCrypto = !this.showCrypto;
  }

  onHideCC() {
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
