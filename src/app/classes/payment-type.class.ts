import { IdName } from './id-name.class';
import { CryptoPaymentType } from './crypto-payment-type.class';

export class PaymentType extends IdName {
    
    cryptoTypes: CryptoPaymentType[];
}