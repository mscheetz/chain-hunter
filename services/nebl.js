const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explorer.nebl.io";
const enums = require('../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Neblio';
    chain.symbol = 'NEBL';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let transaction = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.transaction = transaction;

    if(chain.address || chain.transaction) {
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

const getTransactions = async(address) => {
    let endpoint = "/ext/getaddress/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const txns = response.data.last_txs.slice(0, 5);
            let transactions = [];
            for(let i = 0; i < txns.length; i++){
                const txn = await getTransaction(txns[i].addresses);
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

const getTransactionSource = async(hash) => {
    let endpoint = "/api/getrawtransaction?txid=" + hash + "&decrypt=1";
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        const datas = response.data;
        
        let source = [];
        for(let i = 0; i < datas.vout.length; i++) {
            if(_.has(datas.vout[i].scriptPubKey, 'addresses')){
                datas.vout[i].scriptPubKey.addresses.forEach(address => {
                    if(address && source.indexOf(address) <= -1) {
                        source.push(address);
                    }
                });
            }
        }

        return source;
    } catch(error) {
        return null;
    }
}

const getBlockHeight = async(hash) => {
    let endpoint = "/api/getrawtransaction?txid=" + hash + "&decrypt=1";
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
    let from = [];
    let to = [];
    let quantity = 0;
    let symbol = "";
    let sources = [];
    if(txn.ntp1) {
        for(let i =0; i < txn.vin.length; i++) {
            if(sources.length === 0 && txn.vin[i].tokens.length > 0) {
                sources = await getTransactionSource(txn.vin[i].txid);
            }
        }
    } else {
        sources = await getTransactionSource(txn.vin[0].txid);
        symbol = "NEBL";
    }
    
    if(sources !== null && sources.length > 0) {
        sources.forEach(src => {
            if(from.length == 0 || from.indexOf(src) < 0){
                from.push(src);
            }
        });
    }

    for(let i = 0; i < txn.vout.length; i++) {
        if(txn.ntp1) {
            txn.vout[i].tokens.forEach(token => {
                quantity += parseFloat(token.amount);
                if(symbol === "") {
                    symbol = token.metadataOfIssuance.data.tokenName;
                }
            });
        } else {
            quantity += txn.vout[i].value;
        }
        if(typeof txn.vout[i].scriptPubKey.addresses !== undefined) {
            txn.vout[i].scriptPubKey.addresses.forEach(address => {
                if(address && to.indexOf(address) <= -1) {
                    to.push(address);
                }
            });
        }
    }

    const total = helperSvc.commaBigNumber(quantity.toString());
    const block = await getBlockHeight(txn.blockhash);

    let transaction = {
        hash: txn.txid,
        quantity: total,
        block: block,
        confirmations: txn.confirmations,
        symbol: symbol,
        date: helperSvc.unixToUTC(txn.time),
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}