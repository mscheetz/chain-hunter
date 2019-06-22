const btc = require('./btc.js');
const bch = require('./bch.js');
const eth = require('./eth.js');
const ltc = require('./ltc.js');
const neo = require('./neo.js');
const xrp = require('./xrp.js');
const rvn = require('./rvn.js');
const bnb = require('./bnb.js');
const aion = require('./aion.js');
const eos = require('./eos.js');
const trx = require('./trx.js');

const getEmptyBlockchains = async() => {
    let blockchains = {};

    blockchains["BTC"] = await btc.getEmptyBlockchain();
    blockchains["BCH"] = await bch.getEmptyBlockchain();
    blockchains["ETH"] = await eth.getEmptyBlockchain();
    blockchains["LTC"] = await ltc.getEmptyBlockchain();
    blockchains["XRP"] = await xrp.getEmptyBlockchain();
    blockchains["NEO"] = await neo.getEmptyBlockchain();
    blockchains["RVN"] = await rvn.getEmptyBlockchain();
    blockchains["BNB"] = await bnb.getEmptyBlockchain();
    blockchains["AION"] = await aion.getEmptyBlockchain();
    blockchains["EOS"] = await eos.getEmptyBlockchain();
    blockchains["TRX"] = await trx.getEmptyBlockchain();

    return blockchains;
}

const getBlockchains = async(toFind) => {
    let blockchains = [];

    blockchains["BTC"] = await btc.getBlockchain(toFind);
    blockchains["BCH"] = await bch.getBlockchain(toFind);
    blockchains["ETH"] = await eth.getBlockchain(toFind);
    blockchains["LTC"] = await ltc.getBlockchain(toFind);
    blockchains["XRP"] = await xrp.getBlockchain(toFind);
    blockchains["NEO"] = await neo.getBlockchain(toFind);
    blockchains["RVN"] = await rvn.getBlockchain(toFind);
    blockchains["BNB"] = await bnb.getBlockchain(toFind);
    blockchains["AION"] = await aion.getBlockchain(toFind);
    blockchains["EOS"] = await eos.getBlockchain(toFind);
    blockchains["TRX"] = await trx.getBlockchain(toFind);

    return blockchains;
}

const getBlockchain = async(chain, toFind) => {
    if(chain === "btc") {
        return await btc.getBlockchain(toFind);
    } else if (chain === "bch") {
        return await bch.getBlockchain(toFind);
    } else if (chain === "eth") {
        return await eth.getBlockchain(toFind);
    } else if (chain === "ltc") {
        return await ltc.getBlockchain(toFind);
    } else if (chain === "xrp") {
        return await xrp.getBlockchain(toFind);
    } else if (chain === "neo") {
        return await neo.getBlockchain(toFind);
    } else if (chain === "rvn") {
        return await rvn.getBlockchain(toFind);
    } else if (chain === "bnb") {
        return await bnb.getBlockchain(toFind);
    } else if (chain === "aion") {
        return await aion.getBlockchain(toFind);
    } else if (chain === "eos") {
        return await eos.getBlockchain(toFind);
    } else if (chain === "trx") {
        return await trx.getBlockchain(toFind);
    }
}

const getTokens = async(chain, address) => {
    if(chain === "eth") {
        return await eth.getTokens(address);
    } else if (chain === "aion") {
        return await aion.getTokens(address);
    } else if (chain === "trx") {
        return await trx.getTokens(address);
    }
}

const getTransactions = async(chain, address) => {
    if(chain === "btc") {
        return await btc.getTransactions(address);
    } else if (chain === "bch") {
        return await bch.getTransactions(address);
    } else if (chain === "eth") {
        return await eth.getTransactions(address);
    } else if (chain === "ltc") {
        return await ltc.getTransactions(address);
    } else if (chain === "xrp") {
        return await xrp.getTransactions(address);
    } else if (chain === "neo") {
        return await neo.getTransactions(address);
    } else if (chain === "rvn") {
        return await rvn.getTransactions(address);
    } else if (chain === "bnb") {
        return await bnb.getTransactions(address);
    } else if (chain === "aion") {
        return await aion.getTransactions(address);
    } else if (chain === "eos") {
        return await eos.getTransactions(address);
    } else if (chain === "trx") {
        return await trx.getTransactions(address);
    }
}

module.exports = {
    getEmptyBlockchains,
    getBlockchains,
    getBlockchain,
    getTokens,
    getTransactions
}