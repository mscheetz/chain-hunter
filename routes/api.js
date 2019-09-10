const express = require('express');
const router = express.Router();
const manager = require('../services/chainhunter-manager');
const encryptionSvc = require('../services/encryption.js');
const config = require('../config');
const dataSvc = require('../services/dataIntegrationService');

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
      let updateType = "";
      if(result.address) {
        updateType = "address";
      } else if(result.contract) {
        updateType = "contract";
      } else if(result.transaction) {
        updateType = "transaction";
      }

      await dataSvc.updateSearchResult(headerMsg.ip, req.ipInfo, chain, updateType);      
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

    await dataSvc.updateSearchResult(headerMsg.ip, req.ipInfo, chain, "addressTransactions");

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

    await dataSvc.updateSearchResult(headerMsg.ip, req.ipInfo, chain, "addressTokens");

    res.status(200).json(result);
  }
}));

router.get('/api/results/country', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const results = await dataSvc.getResultsByCountry();

    res.status(200).json(results);
  }
}));

router.get('/api/results/country/:country/region', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const country = req.params.country;
    const results = await dataSvc.getResultsByRegion(country);

    res.status(200).json(results);
  }
}));

router.get('/api/results/country/:country/region/:region/city', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const country = req.params.country;
    const region = req.params.region;
    const results = await dataSvc.getResultsByCity(country, region);

    res.status(200).json(results);
  }
}));

router.get('/api/results/region', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const results = await dataSvc.getResultsByRegion();

    res.status(200).json(results);
  }
}));

router.get('/api/results/city', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const results = await dataSvc.getResultsByCity();

    res.status(200).json(results);
  }
}));

router.get('/api/results/timezone', asyncMiddleware(async (req, res, next) => {
  const headerMsg = headerCheck(req);
  if(!headerMsg.status) {
    errorResponse(res);
  } else {
    const results = await dataSvc.getResultsByTimezone();

    res.status(200).json(results);
  }
}));

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
