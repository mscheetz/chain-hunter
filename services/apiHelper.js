const config = require('../config');
const encryptionSvc = require('./encryption');
const whitelistUsers = new Map([
    [config.CHAINHUNTER_USER, config.CHAINHUNTER_TOKEN]]);
  
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

const errorResponse = function(res, msg = '') {
    if(msg === '') {
        msg = 'You said whaaaaaaa??';
    }
    return res.status(400).json({'code': 400, 'message': msg});
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

module.exports = {
    asyncMiddleware,
    errorResponse,
    headerCheck
}