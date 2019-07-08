"use strict";
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const api = require('./routes/api');

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

//app.use(forceSSL());

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelistOrigins.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

app.get('*.*', express.static(dist_dir, {maxAge: '1y'}));

app.get('/api/*', api);

app.get('/', function (req, res) {
  res.status(200).sendFile(`/`, {root: dist_dir});
});

app.set('port', port);

app.listen(port, () => {
  console.log('Server started on port: '+ port +'!')
});
