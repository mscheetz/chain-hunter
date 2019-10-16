const db = require('../data/dataRepo');
const encryptionSvc = require("./encryption.js");
const helperSvc = require('./helperService');

/**
 * Register a user
 * @param {object} user 
 */
const registerUser = async(user) => {
    user.hash = await encryptionSvc.hashPassword(user.password);
    delete user.password;

    const status = await db.postUser(user);

    return status;
}

/**
 * Update a user
 * @param {object} user 
 */
const updateUser = async(user) => {    
    const status = await db.updateUser(user);

    return status;
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
        return "invalid password";
    }

    const newHash = await encryptionSvc.hashPassword(newPassword);

    const status = await db.updateUserPassword(userId, user.hash, newHash);

    return status;
}

/**
 * Get a user by username
 * 
 * @param {string} username 
 */
const getUser = async(username) => {
    return await db.getUser(username);
}

/**
 * Get a user by user id
 * 
 * @param {string} userId 
 */
const getUserByUserId = async(userId) => {
    return await db.getUserByUserId(userId);
}

/**
 * Get saved search data
 * 
 * @param {string} userId user id
 */
const getUserData = async(userId) => {
    return await db.getUserData(userId);
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
    return await db.postUserData(userData);
}
/**
 * Delete user saved search
 * 
 * @param {string} id saved search id
 */
const deleteUserData = async(id) => {
    return await db.deleteUserData(id);
}

module.exports = {
    registerUser,
    updateUser,
    changePassword,
    getUser,
    getUserByUserId,
    getUserData,
    addUserData,
    deleteUserData
}