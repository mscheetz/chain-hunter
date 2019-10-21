const db = require('../data/dataRepo');
const encryptionSvc = require("./encryption.js");
const helperSvc = require('./helperService');
const apiHelp = require('../services/apiHelper');

/**
 * Login to account
 * 
 * @param {string} username username
 * @param {string} password password
 */
const login = async(email, password) => {
    const validEmail = helperSvc.validateEmail(email);
    if(!validEmail) {
        return apiHelp.errorMessage("Not a valid email address", 400);
    }
    let user = email.indexOf('@') > 0 
                ? await db.getUserByEmail(email)
                : await db.getUser(email);

    if(typeof user === 'undefined') {
        return apiHelp.errorMessage("Invalid account");        
    }

    if(user.validated === null) {
        return apiHelp.errorMessage("Account not validated", 400);
    }

    const validLogin = await encryptionSvc.checkPassword(password, user.password);

    if(validLogin) {
        const token = await encryptionSvc.getToken(user);
        user.token = token;
        delete user.password;

        const removeToken = await db.deletePasswordReset(user.userId);

        return apiHelp.successMessage(user);
    } else {
        return apiHelp.errorMessage("Invalid password");
    }
}

/**
 * Register a user
 * @param {object} user 
 */
const registerUser = async(user) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return apiHelp.errorMessage("Not a valid email address", 400);
    }
    const userCheck = await db.getUserByEmail(user.email);
    if(typeof userCheck !== 'undefined' && userCheck.userId.length > 0) {
        return apiHelp.errorMessage("An account already exists with that email address", 400);
    }
    user.hash = await encryptionSvc.hashPassword(user.password);
    user.validated = null;
    delete user.password;

    const status = await db.postUser(user);

    await validateAccountRequest(user);

    return apiHelp.successMessage(status, 201);
}

const validateAccountRequest = async(user) => {
    // TODO: send validation email
}

/**
 * Update a user
 * @param {object} user 
 */
const updateUser = async(user) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return apiHelp.errorMessage("Not a valid email address", 400);
    }
    const status = await db.updateUser(user);

    return apiHelp.successMessage(status, 202);
}

/**
 * Validate a user's account
 * 
 * @param {string} userId 
 */
const validateUser = async(userId) => {
    const user = await getUserByUserId(userId);

    if(typeof user === 'undefined') {
        return apiHelp.errorMessage("Not a valid user", 400);
    }

    if(user.validated !== null) {
        return apiHelp.successMessage(true, 202);
    }

    const timestamp = helperSvc.getUnixTS();
    const validated = db.validateUser(userId, timestamp);

    if(validated === 1) {
        return apiHelp.successMessage(status, 202);
    } else {
        return apiHelp.errorMessage("Try again", 400);
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
        return apiHelp.errorMessage("Not a valid email address", 400);
    }

    const user = await getUserByEmail(email);

    if(typeof user === 'undefined') {
        return apiHelp.errorMessage("Not a valid user", 400);
    }

    const oneHourPlus = helperSvc.getTimePlus(0, 1, 0, 0);
    const ts = oneHourPlus.getTime() / 1000;
    const token = encryptionSvc.getUuid();

    const dbUpdate = await db.postPasswordReset(user.userId, token, ts);

    //TODO: SEND EMAIL with userId and token

    return apiHelp.successMessage(1);
}

const forgotPasswordAction = async(userId, token) =>{
    const user = await db.getUserByUserId(userId);

    if(typeof user === 'undefined') {
        return apiHelp.errorMessage("Not a valid user", 400);
    }

    const passwordReset = await db.getPasswordReset(userId);

    if(typeof passwordReset === 'undefined') {
        return apiHelp.errorMessage("Invalid request", 400);
    }

    if(passwordReset.token !== token) {
        return apiHelp.errorMessage("Invalid token", 401);
    }
    const currentTS = helperSvc.getUnixTS();
    if(passwordReset.goodTil < currentTS) {
        return apiHelp.errorMessage("Token has expired", 400);
    }

    const removeToken = await db.deletePasswordReset(userId);

    const newPassword = helperSvc.generatePassword();
    const hash = await encryptionSvc.hashPassword(newPassword);

    let updated = false;
    while(!updated) {
        const pwdUpdated = await db.setUserPassword(userId, hash);

        updated = pwdUpdated === 1 ? true : false;
    }

    return apiHelp.successMessage(newPassword);
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
        return apiHelp.errorMessage("Not a valid user", 400);
    }

    const validPwd = encryptionSvc.checkPassword(oldPassword, user.hash);

    if(!validPwd) {
        return apiHelp.errorMessage("Invalid password", 400);
    }

    const newHash = await encryptionSvc.hashPassword(newPassword);

    const status = await db.updateUserPassword(userId, user.hash, newHash);

    return apiHelp.successMessage(status, 202);
}

/**
 * Get a user by username
 * 
 * @param {string} username 
 */
const getUser = async(username) => {
    const user = await db.getUser(username);

    return apiHelp.successMessage(user[0]);
}

/**
 * Get a user by user id
 * 
 * @param {string} userId 
 */
const getUserByUserId = async(userId) => {
    const user = await db.getUserByUserId(userId);
    
    return apiHelp.successMessage(user[0]);
}

/**
 * Get saved search data
 * 
 * @param {string} userId user id
 */
const getUserData = async(userId) => {
    const data = await db.getUserData(userId);
    
    return apiHelp.successMessage(data[0]);
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
    const created = helperSvc.getUnixTS();
    const userData = {
        id: uuid,
        userId: userId,
        hash: hash,
        symbol: symbol,
        type: type,
        added: created
    }
    const result = await db.postUserData(userData);
        
    return apiHelp.successMessage(result, 201);
}
/**
 * Delete user saved search
 * 
 * @param {string} id saved search id
 */
const deleteUserData = async(id) => {
    const result = await db.deleteUserData(id);
        
    return apiHelp.successMessage(result, 202);
}

module.exports = {
    login,
    forgotPassword,
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