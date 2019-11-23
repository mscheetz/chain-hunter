import { Component, OnInit, Input, DoCheck, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { Order } from 'src/app/classes/order.class';
import { MessageService } from 'primeng/api';

declare var SqPaymentForm: any;

@Component({
  selector: 'app-cc-checkout',
  templateUrl: './cc-checkout.component.html',
  styleUrls: ['./cc-checkout.component.css']
})
export class CreditCardCheckoutComponent implements OnInit {
  paymentForm: any;
  applicationId: string = environment.squareApplicationId;
  locationId: string = environment.squareLocationId;
  orderId: string;
  order: Order;
  validOrder: boolean = null;
  invalidMessage: string;
  nonce: string;

  constructor(private route: ActivatedRoute, private apiSvc: ApiService, private router: Router, private messageSvc: MessageService) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.order;
    this.apiSvc.getOrder(this.orderId)
        .subscribe(res => {
          this.validOrder = true;          
          this.order = res;

          this.loadForm();
        }, err => {
          this.validOrder = false;
          this.invalidMessage = err.error;
        })
  }

  toCart() {
    this.router.navigate(["cart"])
  }

  loadForm(){
    this.paymentForm = new SqPaymentForm({
      // Initialize the payment form elements
      applicationId: this.applicationId,
      locationId: this.locationId,
      // // inputClass: 'sq-input',
      autoBuild: false,
      // // inputStyles: [{
      // //   fontSize: '14px',
      // //   lineHeight: '24px',
      // //   padding: '0.429em',
      // //   placeholderColor: '#a0a0a0',
      // //   backgroundColor: '#ffffff',
      // //   color: '#333333'
      // // }],
      // Initialize the credit card placeholders
      card: {
        elementId: 'sq-card'
      },
      // // cardNumber: {
      // //   elementId: 'sq-card-number',
      // //   placeholder: 'Card Number'
      // // },
      // // cvv: {
      // //   elementId: 'sq-cvv',
      // //   placeholder: 'CVV'
      // // },
      // // expirationDate: {
      // //   elementId: 'sq-expiration-date',
      // //   placeholder: 'MM/YY'
      // // },
      // // postalCode: {
      // //   elementId: 'sq-postal-code',
      // //   placeholder: 'Postal'
      // // },
      // SqPaymentForm callback functions
      callbacks: {
        /*
        * callback function: methodsSupported
        * Triggered when: the page is loaded.
        */

        /*
        * callback function: cardNonceResponseReceived
        * Triggered when: SqPaymentForm completes a card nonce request
        */
        cardNonceResponseReceived: (errors, nonce, cardData) => {
          if (errors) {
            // Log errors from nonce generation to the Javascript console
            console.log("Encountered errors:");
            
            errors.forEach(function (error) {
              console.log('  ' + error.message);
            });
            return;
          }
          const orderId = document.getElementById('order-id').innerHTML;
          const token = localStorage.getItem('tch-user-token');          
          const paymentType = cardData.card_brand === "NONE" ? cardData.digital_wallet_type : cardData.card_brand;

          fetch('/api/payment/cc', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: orderId,
              paymentType: paymentType,
              nonce: nonce
            })
          })
          .catch(err => {
            alert(`Network error: ${err.message}`);
          })
          // .then(response => {
          //   if(!response.ok) {
          //     return response.text().then(errorInfo => Promise.reject(errorInfo));
          //   }

          //   return response.text();
          // })
          .then(data => {

          });

          console.log(`order id found: ${orderId}`);
          console.log(`nonce received ${nonce}`);
          console.log('cardData', cardData);
        },

        /*
        * callback function: paymentFormLoaded
        * Triggered when: SqPaymentForm is fully loaded
        */
        paymentFormLoaded: function () {
          /* HANDLE AS DESIRED */
        }
      }
    });

    this.paymentForm.build();
  }

  onGetCardNonce(event) {

    event.preventDefault();

    this.paymentForm.requestCardNonce();

  }
}
