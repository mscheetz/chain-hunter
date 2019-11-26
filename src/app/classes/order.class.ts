export class Order {
    constructor() {}

    orderId: string;
    userId: string;
    accountTypeId: string;
    accountType: string;
    created: number;
    price: number;
    paymentTypeId: string;
    paymentTypeDetail: string;
    validTil: number;
    processed: number;
    discountCode: string;
    cryptoQuantity: number;
    processedDate: string;
}