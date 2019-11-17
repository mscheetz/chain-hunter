const SquareConnect = require('square-connect');
const config = require('../config');

const squareClient = SquareConnect.ApiClient.instance;
const oauth2 = squareClient.authentications['oauth2'];
oauth2.accessToken = config.SQUARE_TOKEN;

squareClient.basePath = config.ENV === 'DEV' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';

const processPayment = async() => {

}

module.exports = {
    processPayment
}