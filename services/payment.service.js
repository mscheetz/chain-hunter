const squareConnect = require('square-connect');
const config = require('../config');
const helperSvc = require('./helper.service');
const encryptionSvc = require('./encryption.service');
const responseSvc = require('./response.service');
const accountTypeRepo = require('../data/account-type.repo');
const paymentTypeDetailRepo = require('../data/payment-type-detail.repo');
const orderRepo = require('../data/orders.repo');
const paymentTypeRepo = require('../data/payment-type.repo');
const discountCodeSvc = require('./discount-code.service');
const userRepo = require('../data/user.repo');
const mailSvc = require('./mail.service');
const enums = require('../classes/enums');
const _ = require('lodash');
const fs = require('fs');

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

const getPaymentTypesWithDetails = async() => {
    let types = await paymentTypeRepo.getAll();
    const details = await paymentTypeDetailRepo.getAll();

    types.forEach(type => {
        type.details = details.filter(d => d.paymentTypeId === type.id);
    });

    return responseSvc.successMessage(types);
}

/**
 * Get payment type details
 */
const getPaymentTypeDetails = async() => {
    let types = await paymentTypeDetailRepo.getAll();

    types = _.orderBy(types, "name");

    return responseSvc.successMessage(types);
}

/**
 * Upgrade an account
 * @param {string} userId user id
 * @param {string} promoCode promo code
 * @param {string} accountUuid new account type uuid
 */
const upgradeAccount = async(userId, promoCode, accountUuid) => {
    const account = await accountTypeRepo.getByUuid(accountUuid);
    const discountCode = await discountCodeSvc.validate(promoCode, account.id);

    if(helperSvc.validateString(discountCode)){
        return responseSvc.errorMessage(discountCode, 400);
    }

    if(discountCode.price !== null || discountCode.price > 0 || discountCode.percentOff !== null || discountCode.percentOff > 0) {
        return responseSvc.errorMessage("Invalid promo code", 400);
    }
    
    const order = await createOrder(userId, accountUuid, "", 0, promoCode);
    
    if(order.code !== 200){
        return order;
    }

    const paymentDetails = {
        orderId: order.data, 
        paymentType: "Discount Code",
        userId: userId,
        nonce: null
    };

    await processPayment(paymentDetails);

    return responseSvc.successMessage(true);
}

/**
 * Create a new order
 * @param {string} userId user id
 * @param {string} accountTypeId account type id
 * @param {string} paymentTypeId payment type id
 * @param {number} price order price
 * @param {string} discountCode discount code (optional)
 */
const createOrder = async(userId, accountTypeId, paymentTypeId, price, discountCode) => {
    const user = await userRepo.get(userId);
    const accountType = await accountTypeRepo.getByUuid(accountTypeId);
    price = +price;
    let payment = paymentTypeId === "" ? null : await paymentTypeRepo.get(paymentTypeId);
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

    if(+validPrice !== +price) {
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

/**
 * Get an order by order id
 * @param {string} orderId order id
 */
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

    paymentDetails.source = enums.paymentSource.creditCard;

    try{
        const response = await paymentApi.createPayment(body);

        await processPayment(paymentDetails);

        return responseSvc.successMessage(response);
    } catch(err) {
        console.log('err', err);
        const error = JSON.parse(err.response.text);

        return responseSvc.errorMessage(error, 400);
    }
}

/**
 * Process crypto payment
 * @param {object} paymentDetails payment details object
 */
const processCryptoPayment = async(paymentDetails) => {

    paymentDetails.source = enums.paymentSource.cryptocurrency;

}

/**
 * Process a payment
 * @param {object} paymentDetails payment details object
 */
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

    const user = await userRepo.get(paymentDetails.userId);

    await sendConfirmationEmail(user, accountType.name, paymentDetails.source, paymentDetails.paymentType, order.price);
}

/**
 * Calculate price
 * @param {number} price price
 * @param {object} discountCode discount code object
 */
const calculatePrice = function(price, discountCode){
    let newPrice = 0;
    if(discountCode !== null) {
        if(discountCode.percentOff !== null && discountCode.percentOff > 0) {
            const total = (price - (price * discountCode.percentOff));

            newPrice = helperSvc.currencyRound(total);
        }

        if(discountCode.price !== null) {
            newPrice = helperSvc.currencyRound(discountCode.price);
        }
    } else {
        newPrice = price;
    }
    return newPrice;
}

/**
 * Send payment confirmation email to user
 * @param {object} user user object
 * @param {string} accountType account type purchasesd
 * @param {enum} paymentSource payment source
 * @param {string} paymentType payment type
 * @param {number} total total paid
 */
const sendConfirmationEmail = async(user, accountType, paymentSource, paymentType, total) => {
    let paymentDetails = "";
    let username = user.username === null ? user.email : user.username
    if(paymentSource === enums.paymentSource.creditCard) {
        paymentDetails = `Your ${paymentType} has been charged $${total}.`;
    } else if (paymentSource = enums.paymentSource.cryptocurrency) {
        paymentDetails = `You paid ${total} ${paymentType}`;
    }
    const year = new Date().getFullYear();
    let template = fs.readFileSync('templates/orderConfirmation.html',{encoding: 'utf-8'});
    template = template.replace('!#user#!', username);
    template = template.replace(/!#accountType#!/g, accountType);
    template = template.replace('!#paymentDetails#!', paymentDetails);
    template = template.replace('!#year#!', year);
    const subject = "The Chain Hunter: Order Confirmation";

    return mailSvc.sendEmail(user.email, subject, template);
}

module.exports = {
    upgradeAccount,
    getPaymentTypes,
    getPaymentTypesWithDetails,
    getPaymentTypeDetails,
    createOrder,
    getOrder,
    processCreditCardPayment,
    processCryptoPayment
}