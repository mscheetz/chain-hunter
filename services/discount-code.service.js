const discountCodeRepo = require('../data/discount-code.repo');
const helperSvc = require('./helper.service');
const responseSvc = require('./response.service');

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
    
    if(typeof discountCode === 'undefined'){
        return `${codeType} Code not found`;
    }
    if(accountTypeId > 0 && discountCode.accountTypeId !== null && parseInt(discountCode.accountTypeId) !== accountTypeId) {
        return `${codeType} Code not valid for this order`;
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

/**
 * Get all discount codes
 */
const getAll = async() => {
    const codes = await discountCodeRepo.getAll();

    return responseSvc.successMessage(codes);
}

/**
 * Add a discount code
 * @param {object} discountCode discount code object
 */
const addDiscountCode = async(discountCode) => {
    discountCode.code = discountCode.code || "";
    discountCode.percentOff = discountCode.percentOff || null;
    discountCode.multiUse = discountCode.multiUse || false;
    discountCode.redeemed = discountCode.redeemed || false;
    discountCode.price = discountCode.price || null;
    discountCode.days = discountCode.days || null;
    discountCode.totalUses = discountCode.totalUses || 0;
    discountCode.usedUses = discountCode.usedUses || 0;
    discountCode.accountTypeId = discountCode.accountTypeId || null;
    discountCode.validTil = discountCode.validTil || null;

    let errorMessage = "";
    if(discountCode.code === null || discountCode.code === "") {
        errorMessage = "No code specified";
    }
    if(discountCode.validTil !== null) {
        const now = helperSvc.getUnixTsSeconds();
        if(now > validTil) {
            errorMessage = "Valid Til date has already happened";
        }
    }
    
    if(errorMessage !== "") {
        return responseSvc.errorMessage(errorMessage, 400);
    }

    if(discountCode.days === 0) {
        discountCode.days = null;
    }
    if(discountCode.price === 0) {
        discountCode.price = null;
    }
    if(discountCode.percentOff === 0) {
        discountCode.percentOff = null;
    }

    try {
        const status = await discountCodeRepo.add(discountCode);

        return responseSvc.successMessage(true);
    } catch(err) {
        return responseSvc.errorMessage(err, 400);
    }
}

/**
 * Update a discount code
 * @param {object} discountCode discount code object
 */
const updateDiscountCode = async(discountCode) => {
    const code = await discountCodeRepo.get(discountCode.code);
    discountCode.code = discountCode.code || "";
    discountCode.percentOff = discountCode.percentOff || code.percentOff;
    discountCode.multiUse = discountCode.multiUse || code.multiUse;
    discountCode.redeemed = discountCode.redeemed || code.redeemed;
    discountCode.price = discountCode.price || code.price;
    discountCode.days = discountCode.days || code.days;
    discountCode.totalUses = discountCode.totalUses || code.totalUses;
    discountCode.usedUses = discountCode.usedUses || code.usedUses;
    discountCode.accountTypeId = discountCode.accountTypeId || code.accountTypeId;
    discountCode.validTil = discountCode.validTil || code.validTil;

    if(discountCode.code === null || discountCode.code === "") {
        return responseSvc.errorMessage("No code specified", 400);
    }

    try {
        const status = await discountCodeRepo.updateDiscountCode(discountCode);

        return responseSvc.successMessage(true);
    } catch(err) {
        return responseSvc.errorMessage(err, 400);
    }
}


module.exports = {
    getDetails,
    validate,
    consume,
    redeem,
    getAll,
    addDiscountCode,
    updateDiscountCode
}