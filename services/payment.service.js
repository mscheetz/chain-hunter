const squareConnect = require('square-connect');
const config = require('../config');
const helperSvc = require('./helper.service');
const encryptionSvc = require('./encryption.service');
const responseSvc = require('./response.service');
const accountTypeRepo = require('../data/account-type.repo');
const cryptoPaymentTypeRepo = require('../data/crypto-payment-type.repo');
const discountCodeRepo = require('../data/discount-code.repo');
const orderRepo = require('../data/orders.repo');
const paymentTypeRepo = require('../data/payment-type.repo');
const discountCodeSvc = require('./discount-code.service');
const userRepo = require('../data/user.repo');

const squareClient = squareConnect.ApiClient.instance;
const oauth2 = squareClient.authentications['oauth2'];
oauth2.accessToken = config.SQUARE_TOKEN;

squareClient.basePath = config.SQUARE_BASE_URL;

/**
 * Get payment types
 */
const getPaymentTypes = async() => {
    const types = await paymentTypeRepo.getAll();

    return responseSvc.successMessage(types);
}

/**
 * Get crypto payment types
 */
const getCryptoPaymentTypes = async() => {
    const types = await cryptoPaymentTypeRepo.getAll();

    return responseSvc.successMessage(types);
}

/**
 * Create a new order
 * @param {string} userId user id
 * @param {string} accountTypeId account type id
 * @param {string} paymentTypeId payment type id
 * @param {number} price order price
 * @param {string} discountCode discount code (optional)
 * @returns {string} new order Id
 */
const createOrder = async(userId, accountTypeId, paymentTypeId, price, discountCode) => {
    const user = await userRepo.get(userId);    
    const accountType = await accountTypeRepo.getByUuid(accountTypeId);
    const payment = await paymentTypeRepo.get(paymentTypeId);
    let discount = discountCode === "" ? null : await discountCodeSvc.validate(discountCode, accountTypeId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("User account not found", 400);
    }
    if(typeof accountType === 'undefined') {
        return responseSvc.errorMessage("Account type not found", 400);
    }
    if(typeof payment === 'undefined') {
        return responseSvc.errorMessage("Payment type not found", 400);
    }
    if(discount !== null && helperSvc.validateString(discount)) {
        return responseSvc.errorMessage(discount, 400);
    }
    const userOrders = await orderRepo.getByUser(userId);

    for(let i = 0; i < userOrders.length; i++) {
        if(userOrders[i].processed === null) {
            await orderRepo.remove(userOrders[i].orderId);
        }
    }

    const validPrice = calculatePrice(accountType.yearly, discount);
    if(validPrice !== price) {
        return responseSvc.errorMessage(`Price is not correct, should be: ${validPrice}`, 400);
    }

    let order = {
        userId: userId,
        accountTypeId: accountTypeId,
        price: price,
        orderType: paymentTypeId
    };
    order.orderId = encryptionSvc.getUuid();
    order.created = helperSvc.getUnixTS();
    order.validTil = helperSvc.getUnixTsPlus({h: 1});
    if(discountCode !== "") {
        order.discountCode = discountCode;
    }

    await orderRepo.add(order);

    return responseSvc.successMessage(order.orderId);
}

const getOrder = async(orderId) => {
    const order = await orderRepo.get(orderId);
    const now = helperSvc.getUnixTsSeconds();

    if(typeof order === 'undefined') {
        return responseSvc.errorMessage("This Order was not found. Please place a new one.", 400);
    }    
    if(now > order.validTil) {
        return responseSvc.errorMessage("This Order has expired. Please place a new one.", 400);        
    }

    return responseSvc.successMessage(order);
}

/**
 * Process credit card payment
 * @param {object} paymentDetails payment details object
 */
const processCreditCardPayment = async(paymentDetails) => {
    const idempotency_key = encryptionSvc.getIdempotencyKey();
    const order = await orderRepo.get(paymentDetails.orderId);
    if(typeof order === 'undefined') {
        return responseSvc.errorMessage("Order not found", 400);
    }

    const orderAmount = order.price * 100;

    const paymentApi = new squareConnect.PaymentsApi();
    const body = {
        source_id: paymentDetails.nonce,
        amount_money: {
            amount: orderAmount,
            currency: 'USD'
        },
        idempotency_key: idempotency_key
    };

    try{
        const response = await paymentApi.createPayment(body);

        await processPayment(paymentDetails);

        return responseSvc.successMessage(response);
    } catch(err) {
        const error = JSON.parse(err.response.text);

        return responseSvc.errorMessage(error, 400);
    }
}

/**
 * Process crypto payment
 * @param {object} paymentDetails payment details object
 */
const processCryptoPayment = async(paymentDetails) => {

}

const processPayment = async(paymentDetails) => {
    const currentTS = helperSvc.getUnixTsSeconds();
    const order = await orderRepo.get(paymentDetails.orderId);
    const accountType = await accountTypeRepo.getByUuid(order.accountTypeId);
    let expirationDate = null;

    if(order.discountCode !== null) {
        const discount = await discountCodeSvc.getDetails(order.discountCode);
        if(discount.days !== null && discount.days > 0) {
            expirationDate = helperSvc.getUnixTsPlus({ d: discount.days });
        }
        if(discount.toConsume) {
            await discountCodeSvc.consume(order.discountCode);
        } else if(discount.toRedeem) {
            await discountCodeSvc.redeem(order.discountCode);
        }
    }

    await orderRepo.processOrder(paymentDetails.orderId, paymentDetails.paymentType, currentTS);

    await userRepo.updateAccount(paymentDetails.userId, accountType.id, expirationDate);
}

/**
 * Calculate price
 * @param {number} price price
 * @param {object} discountCode discount code object
 */
const calculatePrice = function(price, discountCode){
    if(discountCode !== null) {
        if(discountCode.percentOff !== null && discountCode.percentOff > 0) {
            return (price - (price * discountCode.percentOff));
        }

        if(discountCode.price !== null) {
            return discountCode.price;
        }
    }
    return price;
}

module.exports = {
    getPaymentTypes,
    getCryptoPaymentTypes,
    createOrder,
    getOrder,
    processCreditCardPayment,
    processCryptoPayment
}