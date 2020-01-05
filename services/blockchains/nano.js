const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://api.nanocrawler.cc/v2";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Nano';
    chain.symbol = 'NANO';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
    let endpoint = "/accounts/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const datas = response.data.account;
            const quantity = helperSvc.bigNumberToDecimal(datas.balance,30);
            const total = helperSvc.commaBigNumber(quantity.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);

            const address = {
                address: addressToFind,
                quantity: cleanedTotal,
                transactionCount: datas.block_count,
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
                    let transaction = buildTransaction(data, address);

                    transaction = helperSvc.inoutCalculation(address, transaction);

                    transactions.push(transaction);
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
    let froms = [];
    let tos = [];
    const symbol = "NANO";
    const fromAddress = txn.subtype === "send" ? txn.account : account;
    const toAddress = txn.subtype === "send" ? account : txn.account;
    const quantity = helperSvc.bigNumberToDecimal(txn.amount, 30);
    const from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
    tos.push(to);
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: 0,
        confirmations: 0,
        date: helperSvc.unixToUTC(txn.timestamp.substring(0, 10)),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const buildTransactionII = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "NANO";
    const fromAddress = txn.subtype === "send" ? txn.block_account : txn.source_account;
    const toAddress = txn.contents.link_as_account;
    const quantity = helperSvc.bigNumberToDecimal(txn.amount, 30);
    const from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
    tos.push(to);
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: 0,
        confirmations: 0,
        date: helperSvc.unixToUTC(txn.timestamp.substring(0, 10)),
        froms: fromData,
        tos: toData,
        success: txn.confirmed ? "success" : "fail"
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