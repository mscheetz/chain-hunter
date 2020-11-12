"use strict";
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const expressip = require('express-ip');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const adminApi = require('./routes/admin.api');
const blockchainApi = require('./routes/blockchain.api');
const btcApi = require('./routes/btc.api');
const paymentApi = require('./routes/payment.api');
const resultsApi = require('./routes/search.api');
const userApi = require('./routes/user.api');
const config = require('./config');

const port = process.env.PORT || 3000;
const dist_dir = 'dist/chain-hunter';

const whitelistOrigins = [
'http://localhost:4200',
'http://produrl.com'];

const forceSSL = function() {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(
       ['https://', req.get('Host'), req.url].join('')
      );
    }
    next();
  }
}

if(config.ENV !== 'DEV'){
  app.use(forceSSL());
}

app.use(expressip().getIpInfoMiddleware);

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelistOrigins.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(compression());
app.use(helmet());
app.use(cookieParser());

app.get('*.*', express.static(dist_dir, {maxAge: '1y'}));

const unlimitedCookie = 'tch-cookie-unlimited';
const inviteCode = config.INVITE_CODE;

app.get('/invite/:code', function(req, res) {
  const code = req.params.code;
  if(code === inviteCode) {
    res.cookie(unlimitedCookie, 'You are a god!');
  } else {
    res.clearCookie(unlimitedCookie);
  }

  redirectHome(req, res);
});

const redirectHome = async(req, res) => {
  let baseUrl = req.protocol + "://" + req.get('host');
  
  res.redirect(baseUrl);
};

app.all('/api/admin*', adminApi);
app.all('/api/blockchain*', blockchainApi);
app.all('/api/btc*', btcApi);
app.all('/api/payment*', paymentApi);
app.all('/api/results*', resultsApi);
app.all('/api/user*', userApi);

app.get('/', function (req, res) {
  res.status(200).sendFile(`/`, {root: dist_dir});
});

app.all('*', function(req, res) {
  res.status(200).sendFile(`/`, {root: dist_dir});
})

app.set('port', port);

app.listen(port, () => {
  console.log('Server started on port: '+ port +'!')
});
