const accountTypeRepo = require('../data/account-type.repo');
const discountCodeRepo = require('../data/discount-code.repo');
const passResetRepo = require('../data/password-reset.repo');
const userRepo = require('../data/user.repo');
const userDataRepo = require('../data/user-data.repo');
const orderRepo = require('../data/orders.repo');
const encryptionSvc = require('./encryption.service');
const helperSvc = require('./helper.service');
const responseSvc = require('./response.service');
const mailSvc = require('./mail.service');
const emailRepo = require('../data/email-subscription.repo');
const _ = require('lodash');
const fs = require('fs');

/**
 * Login to account
 * 
 * @param {string} username username
 * @param {string} password password
 */
const login = async(email, password) => {
    const validEmail = helperSvc.validateEmail(email);
    if(!validEmail) {
        return responseSvc.errorMessage("Not a valid email address", 400);
    }
    let user = email.indexOf('@') > 0 
                ? await userRepo.getByEmail(email)
                : await userRepo.getByUsername(email);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Invalid email or password");        
    }

    if(user.validated === null) {
        const status = await validateAccountRequest(user);
        return responseSvc.errorMessage("Account not validated. A validation email has been sent to your email address.", 400);
    }

    let validLogin = await encryptionSvc.checkPassword(password, user.hash);

    if(validLogin) {
        user = await userRepo.getUserAndAccount(user.userId);

        delete user.hash;

        user = await accountValidation(user);
        
        const token = await encryptionSvc.getToken(user.userId);
        const subscribed = await emailRepo.get(user.email);
        user.emailSubscription = subscribed.length > 0 ? true : false;
        user.token = token;
        if(user.savedHunts === null) {
            user.savedHunts = 0;
        }

        const removeToken = await passResetRepo.remove(user.userId);

        return responseSvc.successMessage(user);
    } else {
        return responseSvc.errorMessage("Invalid email or password");
    }
}

const accountValidation = async(user) => {
    const currentTs = helperSvc.getUnixTsSeconds();
    let message = "";
    
    if(user.expirationDate !== null && user.expirationDate < currentTs && user.accountTypeId > 1) {
        const exprDate = helperSvc.getDatefromTs(user.expirationDate);
        message = `Your account expired on ${exprDate}. You have been downgraded to a Free account.`;
        user.accountTypeId = 1;
        user.expirationDate = null;

        await userRepo.updateAccount(user.userId, 1);

        user = await userRepo.getUserAndAccount(user.userId);
    } else {
        message = "Welcome back!";
    }
    user.message = message;
    
    user = await userDataManagement(user);

    return user;
}

const userDataManagement = async(user) => {
    let userData = await getUserData(user.userId);
    let message = "";
    if(userData.data.length === 0) {
        return user;
    }
    
    let actives = userData.data.filter(u => u.active === true);
    let saveLimit = user.saveLimit;
    if(user.saveLimit === null) {
        saveLimit = userData.data.length;
    }
    if(actives.length > saveLimit) {
        if(userData !== null && actives.length > 0) {
            let activeCount = 0;
            let deactivatedCount = 0;
            for(let i = 0; i < actives.length; i++) {
                activeCount++;
                if(activeCount > saveLimit) {
                    deactivatedCount++;
                    await userDataRepo.updateState(actives[i].id, false);
                }
            }
            if(deactivatedCount > 0) {
                message += ` ${deactivatedCount} saved items have been deactivated.`;
            }
        }

    } else if(actives.length < saveLimit && userData.data.length > actives.length) {
        let inactives = userData.data.filter(u => u.active === false);
        let activeCount = actives.length;
        let reactivatedCount = 0;
        for(let i = 0; i < inactives.length; i++) {
            activeCount++;
            if(activeCount <= saveLimit) {
                reactivatedCount++;
                await userDataRepo.updateState(inactives[i].id, true);
            }
        }
        if(reactivatedCount > 0) {
            message += ` ${reactivatedCount} saved items have been reactivated.`;
        }
    }

    user.message = user.message + message;
    
    return user;
}

/**
 * Login as guest
 */
const guestLogin = async() => {
    const guestId = encryptionSvc.getUuid();
    const token = await encryptionSvc.getToken(guestId);

    return responseSvc.successMessage(token);
}

/**
 * Register a user
 * 
 * @param {string} email email address
 * @param {string} password password
 * @param {string} inviteCode invite code
 */
