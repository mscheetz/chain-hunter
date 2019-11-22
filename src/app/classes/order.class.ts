export class Order {
    constructor() {}

    orderId: string;
    userId: string;
    accountTypeId: string;
    created: number;
    price: number;
    paymentTypeId: string;
    paymentTypeDetailId: string;
    validTil: number;
    processed: number;
}