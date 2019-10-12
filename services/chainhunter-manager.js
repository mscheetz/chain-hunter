const dataSvc = require("../data/dataIntegrationService");
const db = require('../data/dataRepo');
const ada = require('./blockchains/ada.js');
const aion = require('./blockchains/aion.js');
const ae = require('./blockchains/ae.js');
const atom = require('./blockchains/atom.js');
const bch = require('./blockchains/bch.js');
const bnb = require('./blockchains/bnb.js');
const btc = require('./blockchains/btc.js');
const dash = require('./blockchains/dash.js');
const dcr = require('./blockchains/dcr.js');
const eos = require('./blockchains/eos.js');
const etc = require('./blockchains/etc.js');
const eth = require('./blockchains/eth.js');
const icx = require('./blockchains/icx.js');
const iost = require('./blockchains/iost.js');
const lsk = require('./blockchains/lsk.js');
const ltc = require('./blockchains/ltc.js');
const nano = require('./blockchains/nano.js');
const neo = require('./blockchains/neo.js');
const nebl = require('./blockchains/nebl.js');
const ont = require('./blockchains/ont.js');
const qtum = require('./blockchains/qtum.js');
const rvn = require('./blockchains/rvn.js');
const tomo = require('./blockchains/tomo.js');
const trx = require('./blockchains/trx.js');
const usdt = require('./blockchains/usdt.js');
const vet = require('./blockchains/vet.js');
const xlm = require('./blockchains/xlm.js');
const xrp = require('./blockchains/xrp.js');
const xtz = require('./blockchains/xtz.js');
const zel = require('./blockchains/zel.js');

const getChains = function() {
    const chains = [
        {
            name: 'Bitcoin',
            symbol: 'BTC',
            status: 'Active'
        },
        {
            name: 'Aeternity',
            symbol: 'AE',
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
            name: 'Bitcoin Cash',
            symbol: 'BCH',
            status: 'Active'
        },
        {
            name: 'Cardano',
            symbol: 'ADA',
            status: 'Active'
        },
        {
            name: 'Cosmos',
            symbol: 'ATOM',
            status: 'Active'
        },
        {
            name: 'Dash',
            symbol: 'DASH',
            status: 'Active'
        },
        {
            name: 'Decred',
            symbol: 'DCR',
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
            name: 'Ethereum',
            symbol: 'ETH',
            status: 'Active'
        },
        {
            name: 'Ethereum Classic',
            symbol: 'ETC',
            status: 'Active'
        },
        {
            name: 'Icon',
            symbol: 'ICX',
            status: 'Active'
        },
        {
            name: 'IOST',
            symbol: 'IOST',
            status: 'Active'
        },
        {
            name: 'IOTA',
            symbol: 'MIOTA',
            status: 'Future'
        },
        {
            name: 'Lisk',
            symbol: 'LSK',
            status: 'Active'
        },
        {
            name: 'Litecoin',
            symbol: 'LTC',
            status: 'Active'
        },
        {
            name: 'Monero',
            symbol: 'XMR',
            status: 'Future'
        },
        {
            name: 'Nano',
            symbol: 'NANO',
            status: 'Active'
        },
        {
            name: 'Neblio',
            symbol: 'NEBL',
            status: 'Active'
        },
        {
            name: 'NEM',
            symbol: 'XEM',
            status: 'Future'
        },
        {
            name: 'Neo',
            symbol: 'NEO',
            status: 'Active'
        },
        {
            name: 'Ontology',
            symbol: 'ONT',
            status: 'Active'
        },
        {
            name: 'QTUM',
            symbol: 'QTUM',
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
            name: 'Stellar Lumens',
            symbol: 'XLM',
            status: 'Active'
        },
        // {
        //     name: 'Terra',
        //     symbol: 'LUNA',
        //     status: 'Future'
        // },
        {
            name: 'Tether',
            symbol: 'USDT',
            status: 'Active'
        },
        {
            name: 'Tomo Chain',
            symbol: 'TOMO',
            status: 'Active'
        },
        {
            name: 'Tezos',
            symbol: 'XTZ',
            status: 'Active'
        },
        {
            name: 'Theta',
            symbol: 'THETA',
            status: 'Future'
        },
        {
            name: 'Tron',
            symbol: 'TRX',
            status: 'Active'
        },
        {
            name: 'VeChain',
            symbol: 'VET',
            status: 'Active'
        },
        // {
        //     name: 'V Systems',
        //     symbol: 'VSYS',
        //     status: 'Future'
        // },
        {
            name: 'Waltonchain',
            symbol: 'WTC',
            status: 'Future'
        },
        {
            name: 'Wanchain',
            symbol: 'WAN',
            status: 'Future'
        },
        {
            name: 'Waves',
            symbol: 'WAVES',
            status: 'Future'
        },
        {
            name: 'Zcash',
            symbol: 'ZEC',
            status: 'Future'
        },
        {
            name: 'ZelCash',
            symbol: 'ZEL',
            status: 'Active'
        },
        {
            name: 'Zilliqa',
            symbol: 'ZIL',
            status: 'Future'
        }
    ]

    return chains;
}

