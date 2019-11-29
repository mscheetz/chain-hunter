import { Component, OnInit, Input, DoCheck, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { Order } from 'src/app/classes/order.class';
import { AuthenticationService } from 'src/app/services/authentication.service';

declare var SqPaymentForm: any;

@Component({
  selector: 'app-cc-checkout',
  templateUrl: './cc-checkout.component.html',
  styleUrls: ['./cc-checkout.component.css']
})
export class CreditCardCheckoutComponent implements OnInit, OnDestroy {
  paymentForm: any;
  applicationId: string = environment.squareApplicationId;
  locationId: string = environment.squareLocationId;
  referralUrl: string = environment.squareReferralUrl;
  orderId: string;
  order: Order;
  validOrder: boolean = null;
  invalidMessage: string;
  nonce: string;

  constructor(private route: ActivatedRoute, private apiSvc: ApiService, private router: Router, private authSvc: AuthenticationService) { }

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

  ngOnDestroy() {
    const completedOrder = (<HTMLInputElement>document.querySelector("#completed-order")).value;
    if(completedOrder === this.orderId) {
      this.userRefresh();
    }
  }

  async userRefresh(){
    await this.authSvc.userRefresh();
  }

  toCart() {
    this.router.navigate(["cart"])
  }

  loadForm(){
    this.paymentForm = new SqPaymentForm({
      // Initialize the payment form elements
      applicationId: this.applicationId,
      locationId: this.locationId,
      autoBuild: false,
      // Initialize the credit card placeholders
      card: {
        elementId: 'sq-card'
      },
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
            const payButton = document.getElementById("sq-creditcard");
            payButton.style.visibility = 'visible';
            const processingDiv = document.getElementById("processing");
            processingDiv.hidden = true;
            return;
          }
          const orderId = document.getElementById('order-id').innerHTML;
          const token = localStorage.getItem('tch-user-token');          
          const paymentType = cardData.card_brand === "NONE" ? cardData.digital_wallet_type : cardData.card_brand;
          const endpoint = "/api/payment/cc";
          const body = {
            orderId: orderId,
            paymentType: paymentType,
            nonce: nonce
          };
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };

          function post(url: string, data: any, headers: any): Promise<any> {
            const jsonBody = JSON.stringify(data);
            return fetch(url, {
              method: 'POST',
              body: jsonBody,
              headers: headers
            })
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
              return error;
            })
          }

          function handleError(errors: any[]) {
            let message: string = errors[0].code;
            
            let errorDetail = message === "GENERIC_DECLINE" ? "Payment Declined" : 
              message === "ADDRESS_VERIFICATION_FAILURE" ? "Invalid Postal Code" : 
              message === "INVALID_EXPIRATION" ? "Invalid Expiration Date" :
              message === "CVV_FAILURE" ? "Invalid CCV" : message.replace("_", " ");

            const errorDiv = document.getElementById("error-status");

            errorDiv.innerHTML = errorDetail;
            errorDiv.hidden = false;
          }

          post(endpoint, body, headers)
            .then(res => {
              console.log('post res', res);
              if(typeof res.errors !== 'undefined') {
                console.log('payment error');
                handleError(res.errors);
                return;
              } else {
                console.log('successful payment');
                document.getElementById("form-container").classList.add("display-none");
                document.getElementById("order-complete").classList.remove("display-none");
                (<HTMLInputElement>document.getElementById("completed-order")).value = orderId;
              }
            })
            .catch(err => {
              console.log('post error', err);
              handleError(err);
            })
        },

        /*
        * callback function: paymentFormLoaded
        * Triggered when: SqPaymentForm is fully loaded
        */
        paymentFormLoaded: function () {
          /* HANDLE AS DESIRED */
          document.getElementById("sq-creditcard").classList.remove("display-none");
        }
      }
    });

    this.paymentForm.build();
  }

  onGetCardNonce(event) {
    const payButton = document.getElementById("sq-creditcard");
    payButton.style.visibility = 'hidden';
    const processingDiv = document.getElementById("processing");
    processingDiv.hidden = false;
    const errorDiv = document.getElementById("error-status");
    errorDiv.hidden = true;

    event.preventDefault();

    this.paymentForm.requestCardNonce();
  }
}
