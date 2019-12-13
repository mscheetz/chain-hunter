const dataSvc = require("./search-result.service");
const blockchainRepo = require('../data/blockchain.repo');
const encryptionSvc = require('./encryption.service');
const _ = require('lodash');
const enums = require('../classes/enums');
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
const zen = require('./blockchains/zen.js');
const zil = require('./blockchains/zil.js');
const vsys = require('./blockchains/vsys.js');

const getChains = function() {
    const chains = [
        // {
        //     name: 'Terra',
        //     symbol: 'LUNA',
        //     status: 'Future'
        // },
        // {
        //     name: 'V Systems',
        //     symbol: 'VSYS',
        //     status: 'Future'
        // },
    ]

    return chains;
}

// const getActiveChainsII = async() => {
//     const chains = getChains().filter(c => c.status === 'Future');
//     const existingChains = await db.getBlockchains();
//     let bcs = [];

//     for(let i = 0; i < chains.length; i++) {
//         let bc = await getEmptyBlockchain(chains[i].symbol.toLowerCase());

//         if(typeof bc.name !== 'undefined') {
//             const inDb = existingChains.filter(e => e.symbol === bc.symbol).length > 0 ? true : false;

//             if(!inDb) {
//                 bc.status = chains[i].status === 'Active' ? 1 : 0;
//                 bc.id = encryptionSvc.getUuid();
//                 delete bc.address;
//                 delete bc.contract;
//                 delete bc.transaction;
//                 delete bc.icon;
//                 console.log('bc', bc);

//                 const status = await db.postBlockchain(bc);
                
//                 bcs.push(bc);
//             }
//         } else {            
//             const inDb = existingChains.filter(e => e.symbol === chains[i].symbol).length > 0 ? true : false;

//             if(!inDb) {
//                 let bc = chains[i];                
//                 bc.status = chains[i].status === 'Active' ? 1 : 0;
//                 bc.id = encryptionSvc.getUuid();
//                 bc.hasTokens = false;
//                 bc.hasContracts = false;
//                 delete bc.address;
//                 delete bc.contract;
//                 delete bc.transaction;
//                 delete bc.icon;
//                 console.log('bc to add', bc);

//                 const status = await db.postBlockchain(bc);
                
//                 bcs.push(bc);
//             }
//         }
//     }

//     return bcs;
// }

/**
 * Get active chains
 */
const getActiveChains = async() => {    
    let chains = await blockchainRepo.getActive();

    return chains;
}

/**
 * Get future chains
 */
const getFutureChains = async() => {
    const chains = await blockchainRepo.getFuture();

    return _.orderBy(chains, "symbol");
}

/**
 * Get an emtpy blockchain
 * 
 * @param {string} symbol chain symbol
 */
const getEmptyBlockchain = async(symbol) => {
    let chain = await blockchainRepo.get(symbol);
        
    chain.address = null;
    chain.contract = null;
    chain.transaction = null;

    return chain;
}

/**
 * Get empty blockchain objects
 */
const getEmptyBlockchains = async() => {
    const activeChains = await getActiveChains();

    return _.orderBy(activeChains, [function(c) { return c.symbol === "BTC" ? 0 : 1; }, function(c) { return c.name.toLowerCase(); }]);
}

/**
 * Search blockchains
 * 
 * @param {string} toFind string to search
 */