/**
 * Get active chains
 */
const getActiveChains = function() {
    const chains = getChains();

    return chains.filter(c => c.status === 'Active');
}

/**
 * Get future chains
 */
const getFutureChains = function() {
    const chains = getChains();

    return chains.filter(c => c.status === 'Future');
}

/**
 * Get an emtpy blockchain
 * 
 * @param {string} chain chain symbol
 */
const getEmptyBlockchain = async(chain) => {
    let blockchain = {};
    if(chain === 'btc') {
        blockchain = await btc.getEmptyBlockchain();
    } else if(chain === 'bch') {
        blockchain = await bch.getEmptyBlockchain();
    } else if(chain === 'etc') {
        blockchain = await etc.getEmptyBlockchain();
    } else if(chain === 'eth') {
        blockchain = await eth.getEmptyBlockchain();
    } else if(chain === 'ltc') {
        blockchain = await ltc.getEmptyBlockchain();
    } else if(chain === 'xrp') {
        blockchain = await xrp.getEmptyBlockchain();
    } else if(chain === 'neo') {
        blockchain = await neo.getEmptyBlockchain();
    } else if(chain === 'rvn') {
        blockchain = await rvn.getEmptyBlockchain();
    } else if(chain === 'bnb') {
        blockchain = await bnb.getEmptyBlockchain();
    } else if(chain === 'aion') {
        blockchain = await aion.getEmptyBlockchain();
    } else if(chain === 'eos') {
        blockchain = await eos.getEmptyBlockchain();
    } else if(chain === 'trx') {
        blockchain = await trx.getEmptyBlockchain();
    } else if(chain === 'ont') {
        blockchain = await ont.getEmptyBlockchain();
    } else if(chain === 'usddt') {
        blockchain = await usdt.getEmptyBlockchain();
    } else if(chain === 'iost') {
        blockchain = await iost.getEmptyBlockchain();
    } else if(chain === 'icx') {
        blockchain = await icx.getEmptyBlockchain();
    } else if(chain === 'nano') {
        blockchain = await nano.getEmptyBlockchain();
    } else if(chain === 'dash') {
        blockchain = await dash.getEmptyBlockchain();
    } else if(chain === 'ae') {
        blockchain = await ae.getEmptyBlockchain();
    } else if(chain === 'ada') {
        blockchain = await ada.getEmptyBlockchain();
    } else if(chain === 'zel') {
        blockchain = await zel.getEmptyBlockchain();
    } else if(chain === 'atom') {
        blockchain = await atom.getEmptyBlockchain();
    } else if(chain === 'vet') {
        blockchain = await vet.getEmptyBlockchain();
    } else if(chain === 'qtum') {
        blockchain = await qtum.getEmptyBlockchain();
    } else if(chain === 'nebl') {
        blockchain = await nebl.getEmptyBlockchain();
    } else if(chain === 'xlm') {
        blockchain = await xlm.getEmptyBlockchain();
    } else if(chain === 'xtz') {
        blockchain = await xtz.getEmptyBlockchain();
    } else if(chain === 'lsk') {
        blockchain = await lsk.getEmptyBlockchain();
    } else if(chain === 'tomo') {
        blockchain = await tomo.getEmptyBlockchain();
    }
    
    blockchain.address = null;
    blockchain.contract = null;
    blockchain.transaction = null;

    return blockchain;
}

