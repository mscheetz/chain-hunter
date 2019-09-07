const express = require('express');
const router = express.Router();
const manager = require('../services/chainhunter-manager');
const encryptionSvc = require('../services/encryption.js');
const path = require('path');
const config = require('../config');
const db = require('../services/dataRepo');
const helperSvc = require('../services/helperService');

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

    if(result.address || result.contract || result.transaction) {
      if(result.address) {
        await updateSearchResult(req.ipInfo, chain, "address");
      } else if(result.contract) {
        await updateSearchResult(req.ipInfo, chain, "contract");
      } else if(result.transaction) {
        await updateSearchResult(req.ipInfo, chain, "transaction");
      }
    }

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

    await updateSearchResult(req.ipInfo, chain, "addressTransactions");

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

    await updateSearchResult(req.ipInfo, chain, "addressTokens");

  	res.status(200).json(result);
  }
}));

/**
 * Update search results table in database
 * @param {*} ipInfo ip information
 * @param {*} chain chain with results
 * @param {*} type type of results
 */
const updateSearchResult = async(ipInfo, chain, type) => {

  let searchResult = {
    country: ipInfo.country, 
    region: ipInfo.region, 
    city: ipInfo.city, 
    metro: ipInfo.metro,
    timezone: ipInfo.timezone, 
    chain: chain,
    searchAt: helperSvc.getUnixTS(),
    searchType: type
  };
  await db.postSearchResult(searchResult);

}

// router.get('/api/users', asyncMiddleware(async (req, res, next) => {

//   const users = await db.getUsers();
//   if(typeof users === 'undefined' || users.length === 0) {
//     res.status(500).json([]);
//   }
//   res.status(200).json(users);
// }))

// router.get('/api/users/email/:email', asyncMiddleware(async (req, res, next) => {
//   const email = req.params.email;
  
//   const user = await db.getUserByEmail(email);
//   if(typeof user === 'undefined') {
//     res.status(500).json({});
//   }
//   res.status(200).json(user);
// }))

const whitelistUsers = new Map([
  [config.CHAINHUNTER_USER, config.CHAINHUNTER_TOKEN]]);

errorResponse = function(res, msg = '') {
  if(msg === '') {
    msg = 'You said whaaaaaaa??';
  }
	return res.status(400).json({'code': 400, 'message': msg});
}

headerCheck = function(req) {
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


module.exports = router;
