const SquareConnect = require('square-connect');
const config = require('../config');
const helperSvc = require('./helper.service');
const encryptionSvc = require('./encryption.service');
const responseSvc = require('./response.service');
const accountTypeRepo = require('../data/account-type.repo');
const cryptoPaymentTypeRepo = require('../data/crypto-payment-type.repo');
const discountCodeRepo = require('../data/discount-code.repo');
const orderRepo = require('../data/orders.repo');
const paymentTypeRepo = require('../data/payment-type.repo');
const userRepo = require('../data/user.repo');

const squareClient = SquareConnect.ApiClient.instance;
const oauth2 = squareClient.authentications['oauth2'];
oauth2.accessToken = config.SQUARE_TOKEN;

squareClient.basePath = config.ENV === 'DEV' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';

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
    let discount = discountCode === "" ? null : await discountCodeRepo.get(discountCode);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("User account not found", 400);
    }
    if(typeof accountType === 'undefined') {
        return responseSvc.errorMessage("Account type not found", 400);
    }
    if(typeof payment === 'undefined') {
        return responseSvc.errorMessage("Payment type not found", 400);
    }
    if(typeof discount === 'undefined') {
        return responseSvc.errorMessage("Discount code not found", 400);
    }
    if(discount !== null && discount.accountTypeId !== null && discount.accountTypeId !== accountTypeId) {
        return responseSvc.errorMessage("Discount code not valid for this order type", 400);
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
 * @param {object} order order object
 */
const processCreditCardPayment = async(order) => {

}

/**
 * Process crypto payment
 * @param {object} order order object
 */
const processCryptoPayment = async(order) => {

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