const registerUser = async(email, password, inviteCode) => {
    const validEmail = helperSvc.validateEmail(email);

    if(!validEmail) {
        return responseSvc.errorMessage("Not a valid email address", 400);
    }
    const userCheck = await userRepo.getByEmail(email);
    
    if(typeof userCheck !== 'undefined' && userCheck.userId.length > 0) {
        return responseSvc.errorMessage("An account already exists with that email address", 400);
    }
    const creationTime = helperSvc.getUnixTsSeconds();
    let user = {
        created: creationTime,
        email: email,
        userId: encryptionSvc.getUuid()
    };
    user.hash = await encryptionSvc.hashPassword(password);
    user.validated = null;
    user.accountTypeId = 1;
    user.emailSubscription = true;

    await emailRepo.add(user.email, creationTime);

    if(inviteCode !== "") {
        const discount = await getAccountTypeFromInviteCode(inviteCode);
        user.accountTypeId = discount.id;
        if(user.accountTypeId !== 1) {            
            user.expirationDate = helperSvc.getUnixTsPlus({d: discount.days});
        }
    }
    
    delete user.hash;

    const postStatus = await userRepo.add(user);
    
    if(typeof postStatus === 'undefined') {
        return responseSvc.errorMessage("Error creating account. Please try again.", 400);
    }

    const status = await validateAccountRequest(user);

    if(status) {
        return responseSvc.successMessage(status, 201);
    } else {
        return responseSvc.errorMessage("Error sending email. Attempt logging into the site.", 400);
    }
}

const validateAccountRequest = async(user) => {
    const verifyUrl = `https://wwww.thechainhunter.com/verify/${user.userId}`;
    const year = new Date().getFullYear();
    let template = fs.readFileSync('templates/verification.html',{encoding: 'utf-8'});
    template = template.replace('!#verifyLink#!', verifyUrl);
    template = template.replace('!#year#!', year);
    const subject = "The Chain Hunter: Account Verification";

    return mailSvc.sendEmail(user.email, subject, template);
}

const getAccountTypeFromInviteCode = async(code) => {
    let discountCode = await discountCodeRepo.get(code);

    if(typeof discountCode === 'undefined'){
        console.log('no code')
        return 1;
    }
    if(discountCode.redeemed === true) {
        console.log('code redeemed')
        return 1;
    }
    if(discountCode.multiUse === false) {
        console.log('code to be redeemed')
        await await discountCodeRepo.redeem(code);
    } else {
        await discountCodeRepo.consume(code);
        discountCode = await discountCodeRepo.get(code);
        
        if(discountCode.totalUses === discountCode.usedUses) {
            await await discountCodeRepo.redeem(code);
        }
    }
    const days = discountCode.days !== null ? parseInt(discountCode.days) : 0;

    return { id: parseInt(discountCode.accountTypeId), days: days };
}

/**
 * Update a user
 * @param {object} user 
 */
const updateUser = async(user, token) => {
    const status = await userRepo.updateUsername(user.userId, user.username);

    return responseSvc.successMessage(status, 202);
}

/**
 * Validate a user's account
 * 
 * @param {string} userId 
 */
const validateUser = async(userId) => {    
    const user = await userRepo.get(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Account not found", 400);
    }

    if(user.validated !== null) {
        return responseSvc.errorMessage("Account already validated", 400);
    }

    const timestamp = helperSvc.getUnixTS();
    const validated = await userRepo.validate(userId, timestamp);

    if(validated === 1) {
        return responseSvc.successMessage(true, 202);
    } else {
        return responseSvc.errorMessage("Please try again", 400);
    }
}

/**
 * Initialize a forgot password request
 * 
 * @param {string} email email address
 */
const forgotPasswordInit = async(email) => {
    const validEmail = helperSvc.validateEmail(email);
    if(!validEmail) {
        return responseSvc.errorMessage("Not a valid email address", 400);
    }

    const user = await userRepo.getByEmail(email);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    if(user.validated === null) {
        await validateAccountRequest(user);
        return responseSvc.errorMessage("Account not validated. A validation email has been sent to your email address.", 400);
    }

    const oneHourPlus = helperSvc.getTimePlus(0, 1, 0, 0);
    const ts = oneHourPlus.getTime() / 1000;
    const token = encryptionSvc.getUuid();

    await passResetRepo.remove(user.userId);
    const dbUpdate = await passResetRepo.add(user.userId, token, ts);

    const subject = "The Chain Hunter: Forgot Password";
    let template = fs.readFileSync('templates/forgotpassword.html',{encoding: 'utf-8'});
    const forgotUrl = `https://www.thechainhunter.com/password/${token}`;
    const year = new Date().getFullYear();
    template = template.replace('!#passwordLink#!', forgotUrl);
    template = template.replace('!#year#!', year);

    const status = mailSvc.sendEmail(email, subject, template);

    if(status) {
        return responseSvc.successMessage("A password reset email has been sent to your email account.");
    } else {
        return responseSvc.errorMessage("Something happened. Please try again.", 400);
    }
}

