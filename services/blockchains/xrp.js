const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://api.xrpscan.com/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async(chain) => {
    const chain = {};
    chain.name = 'Ripple';
    chain.symbol = 'XRP';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind) => {
    //const chain = await getEmptyBlockchain(blockchain);
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
    let endpoint = "/v1/account/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data) {
            const quantity = parseFloat(response.data.xrpBalance);
            const total = helperSvc.commaBigNumber(quantity.toString());

            const address = {
                address: response.data.account,
                quantity: total,
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
    let endpoint = "/v1/account/" + address +"/payments";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.payments;
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                let transaction = buildTransaction(data);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const buildTransaction = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "XRP";
    const from = helperSvc.getSimpleIO(symbol, txn.source, txn.delivered_amount);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.destination, txn.delivered_amount);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.tx_hash,
        block: txn.ledger_index,
        date: txn.executed_time,
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const getTransaction = async(hash) => {
    let endpoint = "/v1/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data) {
            const data = response.data;

            const transaction = buildTransactionII(data);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransactionII = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = txn.Amount.currency;
    const from = helperSvc.getSimpleIO(symbol, txn.Account, txn.Amount.value);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.Destination, txn.Amount.value);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.ledger_index,
        date: txn.date,
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