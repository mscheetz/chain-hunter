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
        return apiHelp.errorMessage("Not a valid email address");
    }
    let user = email.indexOf('@') > 0 
                ? await db.getUserByEmail(email)
                : await db.getUser(email);

    if(typeof user === 'undefined') {
        return apiHelp.errorMessage("Invalid account");        
    }

    const validLogin = await encryptionSvc.checkPassword(password, user.password);

    if(validLogin) {
        const token = await encryptionSvc.getToken(user);
        user.token = token;
        delete user.password;

        return apiHelp.successMessage(user);
    } else {
        return apiHelp.errorMessage("Invalid password");
    }
}

/**
 * Forgot password method 
 * 
 * @param {string} email email address
 */
const forgotPassword = async(email) => {
    // TODO: do something
    
    return apiHelp.successMessage(1);
}

/**
 * Register a user
 * @param {object} user 
 */
const registerUser = async(user) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return apiHelp.errorMessage("Not a valid email address");
    }
    user.hash = await encryptionSvc.hashPassword(user.password);
    delete user.password;

    const status = await db.postUser(user);

    return apiHelp.successMessage(status, 201);
}

/**
 * Update a user
 * @param {object} user 
 */
const updateUser = async(user) => {
    const validEmail = helperSvc.validateEmail(user.email);
    if(!validEmail) {
        return apiHelp.errorMessage("Not a valid email address");
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
 * Change a user's password
 * @param {string} userId 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
const changePassword = async(userId, oldPassword, newPassword) => {    
    const user = await getUserByUserId(userId);

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
    getUser,
    getUserByUserId,
    getUserData,
    addUserData,
    deleteUserData
}