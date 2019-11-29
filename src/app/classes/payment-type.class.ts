import { IdName } from './id-name.class';
import { PaymentTypeDetail } from './payment-type-detail.class';

export class PaymentType extends IdName {
    
    paymentTypeDetails: PaymentTypeDetail[];
}