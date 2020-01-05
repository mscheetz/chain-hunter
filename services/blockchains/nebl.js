const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.nebl.io";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Neblio';
    chain.symbol = 'NEBL';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;

    if(chain.address || chain.block || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/ext/getbalance/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const datas = response.data;

            const quantity = parseInt(datas);
            const balance = helperSvc.commaBigNumber(quantity.toString());
            let address = {
                address: addressToFind,
                quantity: balance,
                hasTransactions: true
            };

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const blockCheck = async(blockNumber) => {
    let endpoint = `/api/getblockhash?index=${blockNumber}`;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data.indexOf("There was") >= 0) {
            return null;
        }

        return response.data;
    } catch (err) {
        return null;
    }
}

const getBlock = async(blockNumber) => {
    const hash = await blockCheck(blockNumber);
    
    if(hash === null) {
        return null;
    }
    let endpoint = `/api/getblock?hash=${hash}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        if(typeof response.data === 'string') {
            return null;
        }
        const datas = response.data;
        
        let block = {
            blockNumber: blockNumber,
            transactionCount: datas.tx.length,
            confirmations: datas.confirmations,
            date: helperSvc.unixToUTC(datas.time),
            size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
            hash: hash,
            hasTransactions: true
        };
        
        let transactions = [];
        if(datas.tx.length > 0) {
            let values = [];
            for(let tx of datas.tx) {                
                const transaction = await getTransaction(tx);
                if(transaction.tos.length > 0) {
                    const tos = transaction.tos.filter(t => t.symbol === 'NEBL');
                    if(tos.length > 0) {
                        let txnValues = tos.map(t => +t.quantity.replace(/,/g, ""));
                        values = _.concat(values, txnValues);
                    }
                }
                transactions.push(transaction);
            }
            if(block.transactionCount === transactions.length) {
                let quantity = 0;
                if(values.length > 0) {
                    quantity = values.reduce((a, b) => a + b, 0);
                }
                block.volume = quantity;
            }
        }

        block.transactions = transactions;

        return block;
    } catch (err) {
        return null;
    }
}

const getBlocks = async() => {
    const latestBlock = await getLatestBlock();

    let blocks = [];
    for(let i = 0; i < 10; i++) {
        const blockNumber = latestBlock - i;

        const block = await getBlock(blockNumber);

        blocks.push(block);
    }

    return blocks;
}

const getLatestBlock = async() => {
    let endpoint = "/getblockcount";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        return response.data;
    } catch(err) {
        return 0;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/ext/getaddress/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const txns = response.data.last_txs.slice(0, 5);
            let transactions = [];
            for(let i = 0; i < txns.length; i++){
                let txn = await getTransaction(txns[i].addresses);
                txn = helperSvc.inoutCalculation(address, txn);

                transactions.push(txn);
            }
            return transactions;
        } else {
            return [];
        }
    } catch(err) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/api/getrawtransaction?txid=" + hash + "&decrypt=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
 
        const transaction = await buildTransaction(datas);

        return transaction;
    } catch(error) {
        return null;
    }
}

const getTransactionSource = async(hash, index, tos) => {
    let endpoint = "/api/getrawtransaction?txid=" + hash + "&decrypt=1";
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        const datas = response.data;
        
        let sources = [];

        const output = datas.vout.filter(v => v.n === index);
        if(output.length > 0){
            let source = getIOs(output[0], null);
            sources.push(source);

            return sources;
        }

        for(let i = 0; i < datas.vout.length; i++) {
            if(_.has(datas.vout[i].scriptPubKey, 'addresses')){
                const out = datas.vout[i];
                let source = getIOs(out, tos);

                source = validateIO(source, sources);

                if(source !== null) {
                    sources.push(source);
                }
            }
        }
        if(sources.length === 0 && datas.vout.length === 1) {
            let source = getIOs(datas.vout[0], null);
            sources.push(source);
        }
        
        return sources;
    } catch(error) {
        return [];
    }
}

const validateIO = function(io, ios) {
    let valid = true;
    if(io === null) {
        valid = false;
    } else if(ios.length === 0) {
        valid = true;
    } else {
        ios.forEach(src => {
            for(let j = 0; j < src.addresses.length; j++) {
                for(let k = 0; k < io.addresses.length; k++) {
                    if(io.addresses[k] === src.addresses[j]) {
                        valid = false;
                        break;
                    }
                }
            }
        });
    }
    
    return valid ? io : null;
}

const getIOs = function(io, tos = null) {
    if(typeof io.scriptPubKey.addresses === 'undefined') {
        return null;
    }
    let quantity = io.value;
    let symbol = "NEBL";
    let icon = null;
    let addresses = io.scriptPubKey.addresses;
    let skipIO = false;
    let toSymbols = tos === null ? [] : tos.map(t => t.symbol);
    let toAddresses = [];
    if(tos !== null) {
        tos.forEach(to => {
            for(let i = 0; i < to.addresses.length; i++) {
                toAddresses.push(to.addresses[i]);
            }
        })
    }
    if(toAddresses.length > 0) {
        let addyFound = false;
        toAddresses.forEach(address => {
            for(let i = 0; i < addresses.length; i++) {
                if(address === addresses[i]) {
                    addyFound = true;
                }
            }
        })
        if(!addyFound) {
            skipIO = true;
        }
    }

    if(skipIO) {
        return null;
    }

    if(io.tokens.length > 0) {
        quantity = 0;        
        io.tokens.forEach(token => {
            quantity += parseFloat(token.amount);
            symbol = token.metadataOfIssuance.data.tokenName;
            
            if(tos !== null && toSymbols.indexOf(symbol) < 0) {
                skipIO = true;
            }
            if(token.metadataOfIssuance.data.urls.length > 0) {
                for(let i = 0; i > token.metadataOfIssuance.data.urls.length; i++) {
                    if(token.metadataOfIssuance.data.urls[i].name === "icon") {
                        icon = token.metadataOfIssuance.data.urls[i].url;
                    }
                }
            }
        });
    }

    if (skipIO) {
        return null;
    }

    const total = helperSvc.commaBigNumber(quantity.toString());

    const source = {
        addresses: addresses,
        quantity: total,
        symbol: symbol,
        icon: icon
    };

    return source;
}

const getBlockHeight = async(hash) => {
    let endpoint = "/api/getblock?hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        
        return datas.height;
    } catch(error) {
        return 0;
    }
}

const buildTransaction = async(txn) => {
    let type = enums.transactionType.TRANSFER;
    let froms = [];
    let tos = [];
    if(txn.vout.length === 1 && txn.vout[0].scriptPubKey.type === "nonstandard"){
        type = enums.transactionType.NONSTANDARD;
    }
    if(type !== enums.transactionType.NONSTANDARD) {
        for(let i = 0; i < txn.vout.length; i++) {
            const to = getIOs(txn.vout[i]);
            if(to !== null) {
                tos.push(to);
            }
        }

        for(let i =0; i < txn.vin.length; i++) {
            if(typeof txn.vin[i].coinbase !== 'undefined') {
                type = enums.transactionType.MINING;
                const from = {
                    addresses: ["coinbase"]
                }
                froms.push(from);
            } else {
                const from = await getTransactionSource(txn.vin[i].txid, txn.vin[i].vout, tos);        
                from.forEach(fr => {
                    froms.push(fr);
                })
            }
        }
    }

    const toDatas = helperSvc.cleanIO(tos);
    const fromDatas = helperSvc.cleanIO(froms);

    const block = await getBlockHeight(txn.blockhash);

    let transaction = {
        type: type,
        hash: txn.txid,
        block: block,
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
        froms: fromDatas,
        tos: toDatas
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getBlocks
}