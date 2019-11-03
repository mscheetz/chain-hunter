const db = require('../data/dataRepo');
const encryptionSvc = require("./encryption.js");
const helperSvc = require('./helperService');
const responseSvc = require('./responseService');
const _ = require('lodash');

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
                ? await db.getUserByEmail(email)
                : await db.getUser(email);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Invalid account");        
    }

    if(user.validated === null) {
        return responseSvc.errorMessage("Account not validated. A validation email has been sent to your email address.", 400);
    }

    let validLogin = await encryptionSvc.checkPassword(password, user.hash);

    if(validLogin) {
        console.log('user I', user);
        user = await db.getUserAndAccount(user.userId);
        console.log('user', user);
        const token = await encryptionSvc.getToken(user.userId);
        user.token = token;
        delete user.password;

        const removeToken = await db.deletePasswordReset(user.userId);

        return responseSvc.successMessage(user);
    } else {
        return responseSvc.errorMessage("Invalid password");
    }
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
    const userCheck = await db.getUserByEmail(email);
    if(typeof userCheck !== 'undefined' && userCheck.userId.length > 0) {
        return responseSvc.errorMessage("An account already exists with that email address", 400);
    }
    user.hash = await encryptionSvc.hashPassword(password);
    user.validated = null;
    user.accountTypeId = 1;
    if(inviteCode !== "") {
        user.accountTypeId = await getAccountTypeFromInviteCode(inviteCode);
    }
    delete user.password;

    const postStatus = await db.postUser(user);

    const status = await validateAccountRequest(user);

    return responseSvc.successMessage(status, 201);
}

const getAccountTypeFromInviteCode = async(code) => {
    const discountCode = await db.getDiscountCode(code);

    if(typeof discountCode === 'undefined'){
        return 1;
    }
    if(discountCode.redeemed !== null) {
        return 1;
    }
    if(!discountCode.multiUse) {
        await redeemDiscountCode(code);
    }
    return discountCode.accountTypeId;
}

const redeemDiscountCode = async(code) => {
    const status = await db.redeemDiscountCode(code);

    return status;
}

const validateAccountRequest = async(user) => {
    // TODO: send validation email

    return 'A validation email has been sent to your email address.';
}

/**
 * Update a user
 * @param {object} user 
 */
const updateUser = async(user, token) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return responseSvc.errorMessage("Not a valid email address", 400);
    }
    const status = await db.updateUser(user);

    return responseSvc.successMessage(status, 202);
}

/**
 * Validate a user's account
 * 
 * @param {string} userId 
 */
const validateUser = async(userId) => {    
    const user = await getUserByUserId(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    if(user.validated !== null) {
        return responseSvc.successMessage(true, 202);
    }

    const timestamp = helperSvc.getUnixTS();
    const validated = db.validateUser(userId, timestamp);

    if(validated === 1) {
        return responseSvc.successMessage(status, 202);
    } else {
        return responseSvc.errorMessage("Try again", 400);
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

    const user = await getUserByEmail(email);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    const oneHourPlus = helperSvc.getTimePlus(0, 1, 0, 0);
    const ts = oneHourPlus.getTime() / 1000;
    const token = encryptionSvc.getUuid();

    const dbUpdate = await db.postPasswordReset(user.userId, token, ts);

    //TODO: SEND EMAIL with userId and token

    return responseSvc.successMessage(1);
}

const forgotPasswordAction = async(userId, token) =>{
    const user = await db.getUserByUserId(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    const passwordReset = await db.getPasswordReset(userId);

    if(typeof passwordReset === 'undefined') {
        return responseSvc.errorMessage("Invalid request", 400);
    }

    if(passwordReset.token !== token) {
        return responseSvc.errorMessage("Invalid token", 401);
    }
    const currentTS = helperSvc.getUnixTS();
    if(passwordReset.goodTil < currentTS) {
        return responseSvc.errorMessage("Token has expired", 400);
    }

    const removeToken = await db.deletePasswordReset(userId);

    const newPassword = helperSvc.generatePassword();
    const hash = await encryptionSvc.hashPassword(newPassword);

    let updated = false;
    while(!updated) {
        const pwdUpdated = await db.setUserPassword(userId, hash);

        updated = pwdUpdated === 1 ? true : false;
    }

    return responseSvc.successMessage(newPassword);
}

/**
 * Change a user's password
 * @param {string} userId 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
const changePassword = async(userId, oldPassword, newPassword) => {    
    const user = await getUserByUserId(userId);

    if(typeof user === 'undefined') {
        return responseSvc.errorMessage("Not a valid user", 400);
    }

    const validPwd = encryptionSvc.checkPassword(oldPassword, user.hash);

    if(!validPwd) {
        return responseSvc.errorMessage("Invalid password", 400);
    }

    const newHash = await encryptionSvc.hashPassword(newPassword);

    const status = await db.updateUserPassword(userId, user.hash, newHash);

    return responseSvc.successMessage(status, 202);
}

/**
 * Get a user by username
 * 
 * @param {string} username 
 */
const getUser = async(username) => {
    const user = await db.getUser(username);

    return responseSvc.successMessage(user[0]);
}

/**
 * Get a user by user id
 * 
 * @param {string} userId 
 */
const getUserByUserId = async(userId) => {
    const user = await db.getUserByUserId(userId);
    
    return user;// responseSvc.successMessage(user[0]);
}

/**
 * Get saved search data
 * 
 * @param {string} userId user id
 */
const getUserData = async(userId) => {
    const data = await db.getUserData(userId);
    
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
    let user = await db.getUserAndAccount(userId);
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
        const status = await db.postUserData(userData);
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
    const result = await db.deleteUserData(id);
        
    return responseSvc.successMessage(result, 202);
}

/**
 * Validate an invite code
 * 
 * @param {string} id code id
 */
const validateInviteCode = async(id) => {
    const code = await db.getDiscountCode(id);

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

module.exports = {
    login,
    guestLogin,
    //forgotPassword,
    registerUser,
    updateUser,
    validateUser,
    changePassword,
    forgotPasswordInit,
    forgotPasswordAction,
    getUser,
    getUserByUserId,
    getUserData,
    addUserData,
    deleteUserData,
    validateInviteCode
}