const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://explorer.lisk.io/api";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Lisk';
    chain.symbol = 'LSK';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PROTOCOL;
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
    let endpoint = "/getAccount?address=" + addressToFind;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data;
            const quantity = parseInt(datas.balance)/1000000000;
            const balance = helperSvc.commaBigNumber(quantity.toString());
            let address = {
                address: datas.address,
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
    let endpoint = "/getTransactions?address=" + address + "&limit=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data.transactions;
            let transactions = [];

            datas.forEach(data => {
                let transaction = buildTransaction(data);
                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/getTransaction?transactionId=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data.transaction;
            
            const transaction = buildTransaction(datas);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "LSK";
    const quantity = txn.amount/100000000;

    const from = helperSvc.getSimpleIO(symbol, txn.senderId, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.recipientId, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.id,
        date: helperSvc.unixToUTC(txn.timestamp + 1464109200),
        froms: fromData,
        tos: toData
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