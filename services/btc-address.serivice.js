const config = require('../config');
const btc = require('btc-xpub-address');
const responseSvc = require('./response.service');

const getAddress = async() => {
    const xpub = config.BTC_XPUB;
    const address = await btc.default.getAddress(xpub);
    return responseSvc.successMessage(address);
}

module.exports = {
    getAddress
}