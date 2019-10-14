const db = require('./dataRepo');
const encryptionSvc = require("../services/encryption.js");

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

module.exports = {
    registerUser,
    updateUser,
    changePassword,
    getUser,
    getUserByUserId
}