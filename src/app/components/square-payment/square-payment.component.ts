import { Component, OnInit, Input, DoCheck, AfterViewChecked, AfterViewInit } from '@angular/core';

import { environment } from 'src/environments/environment';

declare var SqPaymentForm: any;

@Component({
  selector: 'app-square-payment',
  templateUrl: './square-payment.component.html',
  styleUrls: ['./square-payment.component.css']
})
export class SquarePaymentComponent implements OnInit, AfterViewChecked {
  paymentForm: any;
  @Input() totalAmount: number;
  @Input() showPage: boolean;
  applicationId: string = environment.squareApplicationId;
  locationId: string = environment.squareLocationId;

  constructor() { 
    this.loadCheck();
  }

  ngOnInit() {
    this.loadCheck();
  }

  ngAfterViewChecked() {
    this.loadCheck();
  }

  loadCheck() {
    if(this.showPage) {
      //console.log('page is now visible');
      if(typeof this.paymentForm === 'undefined' || this.paymentForm === null) {
        console.log('building form!')
        this.loadForm();
      }
    } else {
      //console.log('page not visible yet');
    }
  }

  loadForm(){
    this.paymentForm = new SqPaymentForm({
      // Initialize the payment form elements
      applicationId: this.applicationId,
      locationId: this.locationId,
      inputClass: 'sq-input',
      autoBuild: false,
      inputStyles: [{
        fontSize: '14px',
        lineHeight: '24px',
        padding: '0.429em',
        placeholderColor: '#a0a0a0',
        backgroundColor: '#ffffff',
        color: '#333333'
      }],
      // Initialize the credit card placeholders
      cardNumber: {
        elementId: 'sq-card-number',
        placeholder: 'Valid Card Number'
      },
      cvv: {
        elementId: 'sq-cvv',
        placeholder: 'CVV'
      },
      expirationDate: {
        elementId: 'sq-expiration-date',
        placeholder: 'Expiration'
      },
      postalCode: {
        elementId: 'sq-postal-code',
        placeholder: 'Zip Code'
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
            return;
          }

          console.log(`nonce received ${nonce}`);
          console.log('cardData', cardData);
          //this.updateCustomerCard(nonce, cardData.billing_postal_code);
          // this.paymentForm.destroy();
          // this.paymentForm.build();
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

  loadFormer() {
    const applicationId = environment.squareApplicationId;

    // onGetCardNonce is triggered when the "Pay $1.00" button is clicked
    function onGetCardNonce(event) {
    // Don't submit the form until SqPaymentForm returns with a nonce
      event.preventDefault();
    // Request a nonce from the SqPaymentForm object
    // tslint:disable-next-line: no-use-before-declare
      paymentForm.requestCardNonce();
    }

    // Create and initialize a payment form object
    const paymentForm = new SqPaymentForm({
    // Initialize the payment form elements
      applicationId,
      inputClass: 'sq-input',

    // Customize the CSS for SqPaymentForm iframe elements
      inputStyles: [{
        fontSize: '16px',
        lineHeight: '24px',
        padding: '16px',
        placeholderColor: '#a0a0a0',
        backgroundColor: 'transparent',
      }],

    // Initialize the credit card placeholders
      cardNumber: {
          elementId: 'sq-card-number',
          placeholder: 'Card Number'
      },
      cvv: {
          elementId: 'sq-cvv',
        placeholder: 'CVV'
      },
      expirationDate: {
          elementId: 'sq-expiration-date',
          placeholder: 'MM/YY'
      },
      postalCode: {
          elementId: 'sq-postal-code',
          placeholder: 'Postal'
      },

    // SqPaymentForm callback functions
      callbacks: {
        /*
        * callback function: cardNonceResponseReceived
        * Triggered when: SqPaymentForm completes a card nonce request
      */
        cardNonceResponseReceived (errors, nonce, cardData) {
        if (errors) {
            // Log errors from nonce generation to the browser developer console.
          console.error('Encountered errors:');
    // tslint:disable-next-line: only-arrow-functions
          errors.forEach(function(error) {
                console.error('  ' + error.message);
            });
          alert('Encountered errors, check browser developer console for more details');
            return;
        }

        alert(`The generated nonce is:\n${nonce}`);
      // Uncomment the following block to
      // 1. assign the nonce to a form field and
      // 2. post the form to the payment processing handler

      ( document.getElementById('card-nonce') as HTMLInputElement).value = 
    nonce
        ( document.getElementById('nonce-form') as HTMLFormElement).submit();

      alert('The generated nonce is:\n${nonce}');
      }
    }
    });
    
    paymentForm.build();    
  }

  loadPaymentForm() {    
    const locationId = environment.squareLocationId;

    this.paymentForm = new SqPaymentForm({
      applicationId: environment.squareApplicationId,
      inputClass: 'sq-input',
      autoBuild: false,
      inputStyles: [{
        fontSize: '16px',
        lineHeight: '24px',
        padding: '16px',
        placeholderColor: '#a0a0a0',
        backgroundColor: 'transparent',
      }],
      
      cardNumber: {
        elementId: 'sq-card-number',
        placeholder: 'Card Number'//'•••• •••• •••• ••••'
      },
      ccv: {
        elementId: 'sq-ccv',
        placeholder: 'CCV'
      },
      expirationDate: {
        elementId: 'sq-expiration-date',
        placeholder: 'MM/YY'
      },
      postalCode: {
        elementId: 'sq-postal-code',
        placeholder: 'Postal'
      },
      callbacks: {
          /*
          * callback function: cardNonceResponseReceived
          * Triggered when: SqPaymentForm completes a card nonce request
          */
          cardNonceResponseReceived: function (errors, nonce, cardData) {
          if (errors) {
              // Log errors from nonce generation to the browser developer console.
              console.error('Encountered errors:');
              errors.forEach(function (error) {
                  console.error('  ' + error.message);
              });
              alert('Encountered errors, check browser developer console for more details');
              return;
          }
             alert(`The generated nonce is:\n${nonce}`);
             //TODO: Replace alert with code in step 2.1
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