/**
 * Validate a password reset request
 * 
 * @param {string} token request token
 */
const validatePasswordReset = async(token) => {
    const ts = helperSvc.getUnixTsSeconds();
    const passwordRequest = await passResetRepo.getByToken(token);

    if(typeof passwordRequest === 'undefined' || passwordRequest === null) {
        return responseSvc.errorMessage("Invalid request", 400);
    }
    if(passwordRequest.goodTil >= ts) {
        return responseSvc.successMessage(true);
    } else {
        const removeToken = await passResetRepo.remove(userId);
    
        return responseSvc.errorMessage("Expired", 400);
    }
}

const forgotPasswordAction = async(token, password) =>{
    const request = await passResetRepo.getByToken(token);
    if(typeof request === 'undefined') {
        return responseSvc.errorMessage("Invalid request", 400);
    }    

    const user = await userRepo.get(request.userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    const hash = await encryptionSvc.hashPassword(password);

    let updated = false;
    let attempt = 0;
    while(!updated && attempt < 3) {
        const pwdUpdated = await userRepo.setPassword(request.userId, hash);

        updated = pwdUpdated === 1 ? true : false;
        attempt++;
    }

    if(updated) {
        const removeToken = await passResetRepo.remove(request.userId);

        return responseSvc.successMessage(true);
    } else {
        return responseSvc.errorMessage("Please try again", 400);
    }
}

/**
 * Change a user's password
 * @param {string} userId 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
const changePassword = async(userId, oldPassword, newPassword) => {    
    const user = await userRepo.get(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    const validPwd = await encryptionSvc.checkPassword(oldPassword, user.hash);

    if(!validPwd) {
        return responseSvc.errorMessage("Invalid password", 400);
    }

    const newHash = await encryptionSvc.hashPassword(newPassword);

    const status = await userRepo.updatePassword(userId, user.hash, newHash);

    if(status === 1) {
        return responseSvc.successMessage("Password updated", 202);
    } else {
        return responseSvc.errorMessage("Something happend, please try again", 400);
    }
}

/**
 * Get a user by username
 * 
 * @param {string} username 
 */
const getUser = async(username) => {
    const user = await userRepo.getByUsername(username);

    return responseSvc.successMessage(user[0]);
}

/**
 * Get a user by user id
 * 
 * @param {string} userId 
 */
const getUserByUserId = async(userId) => {
    let user = await userRepo.get(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("User not found", 400);
    }

    delete user.hash;
    
    const accountType = await accountTypeRepo.get(user.accountTypeId);
    const subscribed = await emailRepo.get(user.email);
    user.emailSubscription = subscribed.length > 0 ? true : false;
    
    user.accountType = accountType.name;
    user.saveLimit = accountType.saveLimit;
    user.searchLimit = accountType.searchLimit;
    user.message = "Your account has been updated!";

    return responseSvc.successMessage(user);
}

/**
 * Get orders for a user
 * @param {string} userId user id
 */
const getUserOrders = async(userId) => {
    let orders = await orderRepo.getByUser(userId);
    orders = orders.filter(o => o.processed !== null);
    const accountTypes = await accountTypeRepo.getAll();

    orders.forEach(order => {
        const accountType = accountTypes.find(a => a.uuid === order.accountTypeId);
        order.accountType = accountType.name;
    })
    
    return responseSvc.successMessage(orders);
}

/**
 * Get saved search data
 * 
 * @param {string} userId user id
 */
const getUserData = async(userId) => {
    const data = await userDataRepo.get(userId);
    
    return responseSvc.successMessage(_.orderBy(data, "symbol"));
}

/**
 * Add user saved search
 * 
 * @param {string} userId user id
 * @param {string} hash hash to save
 * @param {string} chain chain owning
 * @param {enum} type type of object
 */
const addUserData = async(userId, hash, chain, type) => {
    const uuid = encryptionSvc.getUuid();
    let userData = await getUserData(userId);
    let user = await userRepo.getUserAndAccount(userId);
    if(userData.length >= user.saveLimit) {
        return responseSvc.errorMessage("You have exceeded your save limit", 400);
    }
    let exists = userData.data.filter(u => u.hash === hash && u.symbol === chain && u.type === type);

    if(exists.length === 0) {
        const created = helperSvc.getUnixTS();
        const userData = {
            id: uuid,
            userId: userId,
            hash: hash,
            symbol: chain,
            type: type,
            added: created
        }
        const status = await userDataRepo.add(userData);
        userData = await getUserData(userId);
        exists = userData.data.filter(u => u.hash === hash && u.symbol === chain && u.type === type);
    }

    const result = exists.id;

    return responseSvc.successMessage(result, 201);
}

/**
 * Delete user saved search
 * 
 * @param {string} id saved search id
 */
const deleteUserData = async(id) => {
    const result = await userDataRepo.remove(id);
        
    return responseSvc.successMessage(result, 202);
}

/**
 * Validate an invite code
 * 
 * @param {string} id code id
 */
const validateInviteCode = async(id) => {
    const code = await discountCodeRepo.get(id);

    if(typeof code === 'undefined') {
        return responseSvc.errorMessage("Invalid code", 400);
    }

    if(code.validTil === null || code.validTil === "") {
        return responseSvc.successMessage(true);
    }

    const now = helperSvc.getUnixTsSeconds();

    if(now > code.validTil) {
        return responseSvc.errorMessage("Code expired", 400);
    }

    if(code.redeemed) {
        return responseSvc.errorMessage("Code already redeemed", 400);
    }

    return responseSvc.successMessage(true);
}

/**
 * Get a promo code
 * 
 * @param {string} code promoCode
 * @param {string} accountUuid account uuid
 */
const getPromoCode = async(code, accountUuid) => {
    const status = await validateInviteCode(code);
    if(status.code === 400) {
        return status;
    }
    const promoCode = await discountCodeRepo.get(code);

    let returnCode = {
        code: promoCode.code,
        percentOff: promoCode.percentOff,
        price: promoCode.price
    };

    if (promoCode.percentOff === null && promoCode.price === null) {
        return responseSvc.errorMessage("Invalid code", 400);
    }

    if(promoCode.accountTypeId !== null) {
        const account = await accountTypeRepo.getByUuid(accountUuid);

        if(typeof account !== 'undefined' && account !== null) {
            if(account.id.toString() !== promoCode.accountTypeId) {
                return responseSvc.errorMessage("Code not valid for this account type.", 400);
            }
            returnCode.accountTypeUuid = account.uuid;
        } else {
            responseSvc.errorMessage("Invalid code", 400);
        }
    }

    return responseSvc.successMessage(returnCode);
}

/**
 * Get all account types
 */
const getAccountTypes = async() => {
    const accounts = await accountTypeRepo.getAll();

    return responseSvc.successMessage(accounts);
}

const updateEmailSubscription = async(userId) => {
    const user = await userRepo.get(userId);
    const emailSub = await emailRepo.get(user.email);
    
    if(emailSub.length === 0) {
        const createdTime = helperSvc.getUnixTsSeconds();
        const status = await emailRepo.add(user.email, createdTime);
    } else {
        const status = await emailRepo.remove(user.email);
    }

    return responseSvc.successMessage(true);
}

/**
 * Subscribe an email address
 * @param {string} email email address
 */
const subscribeEmail = async(email) => {
    if(!helperSvc.validateEmail(email)) {
        return responseSvc.errorMessage("Invalid email address", 400);
    }
    const emailSub = await emailRepo.get(email);

    if(emailSub.length === 0) {
        const createdTime = helperSvc.getUnixTsSeconds();
        const status = await emailRepo.add(email, createdTime);

        const subject = "The Chain Hunter: Subscription";
        let template = fs.readFileSync('templates/welcome.html',{encoding: 'utf-8'});

        const year = new Date().getFullYear();
        
        template = template.replace('!#year#!', year);
    
        const mailStatus = mailSvc.sendEmail(email, subject, template);        
    }

    return responseSvc.successMessage(true);
}

/**
 * Unsubscribe an email address
 * @param {string} email email address
 */
const unSubscribeEmail = async(email) => {
    if(!helperSvc.validateEmail(email)) {
        return responseSvc.errorMessage("Invalid email address", 400);
    }
    const emailSub = await emailRepo.get(email);

    if(emailSub.length > 0) {
        const status = await emailRepo.remove(email);
    }

    return responseSvc.successMessage(true);
}

module.exports = {
    login,
    guestLogin,
    //forgotPassword,
    registerUser,
    updateUser,
    validateUser,
    changePassword,
    forgotPasswordInit,
    validatePasswordReset,
    forgotPasswordAction,
    getUser,
    getUserByUserId,
    getUserData,
    addUserData,
    deleteUserData,
    validateInviteCode,
    getPromoCode,
    getAccountTypes,
    getUserOrders,
    updateEmailSubscription,
    subscribeEmail,
    unSubscribeEmail
}