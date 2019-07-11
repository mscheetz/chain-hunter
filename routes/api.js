const express = require('express');
const router = express.Router();
const manager = require('../services/chainhunter-manager');
const encryptionSvc = require('../services/encryption.js');
const path = require('path');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

router.get('/api', async (req, res, next) => {
  	res.status(200).json({'about': 'Chain Hunter\'s apis are nested under here'});
});

router.get('/api/blockchain/active', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
     errorResponse(res, headerMsg.message);
   } else {
    const result = await manager.getActiveChains();

  	res.status(200).json(result);
  }
}));

router.get('/api/blockchain/future', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const result = await manager.getFutureChains();

  	res.status(200).json(result);
  }
}));

router.get('/api/blockchain/empty', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const result = await manager.getEmptyBlockchains();

  	res.status(200).json(result);
  }
}));

router.get('/api/blockchain/:toFind', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const toFind = req.params.toFind;
    const result = await manager.getBlockchains(toFind);

  	res.status(200).json(result);
  }
}));

router.get('/api/blockchain/:chain/:toFind', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const chain = req.params.chain.toLowerCase();
    const toFind = req.params.toFind;
    const result = await manager.getBlockchain(chain, toFind);

  	res.status(200).json(result);
  }
}));

router.get('/api/address/:chain/:address/txs', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const result = await manager.getTransactions(chain, address);

	  res.status(200).json(result);
  }
}));

router.get('/api/address/:chain/:address/tokens', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
  	const chain = req.params.chain.toLowerCase();
    const address = req.params.address;
    const result = await manager.getTokens(chain, address);

  	res.status(200).json(result);
  }
}));

const whitelistUsers = new Map([
  ['chainhunter-d', 'e2f755b9-3115-4478-947a-69324c03b4c6'],
  ['chainhunter-p', '4e5896c2-6481-41a5-8fa2-d6cc2f3808a8']]);

errorResponse = function(res, msg = '') {
  if(msg === '') {
    msg = 'You said whaaaaaaa??';
  }
	return res.status(400).json({'code': 400, 'message': msg});
}

headerCheck = function(req) {
    let ip = req.socket.remoteAddress;
    let user = req.header('TCH-USER');
    let message = req.header('TCH-SIGNATURE');
    let valid = false;
    const timeDiff = 30000;
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
    return { status: valid, message: msg };
};


module.exports = router;