const getBlockchains = async(toFind) => {
    let blockchains = [];
    const chains = await getActiveChains();

    for(var i = 0; i < chains.length; i++) {
        let blockchain = chains.find(c => c.symbol === chains[i].symbol);
        blockchain.icon = "white/"+ blockchain.symbol.toLowerCase()  +".png";
        if(chains[i].symbol === 'BTC') {
            blockchains["BTC"] = await btc.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'BCH') {
            blockchains["BCH"] = await bch.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ETC') {
            blockchains["ETC"] = await etc.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ETH') {
            blockchains["ETH"] = await eth.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'LTC') {
           blockchains["LTC"] = await ltc.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'XRP') {
            blockchains["XRP"] = await xrp.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'NEO') {
            blockchains["NEO"] = await neo.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'RVN') {
            blockchains["RVN"] = await rvn.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'BNB') {
            blockchains["BNB"] = await bnb.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'AION') {
            blockchains["AION"] = await aion.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'EOS') {
            blockchains["EOS"] = await eos.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'TRX') {
            blockchains["TRX"] = await trx.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ONT') {
            blockchains["ONT"] = await ont.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'USDT') {
            blockchains["USDT"] = await usdt.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'IOST') {
            blockchains["IOST"] = await iost.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ICX') {
            blockchains["ICX"] = await icx.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'NANO') {
            blockchains["NANO"] = await nano.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'DASH') {
            blockchains["DASH"] = await dash.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'AE') {
            blockchains["AE"] = await ae.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ADA') {
            blockchains["ADA"] = await ada.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ZEL') {
            blockchains["ZEL"] = await zel.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ATOM') {
            blockchains["ATOM"] = await atom.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'VET') {
            blockchains["VET"] = await vet.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'QTUM') {
            blockchains["QTUM"] = await qtum.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'NEBL') {
            blockchains["NEBL"] = await nebl.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'XLM') {
            blockchains["XLM"] = await xlm.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'XTZ') {
            blockchains["XTZ"] = await xtz.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'LSK') {
            blockchains["LSK"] = await lsk.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'TOMO') {
            blockchains["TOMO"] = await tomo.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ZEN') {
            blockchains["ZEN"] = await zen.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'ZIL') {
            blockchains["ZIL"] = await zil.getBlockchain(blockchain, toFind);
        } else if(chains[i].symbol === 'VSYS') {
            blockchains["VSYS"] = await vsys.getBlockchain(blockchain, toFind);
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
 * @param {enum}   type search type
 */
const getBlockchain = async(chain, toFind, ip, ipInfo, type = enums.searchType.nothing) => {
    let result;
    
    let blockchain = await blockchainRepo.get(chain);

    blockchain.icon = "white/"+ blockchain.symbol.toLowerCase()  +".png";

    if(chain === "btc") {
        result = await btc.getBlockchain(blockchain, toFind, type);
    } else if (chain === "bch") {
        result = await bch.getBlockchain(blockchain, toFind, type);
    } else if (chain === "etc") {
        result = await etc.getBlockchain(blockchain, toFind, type);
    } else if (chain === "eth") {
        result = await eth.getBlockchain(blockchain, toFind, type);
    } else if (chain === "ltc") {
        result = await ltc.getBlockchain(blockchain, toFind, type);
    } else if (chain === "xrp") {
        result = await xrp.getBlockchain(blockchain, toFind, type);
    } else if (chain === "neo") {
        result = await neo.getBlockchain(blockchain, toFind, type);
    } else if (chain === "rvn") {
        result = await rvn.getBlockchain(blockchain, toFind, type);
    } else if (chain === "bnb") {
        result = await bnb.getBlockchain(blockchain, toFind, type);
    } else if (chain === "aion") {
        result = await aion.getBlockchain(blockchain, toFind, type);
    // } else if (chain === "eos") {
    //     return await eos.getBlockchain(blockchain, toFind, type);
    } else if (chain === "trx") {
        result = await trx.getBlockchain(blockchain, toFind, type);
    } else if (chain === "ont") {
        result = await ont.getBlockchain(blockchain, toFind, type);
    } else if (chain === "usdt") {
        result = await usdt.getBlockchain(blockchain, toFind, type);
    } else if (chain === "iost") {
        result = await iost.getBlockchain(blockchain, toFind, type);
    } else if (chain === "icx") {
        result = await icx.getBlockchain(blockchain, toFind, type);
    } else if (chain === "nano") {
        result = await nano.getBlockchain(blockchain, toFind, type);
    } else if (chain === "dash") {
        result = await dash.getBlockchain(blockchain, toFind, type);
    } else if (chain === "ae") {
        result = await ae.getBlockchain(blockchain, toFind, type);
    } else if (chain === "ada") {
        result = await ada.getBlockchain(blockchain, toFind, type);
    } else if (chain === "zel") {
        result = await zel.getBlockchain(blockchain, toFind, type);
    } else if (chain === "atom") {
        result = await atom.getBlockchain(blockchain, toFind, type);
    } else if (chain === "vet") {
        result = await vet.getBlockchain(blockchain, toFind, type);
    } else if (chain === "qtum") {
        result = await qtum.getBlockchain(blockchain, toFind, type);
    } else if (chain === "nebl") {
        result = await nebl.getBlockchain(blockchain, toFind, type);
    } else if (chain === "xlm") {
        result = await xlm.getBlockchain(blockchain, toFind, type);
    } else if (chain === "xtz") {
        result = await xtz.getBlockchain(blockchain, toFind, type);
    } else if (chain === "lsk") {
        result = await lsk.getBlockchain(blockchain, toFind, type);
    } else if (chain === "tomo") {
        result = await tomo.getBlockchain(blockchain, toFind);
    } else if (chain === "zen") {
        result = await zen.getBlockchain(blockchain, toFind, type);
    } else if (chain === "zil") {
        result = await zil.getBlockchain(blockchain, toFind, type);
    } else if (chain === "vsys") {
        result = await vsys.getBlockchain(blockchain, toFind, type);
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
    } else if (chain === "vsys") {
        tokens = await vsys.getTokens(address);
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
    } else if (chain === "zen") {
        transactions = await zen.getTransactions(address);
    } else if (chain === "zil") {
        transactions = await zil.getTransactions(address);
    } else if (chain === "vsys") {
        transactions = await vsys.getTransactions(address);
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
 * Get transactions for a block
 * 
 * @param {string} chain chain symbol to hunt
 * @param {string} blockNumber block to search
 * @param {string} ip requestor's ip address
 * @param {object} ipInfo requestor's ip info
 */
const getBlockTransactions = async(chain, blockNumber, ip, ipInfo) => {
    let transactions = [];

    if(chain === "aion") {
        transactions = await aion.getTransactions(blockNumber);
    } else if (chain === "bch") {
        transactions = await bch.getTransactions(blockNumber);
    } else if (chain === "bnb") {
        transactions = await bnb.getTransactions(blockNumber);
    } else if (chain === "etc") {
        transactions = await etc.getBlockTransactions(blockNumber);
    } else if (chain === "icx") {
        transactions = await icx.getBlockTransactions(blockNumber);
    }

    await dataSvc.updateSearchResult(
      ip,
      ipInfo,
      chain,
      "blockTransactions"
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
    getActiveChains,
    //getActiveChainsII,
    getFutureChains,
    getEmptyBlockchain,
    getEmptyBlockchains,
    getBlockchains,
    getBlockchain,
    getTokens,
    getTransactions,
    getBlockTransactions,
    emptySearch
}