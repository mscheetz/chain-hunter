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
const ont = require('./ont.js');
const usdt = require('./usdt.js');
const iost = require('./iost.js');
const icx = require('./icx.js');

const getChains = function() {
    const chains = [
        {
            name: 'Bitcoin',
            symbol: 'BTC',
            status: 'Active'
        },
        {
            name: 'Bitcoin Cash',
            symbol: 'BCH',
            status: 'Active'
        },
        {
            name: 'Ethereum',
            symbol: 'ETH',
            status: 'Active'
        },
        {
            name: 'Litecoin',
            symbol: 'LTC',
            status: 'Active'
        },
        {
            name: 'Neo',
            symbol: 'NEO',
            status: 'Active'
        },
        {
            name: 'Raven Coin',
            symbol: 'RVN',
            status: 'Active'
        },
        {
            name: 'Ripple',
            symbol: 'XRP',
            status: 'Active'
        },
        {
            name: 'Tron',
            symbol: 'TRX',
            status: 'Active'
        },
        {
            name: 'AION',
            symbol: 'AION',
            status: 'Active'
        },
        {
            name: 'Binance Coin',
            symbol: 'BNB',
            status: 'Active'
        },
        {
            name: 'Cosmos',
            symbol: 'ATOM',
            status: 'Future'
        },
        {
            name: 'Cardano',
            symbol: 'ADA',
            status: 'Future'
        },
        {
            name: 'Dash',
            symbol: 'DASH',
            status: 'Future'
        },
        {
            name: 'Dogecoin',
            symbol: 'DOGE',
            status: 'Future'
        },
        {
            name: 'EOSIO',
            symbol: 'EOS',
            status: 'Future'
        },
        {
            name: 'Ethereum Classic',
            symbol: 'ETC',
            status: 'Future'
        },
        {
            name: 'Icon',
            symbol: 'ICX',
            status: 'Future'
        },
        {
            name: 'IOST',
            symbol: 'IOST',
            status: 'Future'
        },
        {
            name: 'IOTA',
            symbol: 'MIOTA',
            status: 'Future'
        },
        {
            name: 'Lisk',
            symbol: 'LSK',
            status: 'Future'
        },
        {
            name: 'Monero',
            symbol: 'XMR',
            status: 'Future'
        },
        {
            name: 'Nano',
            symbol: 'NANO',
            status: 'Future'
        },
        {
            name: 'NEM',
            symbol: 'XEM',
            status: 'Future'
        },
        {
            name: 'Ontology',
            symbol: 'ONT',
            status: 'Future'
        },
        {
            name: 'QTUM',
            symbol: 'QTUM',
            status: 'Future'
        },
        {
            name: 'Stellar Lumens',
            symbol: 'XLM',
            status: 'Future'
        },
        {
            name: 'Tether',
            symbol: 'USDT',
            status: 'Future'
        },
        {
            name: 'Tezos',
            symbol: 'XTZ',
            status: 'Future'
        },
        {
            name: 'VeChain',
            symbol: 'VET',
            status: 'Future'
        },
        {
            name: 'Wanchain',
            symbol: 'WAN',
            status: 'Future'
        },
        {
            name: 'Zcash',
            symbol: 'ZEC',
            status: 'Future'
        },
        {
            name: 'Zilliqa',
            symbol: 'ZIL',
            status: 'Future'
        }
    ]

    return chains;
}

const getActiveChains = function() {
    const chains = getChains();

    return chains.filter(c => c.status === 'Active');
}

const getFutureChains = function() {
    const chains = getChains();

    return chains.filter(c => c.status === 'Future');
}