/**
 * Get empty blockchain objects
 */
const getEmptyBlockchains = async() => {
    let blockchains = {};
    const chains = getActiveChains();

    for(var i = 0; i < chains.length; i++) {
        if(chains[i].symbol === 'BTC') {
            blockchains["BTC"] = await btc.getEmptyBlockchain();
        } else if(chains[i].symbol === 'BCH') {
            blockchains["BCH"] = await bch.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ETC') {
            blockchains["ETC"] = await etc.getEmptyBlockchain();
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
        } else if(chains[i].symbol === 'NANO') {
            blockchains["NANO"] = await nano.getEmptyBlockchain();
        } else if(chains[i].symbol === 'DASH') {
            blockchains["DASH"] = await dash.getEmptyBlockchain();
        } else if(chains[i].symbol === 'AE') {
            blockchains["AE"] = await ae.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ADA') {
            blockchains["ADA"] = await ada.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ZEL') {
            blockchains["ZEL"] = await zel.getEmptyBlockchain();
        } else if(chains[i].symbol === 'ATOM') {
            blockchains["ATOM"] = await atom.getEmptyBlockchain();
        } else if(chains[i].symbol === 'VET') {
            blockchains["VET"] = await vet.getEmptyBlockchain();
        } else if(chains[i].symbol === 'QTUM') {
            blockchains["QTUM"] = await qtum.getEmptyBlockchain();
        } else if(chains[i].symbol === 'NEBL') {
            blockchains["NEBL"] = await nebl.getEmptyBlockchain();
        } else if(chains[i].symbol === 'XLM') {
            blockchains["XLM"] = await xlm.getEmptyBlockchain();
        } else if(chains[i].symbol === 'XTZ') {
            blockchains["XTZ"] = await xtz.getEmptyBlockchain();
        } else if(chains[i].symbol === 'LSK') {
            blockchains["LSK"] = await lsk.getEmptyBlockchain();
        } else if(chains[i].symbol === 'TOMO') {
            blockchains["TOMO"] = await tomo.getEmptyBlockchain();
        // } else if(chains[i].symbol === 'DCR') {
        //     blockchains["DCR"] = await dcr.getEmptyBlockchain();
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
        } else if(chains[i].symbol === 'ETC') {
            blockchains["ETC"] = await etc.getBlockchain(toFind);
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
        } else if(chains[i].symbol === 'NANO') {
            blockchains["NANO"] = await nano.getBlockchain(toFind);
        } else if(chains[i].symbol === 'DASH') {
            blockchains["DASH"] = await dash.getBlockchain(toFind);
        } else if(chains[i].symbol === 'AE') {
            blockchains["AE"] = await ae.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ADA') {
            blockchains["ADA"] = await ada.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ZEL') {
            blockchains["ZEL"] = await zel.getBlockchain(toFind);
        } else if(chains[i].symbol === 'ATOM') {
            blockchains["ATOM"] = await atom.getBlockchain(toFind);
        } else if(chains[i].symbol === 'VET') {
            blockchains["VET"] = await vet.getBlockchain(toFind);
        } else if(chains[i].symbol === 'QTUM') {
            blockchains["QTUM"] = await qtum.getBlockchain(toFind);
        } else if(chains[i].symbol === 'NEBL') {
            blockchains["NEBL"] = await nebl.getBlockchain(toFind);
        } else if(chains[i].symbol === 'XLM') {
            blockchains["XLM"] = await xlm.getBlockchain(toFind);
        } else if(chains[i].symbol === 'XTZ') {
            blockchains["XTZ"] = await xtz.getBlockchain(toFind);
        } else if(chains[i].symbol === 'LSK') {
            blockchains["LSK"] = await lsk.getBlockchain(toFind);
        } else if(chains[i].symbol === 'TOMO') {
            blockchains["TOMO"] = await tomo.getBlockchain(toFind);
        // } else if(chains[i].symbol === 'DCR') {
        //     blockchains["DCR"] = await dcr.getBlockchain(toFind);
        }
    }

    return blockchains;
}

