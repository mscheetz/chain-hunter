const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.nanocrawler.cc/v2";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Nano';
    chain.symbol = 'NANO';
    chain.hasTokens = false;
    chain.hasContracts = false;
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
    if(searchType & enums.searchType.transaction && address === null) {
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
    let endpoint = "/accounts/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const datas = response.data.account;
            const quantity = helperSvc.bigNumberToDecimal(datas.balance,30);
            const address = {
                address: addressToFind,
                quantity: quantity,
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
    let endpoint = "/accounts/" + address + "/history";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data.error === "undefined") {
            const datas = response.data.splice(0, 10);
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data, address));
                })
            }

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/blocks/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const data = response.data;
            let transaction = buildTransactionII(data);
            transaction.hash = hash;

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn, account) {
    const quantity = helperSvc.bigNumberToDecimal(txn.amount, 30);

    const transaction = {
        hash: txn.hash,
        block: 0,
        quantity: quantity,
        symbol: "NANO",
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        from: txn.subtype === "send" ? txn.account : account,
        to: txn.subtype === "send" ? account : txn.account
    };

    return transaction;
}

const buildTransactionII = function(txn) {
    const quantity = helperSvc.bigNumberToDecimal(txn.amount, 30);

    const transaction = {
        hash: txn.hash,
        block: 0,
        quantity: quantity,
        symbol: "NANO",
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        from: txn.subtype === "send" ? txn.block_account : txn.source_account,
        to: txn.contents.link_as_account
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