const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const api = require('./routes/api');

const port = process.env.PORT || 3000;

const whitelistOrigins = [
'http://localhost:4200',
'http://produrl.com'];

var corsOptions = {
  origin: function(origin, callback) {
  	let isWhitelisted = whitelistOrigins.indexOf(origin) !== -1;
  	callback(null, isWhitelisted);
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());

app.use('/', api);

app.set('port', port);

app.listen(port, () => {
  console.log('Server started on port: '+ port +'!')
});