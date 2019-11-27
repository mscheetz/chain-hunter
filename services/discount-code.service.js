const discountCodeRepo = require('../data/discount-code.repo');
const helperSvc = require('./helper.service');

/**
 * Get discount code details
 * @param {string} code discount code
 */
const getDetails = async(code) => {
    let discountCode = await discountCodeRepo.get(code);
    let toRedeem = false;
    let toConsume = false;

    if(discountCode.multiUse === false) {
        toRedeem = true;
    } else {
        if(discountCode.totalUses > 0) {
            toConsume = true;
        }
        if(discountCode.totalUses === (discountCode.usedUses + 1)) {
            toRedeem = true;
        }
    }

    const days = discountCode.days !== null || discountCode.days > 0 ? parseInt(discountCode.days) : null;

    const details = { 
        id: parseInt(discountCode.accountTypeId), 
        days: days, 
        toConsume: toConsume, 
        toRedeem: toRedeem, 
        price: discountCode.price, 
        percentOff: discountCode.percentOff 
    };

    return details;
}

/**
 * Validate a discount code
 * @param {string} code discount code
 * @param {number} accountTypeId accoun type id (optional)
 */
const validate = async(code, accountTypeId = 0) => {
    let discountCode = await discountCodeRepo.get(code);
    const codeType = accountTypeId === 0 ? "Invite" : "Discount";
    const nowTS = helperSvc.getUnixTsSeconds();

    if(accountTypeId > 0 && discountCode.accountTypeId !== accountTypeId) {
        return `${codeType} Code not valid for this order`;
    }
    if(typeof discountCode === 'undefined'){
        return `${codeType} Code not found`;
    }
    if(discountCode.validTil !== null && discountCode.validTil < nowTS) {
        return `${codeType} Code has expired`;
    }
    if(discountCode.redeemed === true) {
        return `${codeType} Code already redeemed`;
    }
    if(discountCode.multiUse === true) {
        if(discountCode.totalUses > 0 && discountCode.totalUses === discountCode.usedUses) {
            return `${codeType} Code has been used up`;
        }
    }
    if(accountTypeId === 0 && (discountCode.percentOff !== null || discountCode.price !== null)) {
        return `${codeType} Code not valid for registrations`;
    }

    const validatedResult = await getDetails(code);

    return validatedResult;
}

/**
 * Consume a discount code
 * @param {string} code discount code
 */
const consume = async(code) => {
    const status = await discountCodeRepo.consume(code);
    const discountCode = await discountCodeRepo.get(code);
    
    if(discountCode.totalUses === discountCode.usedUses) {
        await redeem(code);
    }
}

/**
 * Redeem a discount code
 * @param {string} code discount code
 */
const redeem = async(code) => {
    return await discountCodeRepo.redeem(code);
}

module.exports = {
    getDetails,
    validate,
    consume,
    redeem
}