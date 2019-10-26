const config = require('../config');
const encryptionSvc = require('./encryption');
const userSvc = require('./userService');
const responseSvc = require('./responseService');
const whitelistUsers = new Map([
    [config.CHAINHUNTER_USER, config.CHAINHUNTER_TOKEN]]);
  
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

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

const authMiddleware = async(req, res, next) => {
    let token = req.headers['authorization'];
    if(typeof token === 'undefined') {
        token= req.headers['x-access-token'];
    }
    if(typeof token === 'undefined') {
        res.status(401).json("no token");
        res.end();
    }
    const tokenValid = await encryptionSvc.isTokenValid(token);
    if(!tokenValid){
        res.status(401).json("invalid token");
        res.end;
    } else {
        next();
    }
}

const guestMiddleware = async(req, res, next) => {
    const token = req.header('authorization');
    const guestId = await encryptionSvc.getUserIdFromToken(token);
    const validUuid = await encryptionSvc.validUuid(guestId);
    if(!validUuid){
        res.status(401).json("invalid token payload");
        res.end;
    }
    next();
}

const userMiddleware = async(req, res, next) => {
    const token = req.header('authorization');
    const userId = await encryptionSvc.getUserIdFromToken(token);
    const user = await userSvc.getUserByUserId(userId);
    if(typeof user === 'undefined'){
        res.status(401).json("invalid account");
        res.end;
    }
    res.locals.userId = userId;
    next();
}

const errorResponse = function(res, msg = '') {
    if(msg === '') {
        msg = 'You said whaaaaaaa??';
    }
    return responseSvc.errorMessage(msg, 400);
    //return res.status(400).json({'code': 400, 'message': msg});
}

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

// /**
//  * Return a success message
//  * 
//  * @param {any} data data to return
//  * @param {number} code status code, 200
//  */
// const successMessage = function(data, code = 200) {
//     const response = {
//         code: code,
//         data: data
//     }

//     return response;
// }

// /**
//  * Return an error message
//  * 
//  * @param {any} data data to return
//  * @param {number} code status code, 401
//  */
// const errorMessage = function(data, code = 401) {
//     const response = {
//         code: code,
//         data: data
//     }

//     return response;
// }

module.exports = {
    asyncMiddleware,
    bootlegMiddleware,
    authMiddleware,
    guestMiddleware,
    userMiddleware,
    errorResponse,
    headerCheck,
    // successMessage,
    // errorMessage
}