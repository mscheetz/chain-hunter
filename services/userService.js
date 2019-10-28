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
 * @param {object} user 
 */
const registerUser = async(user) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return responseSvc.errorMessage("Not a valid email address", 400);
    }
    const userCheck = await db.getUserByEmail(user.email);
    if(typeof userCheck !== 'undefined' && userCheck.userId.length > 0) {
        return responseSvc.errorMessage("An account already exists with that email address", 400);
    }
    user.hash = await encryptionSvc.hashPassword(user.password);
    user.validated = null;
    delete user.password;

    const status = await db.postUser(user);

    await validateAccountRequest(user);

    return responseSvc.successMessage(status, 201);
}

const validateAccountRequest = async(user) => {
    // TODO: send validation email
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
    const userData = await getUserData(userId);
    const exists = userData.data.filter(u => u.hash === hash && u.symbol === chain && u.type === type);

    let result;
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
        result = await db.postUserData(userData);
    } else {
        result = 0;
    }
        
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
    deleteUserData
}