/**
 * Get Blockchain info
 * 
 * @param {string} chain chain symbol to hunt
 * @param {string} toFind string to find
 * @param {string} ip requestor's ip address
 * @param {object} ipInfo requestor's ip info
 */
const getBlockchain = async(chain, toFind, ip, ipInfo) => {
    let result;
    if(chain === "btc") {
        result = await btc.getBlockchain(toFind);
    } else if (chain === "bch") {
        result = await bch.getBlockchain(toFind);
    } else if (chain === "etc") {
        result = await etc.getBlockchain(toFind);
    } else if (chain === "eth") {
        result = await eth.getBlockchain(toFind);
    } else if (chain === "ltc") {
        result = await ltc.getBlockchain(toFind);
    } else if (chain === "xrp") {
        result = await xrp.getBlockchain(toFind);
    } else if (chain === "neo") {
        result = await neo.getBlockchain(toFind);
    } else if (chain === "rvn") {
        result = await rvn.getBlockchain(toFind);
    } else if (chain === "bnb") {
        result = await bnb.getBlockchain(toFind);
    } else if (chain === "aion") {
        result = await aion.getBlockchain(toFind);
    // } else if (chain === "eos") {
    //     return await eos.getBlockchain(toFind);
    } else if (chain === "trx") {
        result = await trx.getBlockchain(toFind);
    } else if (chain === "ont") {
        result = await ont.getBlockchain(toFind);
    } else if (chain === "usdt") {
        result = await usdt.getBlockchain(toFind);
    } else if (chain === "iost") {
        result = await iost.getBlockchain(toFind);
    } else if (chain === "icx") {
        result = await icx.getBlockchain(toFind);
    } else if (chain === "nano") {
        result = await nano.getBlockchain(toFind);
    } else if (chain === "dash") {
        result = await dash.getBlockchain(toFind);
    } else if (chain === "ae") {
        result = await ae.getBlockchain(toFind);
    } else if (chain === "ada") {
        result = await ada.getBlockchain(toFind);
    } else if (chain === "zel") {
        result = await zel.getBlockchain(toFind);
    } else if (chain === "atom") {
        result = await atom.getBlockchain(toFind);
    } else if (chain === "vet") {
        result = await vet.getBlockchain(toFind);
    } else if (chain === "qtum") {
        result = await qtum.getBlockchain(toFind);
    } else if (chain === "nebl") {
        result = await nebl.getBlockchain(toFind);
    } else if (chain === "xlm") {
        result = await xlm.getBlockchain(toFind);
    } else if (chain === "xtz") {
        result = await xtz.getBlockchain(toFind);
    } else if (chain === "lsk") {
        result = await lsk.getBlockchain(toFind);
    } else if (chain === "tomo") {
        result = await tomo.getBlockchain(toFind);
    // } else if (chain === "dcr") {
    //     return await dcr.getBlockchain(toFind);
    }

    if (result.address || result.contract || result.transaction) {
        let updateType = "";
        if (result.address) {
          updateType = "address";
        } else if (result.contract) {
          updateType = "contract";
        } else if (result.transaction) {
          updateType = "transaction";
        }

        await dataSvc.updateSearchResult(
          ip,
          ipInfo,
          chain,
          updateType
        );
    }

    return result;
}

/**
 * Get tokens for an address
 * 
 * @param {string} chain chain symbol to hunt
 * @param {string} address address to search
 * @param {string} ip requestor's ip address
 * @param {object} ipInfo requestor's ip info
 */
