const btc = require('btc.js');
const bch = require('bch.js');
const eth = require('eth.js');
const ltc = require('ltc.js');

const getBlockchains = async(chain, toFind) => {
    let blockchains = [];

    blockchains.push({"BTC": await btc.getBlockchain(toFind)});
    blockchains.push({"BCH": await bch.getBlockchain(toFind)});
    blockchains.push({"ETH": await eth.getBlockchain(toFind)});
    blockchains.push({"LTC": await ltc.getBlockchain(toFind)});

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
    }
}

const getTokens = async(chain, address) => {
    if(chain === "eth") {
        return await eth.getTokens(address);
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
    }
}

modules.export = {
    getBlockchains,
    getBlockchain,
    getTokens,
    getTransactions
}