const getEmptyBlockchains = async() => {
    let blockchains = {};
    const chains = getActiveChains();

    for(var i = 0; i < chains.length; i++) {
        if(chains[i].symbol === 'BTC') {
            blockchains["BTC"] = await btc.getEmptyBlockchain();
        } else if(chains[i].symbol === 'BCH') {
            blockchains["BCH"] = await bch.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ETH') {
            blockchains["ETH"] = await eth.getEmptyBlockchain();
        } else if(chains[i].symbol === 'LTC') {
           blockchains["LTC"] = await ltc.getEmptyBlockchain();
        } else if(chains[i].symbol === 'XRP') {
            blockchains["XRP"] = await xrp.getEmptyBlockchain();
        } else if(chains[i].symbol === 'NEO') {
            blockchains["NEO"] = await neo.getEmptyBlockchain();
        } else if(chains[i].symbol === 'RVN') {
            blockchains["RVN"] = await rvn.getEmptyBlockchain();
        } else if(chains[i].symbol === 'BNB') {
            blockchains["BNB"] = await bnb.getEmptyBlockchain();
        } else if(chains[i].symbol === 'AION') {
            blockchains["AION"] = await aion.getEmptyBlockchain();
        } else if(chains[i].symbol === 'EOS') {
            blockchains["EOS"] = await eos.getEmptyBlockchain();
        } else if(chains[i].symbol === 'TRX') {
            blockchains["TRX"] = await trx.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ONT') {
            blockchains["ONT"] = await ont.getEmptyBlockchain();
        } else if(chains[i].symbol === 'USDT') {
            blockchains["USDT"] = await usdt.getEmptyBlockchain();
        } else if(chains[i].symbol === 'IOST') {
            blockchains["IOST"] = await iost.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ICX') {
            blockchains["ICX"] = await icx.getEmptyBlockchain();
        }
    }
    return blockchains;
}

const getBlockchains = async(toFind) => {
    let blockchains = [];
    const chains = getActiveChains();

    for(var i = 0; i < chains.length; i++) {
        if(chains[i].symbol === 'BTC') {
            blockchains["BTC"] = await btc.getBlockchain(toFind);
        } else if(chains[i].symbol === 'BCH') {
            blockchains["BCH"] = await bch.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ETH') {
            blockchains["ETH"] = await eth.getBlockchain(toFind);
        } else if(chains[i].symbol === 'LTC') {
           blockchains["LTC"] = await ltc.getBlockchain(toFind);
        } else if(chains[i].symbol === 'XRP') {
            blockchains["XRP"] = await xrp.getBlockchain(toFind);
        } else if(chains[i].symbol === 'NEO') {
            blockchains["NEO"] = await neo.getBlockchain(toFind);
        } else if(chains[i].symbol === 'RVN') {
            blockchains["RVN"] = await rvn.getBlockchain(toFind);
        } else if(chains[i].symbol === 'BNB') {
            blockchains["BNB"] = await bnb.getBlockchain(toFind);
        } else if(chains[i].symbol === 'AION') {
            blockchains["AION"] = await aion.getBlockchain(toFind);
        } else if(chains[i].symbol === 'EOS') {
            blockchains["EOS"] = await eos.getBlockchain(toFind);
        } else if(chains[i].symbol === 'TRX') {
            blockchains["TRX"] = await trx.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ONT') {
            blockchains["ONT"] = await ont.getBlockchain(toFind);
        } else if(chains[i].symbol === 'USDT') {
            blockchains["USDT"] = await usdt.getBlockchain(toFind);
        } else if(chains[i].symbol === 'IOST') {
            blockchains["IOST"] = await iost.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ICX') {
            blockchains["ICX"] = await icx.getBlockchain(toFind);
        }
    }

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
    // } else if (chain === "eos") {
    //     return await eos.getBlockchain(toFind);
    } else if (chain === "trx") {
        return await trx.getBlockchain(toFind);
    } else if (chain === "ont") {
        return await ont.getBlockchain(toFind);
    } else if (chain === "usdt") {
        return await usdt.getBlockchain(toFind);
    } else if (chain === "iost") {
        return await iost.getBlockchain(toFind);
    } else if (chain === "icx") {
        return await icx.getBlockchain(toFind);
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
    // } else if (chain === "eos") {
    //     return await eos.getTransactions(address);
    } else if (chain === "trx") {
        return await trx.getTransactions(address);
    } else if (chain === "ont") {
        return await ont.getTransactions(address);
    } else if (chain === "usdt") {
        return await usdt.getTransactions(address);
    } else if (chain === "iost") {
        return await iost.getTransactions(address);
    } else if (chain === "icx") {
        return await icx.getTransactions(address);
    }
}

module.exports = {
    getChains,
    getActiveChains,
    getFutureChains,
    getEmptyBlockchains,
    getBlockchains,
    getBlockchain,
    getTokens,
    getTransactions
}