const getTokens = async(chain, address, ip, ipInfo) => {
    let tokens = [];
    if(chain === "eth") {
        tokens = await eth.getTokens(address);
    } else if (chain === "aion") {
        tokens = await aion.getTokens(address);
    } else if (chain === "etc") {
        tokens = await etc.getTokens(address);
    } else if (chain === "trx") {
        tokens = await trx.getTokens(address);
    } else if (chain === "vet") {
        tokens = await vet.getTokens(address);
    } else if (chain === "qtum") {
        tokens = await qtum.getTokens(address);
    } else if (chain === "ont") {
        tokens = await ont.getTokens(address);
    } else if (chain === "iost") {
        tokens = await iost.getTokens(address);
    } else if (chain === "tomo") {
        tokens = await tomo.getTokens(address);
    }

    await dataSvc.updateSearchResult(
      ip,
      ipInfo,
      chain,
      "addressTokens"
    );

    return tokens;
}

/**
 * Get transactions for an address
 * 
 * @param {string} chain chain symbol to hunt
 * @param {string} address address to search
 * @param {string} ip requestor's ip address
 * @param {object} ipInfo requestor's ip info
 */
const getTransactions = async(chain, address, ip, ipInfo) => {
    let transactions = [];
    if(chain === "btc") {
        transactions = await btc.getTransactions(address);
    } else if (chain === "bch") {
        transactions = await bch.getTransactions(address);
    } else if (chain === "etc") {
        transactions = await etc.getTransactions(address);
    } else if (chain === "eth") {
        transactions = await eth.getTransactions(address);
    } else if (chain === "ltc") {
        transactions = await ltc.getTransactions(address);
    } else if (chain === "xrp") {
        transactions = await xrp.getTransactions(address);
    } else if (chain === "neo") {
        transactions = await neo.getTransactions(address);
    } else if (chain === "rvn") {
        transactions = await rvn.getTransactions(address);
    } else if (chain === "bnb") {
        transactions = await bnb.getTransactions(address);
    } else if (chain === "aion") {
        transactions = await aion.getTransactions(address);
    // } else if (chain === "eos") {
    //     return await eos.getTransactions(address);
    } else if (chain === "trx") {
        transactions = await trx.getTransactions(address);
    } else if (chain === "ont") {
        transactions = await ont.getTransactions(address);
    } else if (chain === "usdt") {
        transactions = await usdt.getTransactions(address);
    } else if (chain === "iost") {
        transactions = await iost.getTransactions(address);
    } else if (chain === "icx") {
        transactions = await icx.getTransactions(address);
    } else if (chain === "nano") {
        transactions = await nano.getTransactions(address);
    } else if (chain === "dash") {
        transactions = await dash.getTransactions(address);
    } else if (chain === "ae") {
        transactions = await ae.getTransactions(address);
    } else if (chain === "zel") {
        transactions = await zel.getTransactions(address);
    } else if (chain === "atom") {
        transactions = await atom.getTransactions(address);
    } else if (chain === "vet") {
        transactions = await vet.getTransactions(address);
    } else if (chain === "qtum") {
        transactions = await qtum.getTransactions(address);
    } else if (chain === "nebl") {
        transactions = await nebl.getTransactions(address);
    } else if (chain === "xlm") {
        transactions = await xlm.getTransactions(address);
    } else if (chain === "xtz") {
        transactions = await xtz.getTransactions(address);
    } else if (chain === "lsk") {
        transactions = await lsk.getTransactions(address);
    } else if (chain === "tomo") {
        transactions = await tomo.getTransactions(address);
    // } else if (chain === "dcr") {
    //     return await dcr.getTransactions(address);
    }

    await dataSvc.updateSearchResult(
      ip,
      ipInfo,
      chain,
      "addressTransactions"
    );

    return transactions;
}

/**
 * Log an empty search
 * 
 * @param {string} ip requestor's ip address
 * @param {object} ipInfo requestor's ip info
 */
const emptySearch = async(ip, ipInfo) => {
    await dataSvc.updateSearchResult(
        headerMsg.ip,
        req.ipInfo,
        "none",
        "empty"
      );
}

module.exports = {
    getChains,
    getActiveChains,
    getFutureChains,
    getEmptyBlockchain,
    getEmptyBlockchains,
    getBlockchains,
    getBlockchain,
    getTokens,
    getTransactions,
    emptySearch
}