const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const manager = require('./services/chainhunter-manager');
const encryptionSvc = require('./services/encryption.js');

const port = process.env.PORT || 3000;

const whitelistOrigins = [
'http://localhost:4200',
'http://produrl.com'];

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelistOrigins.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  //credentials: true //'http://localhost:8000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

//app.use(express.static(path.join(__dirname, 'public')));

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname + '/index.html'));
// });

app.get('/api', asyncMiddleware(async function(req, res, next){
  	res.status(200).json({'about': 'Chain Hunter\'s apis are nested under here'});
}));

app.get('/api/blockchain/empty', asyncMiddleware(async function(req, res, next){
  // if(!this.headerCheck(req)) {
  //   this.errorResponse(res);
  // } else {
    const result = await manager.getEmptyBlockchains();

  	res.status(200).json(result);
  //}
}));

app.get('/api/blockchain/:toFind', asyncMiddleware(async function(req, res, next){
  const toFind = req.params.toFind;
  // if(!this.headerCheck(req)) {
  //   this.errorResponse(res);
  // } else {
    console.log('searching for: '+ toFind);
    const result = await manager.getBlockchains(toFind);

  	res.status(200).json(result);
  //}
}));

app.get('/api/blockchain/:chain/:toFind', asyncMiddleware(async function(req, res, next){
  const chain = req.params.chain.toLowerCase();
  const toFind = req.params.toFind;
  // if(!this.headerCheck(req)) {
  //   this.errorResponse(res);
  // } else {
    const result = await manager.getBlockchain(chain, toFind);

  	res.status(200).json(result);
  //}
}));

app.get('/api/address/:chain/:address/txs', asyncMiddleware(async function(req, res, next){
  const chain = req.params.chain.toLowerCase();
  const address = req.params.address;
  // if(!this.headerCheck(req)) {
  //   this.errorResponse(res);
  // } else {
    const result = await manager.getTransactions(chain, address);

	  res.status(200).json(result);
  //}
}));

app.get('/api/address/:chain/:address/tokens', asyncMiddleware(async function(req, res, next){
  const chain = req.params.chain.toLowerCase();
  const address = req.params.address;
  // if(!this.headerCheck(req)) {
  //   this.errorResponse(res);
  // } else {
  	const result = await manager.getTokens(chain, address);

  	res.status(200).json(result);
  //}
}));

const whitelistUsers = new Map([['volitility-d', 'b59e052f-891d-45be-b316-0c22b561bb11'],['volitility-p', 'e64b33f6-54af-4303-9e6e-cc390d2add10']]);

errorResponse = function(res) {
	return res.status(400).json({'code': 400, 'message': 'You said whaaaaaa??'});
}

headerCheck = function(req) {
    let ip = req.socket.remoteAddress;
    let user = req.header('TCH-USER');
    let message = req.header('TCH-SIGNATURE');
    if(typeof user === 'undefined' || typeof message === 'undefined' 
      || user === "" || message === "") {
      console.log('poorly formatted request from: '+ ip);
      return false;
    }
    let token = whitelistUsers.get(user);
    if(typeof token === 'undefined' || token === "") {
      console.log('invalid user');
      return false;
    }
    let timestamp = Date.now();
    let decryptedTs = encryptionSvc.decryptHeader(message, token);

    let valid = timestamp + 2000 > decryptedTs && timestamp - 2000 < decryptedTs
    ? true : false;

    if(!valid) {
      console.log('unsynced request from: '+ ip);
    }

    return valid;
};

app.listen(port, () => {
  console.log('Server started on port: '+ port +'!')
});