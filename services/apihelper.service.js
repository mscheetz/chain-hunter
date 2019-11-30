const config = require('../config');
const encryptionSvc = require('./encryption.service');
const userSvc = require('./user.service');
const responseSvc = require('./response.service');
const whitelistUsers = new Map([
    [config.CHAINHUNTER_USER, config.CHAINHUNTER_TOKEN]]);
  
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

/**
 * Bootleg middeware, check if correct bootleg headers and values
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const bootlegMiddleware = async(req, res, next) => {
    const headerMsg = headerCheck(req);
    
    if (!headerMsg.status) {
        const datas = errorResponse(res);
        res.status(datas.code).json(datas.data);
        res.end;
    }
    
    res.locals.ip = headerMsg.ip;
    next();
}

/**
 * Auth middleware, check if correct auth headers exist
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const authMiddleware = async(req, res, next) => {
    let token = req.headers['authorization'];
    if(typeof token === 'undefined') {
        token = req.headers['x-access-token'];
    }
    
    if(typeof token === 'undefined') {
        res.status(401).json("no token");
        res.end();
    }
    token = token.substr(7, token.length);
    const tokenValid = await encryptionSvc.isTokenValid(token);
    if(!tokenValid){
        res.status(401).json("invalid token");
        res.end;
    } else {
        next();
    }
}

/**
 * Guest middleware, check if valid guest jwt
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const guestMiddleware = async(req, res, next) => {
    let token = req.header('authorization');
    token = token.substr(7, token.length);
    const guestId = await encryptionSvc.getUserIdFromToken(token);
    const validUuid = await encryptionSvc.validUuid(guestId);
    if(!validUuid){
        res.status(401).json("invalid token payload");
        res.end;
    }
    next();
}

/**
 * User middleware, check if valid user jwt
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const userMiddleware = async(req, res, next) => {
    let token = req.headers['authorization'];
    if(typeof token === 'undefined') {
        res.status(401).json("no token");
        res.end();
    }
    token = token.substr(7, token.length);
    const userId = await encryptionSvc.getUserIdFromToken(token);
    
    const user = await userSvc.getUserByUserId(userId);
    
    if(typeof user === 'undefined'){
        res.status(401).json("invalid account");
        res.end;
    }
    res.locals.userId = userId;
    next();
}

/**
 * Admin middleware, check if valid admin user jwt
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next
 */
const adminMiddleware = async(req, res, next) => {
    let token = req.headers['authorization'];
    if(typeof token === 'undefined') {
        res.status(401).json("no token");
        res.end();
    }
    token = token.substr(7, token.length);
    const userId = await encryptionSvc.getUserIdFromToken(token);
    
    const user = await userSvc.getUserByUserId(userId);
    
    if(typeof user === 'undefined' || user === null || +user.accountTypeId !== 4){
        res.status(401).json("invalid account");
        res.end;
    }
    res.locals.userId = userId;
    next();
}

/**
 * Error response
 * @param {object} res response
 * @param {string} msg message
 */
const errorResponse = function(res, msg = '') {
    if(msg === '') {
        msg = 'You said whaaaaaaa??';
    }
    return responseSvc.errorMessage(msg, 400);
    //return res.status(400).json({'code': 400, 'message': msg});
}

/**
 * Check for headers
 * @param {object} req request
 */
const headerCheck = function(req) {
    const ip = req.socket.remoteAddress;
    const user = req.header('TCH-USER');
    const message = req.header('TCH-SIGNATURE');
    let valid = false;
    const timeDiff = 90000;
    let msg = "";

    if(typeof user === 'undefined' || typeof message === 'undefined' 
    || user === "" || message === "") {
    msg = 'poorly formatted request from: '+ ip;
    }

    let token = whitelistUsers.get(user);
    if(typeof token === 'undefined' || token === "") {
    msg = 'invalid user';
    }

    if(msg === "") {
    let timestamp = Date.now();
    let decryptedTs = encryptionSvc.decryptHeader(message, token);

    valid = timestamp + timeDiff > decryptedTs && timestamp - timeDiff < decryptedTs
    ? true : false;

    msg = 'time is within the range';
    if(!valid) {
        msg = "server: '"+ timestamp +"' is not '"+ decryptedTs +"'";
    }
    }
    
    return { status: valid, message: msg, ip: ip };
};

module.exports = {
    asyncMiddleware,
    bootlegMiddleware,
    authMiddleware,
    guestMiddleware,
    userMiddleware,
    adminMiddleware,
    errorResponse,
    headerCheck
}