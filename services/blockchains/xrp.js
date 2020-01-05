const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://api.xrpscan.com/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
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

const getBlock = async(blockNumber) => {
    let endpoint = "/v1/ledger/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;
        const latestBlock = await getLatestBlock();

        let block = buildBlock(datas, latestBlock);

        return block;
    } catch (err) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = "/v1/ledger/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data.ledgers;
        const latestBlock = datas[0].ledger_index;
        let blocks = [];

        for(let data of datas) {
            let block = buildBlock(datas, latestBlock);

            blocks.push(block);
        }

        return blocks;
    } catch (err) {
        return [];
    }
}

const buildBlock = function(data, latestBlock) {    
    let block = {
        blockNumber: data.ledger_index,
        transactionCount: data.tx_count,
        confirmations: latestBlock - data.ledger_index,
        date: helperSvc.unixToUTC(data.close_time),
        hash: data.ledger_hash,
        hasTransactions: true
    };

    return block;
}

const getLatestBlock = async() => {
    let endpoint = "/v1/ledgers";
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        return response.data.ledgers[0].ledger_index;
    } catch (err) {
        return 0;
    }
}

const getBlockTransactions = async(blockNumber) => {
    let endpoint = "/v1/ledger/" + blockNumber +"/transactions";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            
            datas.forEach(data => {
                let transaction = buildTransaction(data);

                transactions.push(transaction);
            })
        }

        return transactions;
    } catch(error) {
        return [];
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
    let type = txn.TransactionType === "Payment" 
                ? enums.transactionType.PAYMENT : 
                txn.TransactionType === "OfferCreate" 
                ? enums.transactionType.OFFERCREATE 
                : txn.TransactionType === "OfferCancel"
                ? enums.transactionType.OFFERCANCEL
                : enums.transactionType.TRANSFER
    let froms = [];
    let tos = [];
    let symbol = "XRP";
    let hash = typeof txn.hash !== 'undefined' ? txn.hash : txn._txhash;
    if(typeof txn.TakerPays !== 'undefined') {
        const from = helperSvc.getSimpleIO(txn.TakerPays.currency, txn.Account, txn.TakerPays.value);
        froms.push(from);
    }
    if(typeof txn.TakerGets !== 'undefined') {
        const to = helperSvc.getSimpleIO(txn.TakerGets.currency, txn.Account, txn.TakerGets.value);
        tos.push(to);
    }
    if(typeof txn.source !== 'undefined') {
        const from = helperSvc.getSimpleIO(symbol, txn.source, txn.delivered_amount);
        froms.push(from);
    }
    if(typeof txn.destination !== 'undefined') {
        const to = helperSvc.getSimpleIO(symbol, txn.destination, txn.delivered_amount);
        tos.push(to);
    }
    if(typeof txn.Amount !== 'undefined') {
        symbol = txn.Amount.currency;
        const from = helperSvc.getSimpleIO(symbol, txn.Account, txn.Amount.value);
        froms.push(from);
        if(typeof txn.Destination !== 'undefined'){
            const to = helperSvc.getSimpleIO(symbol, txn.Destination, txn.Amount.value);
            tos.push(to);
        }
    }

    if(typeof txn.Account !== 'undefined' && froms.length === 0) {
        const from = helperSvc.getSimpleIO(symbol, txn.Account, 0);
        froms.push(from);
    }

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let ts = typeof txn.date !== 'undefined' ? txn.date : txn.executed_time;
    ts = formatDate(ts);

    let transaction = {
        type: type,
        hash: hash,
        block: txn.ledger_index,
        date: ts,
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
    let type = txn.TransactionType === "Payment" 
                ? enums.transactionType.PAYMENT : 
                txn.TransactionType === "OfferCreate" 
                ? enums.transactionType.OFFERCREATE 
                : enums.transactionType.TRANSFER
    let froms = [];
    let tos = [];
    if(typeof txn.TakerPays !== 'undefined') {
        const from = helperSvc.getSimpleIO(txn.TakerPays.currency, txn.Account, txn.TakerPays.value);
        froms.push(from);
    }
    if(typeof txn.TakerGets !== 'undefined') {
        const to = helperSvc.getSimpleIO(txn.TakerGets.currency, txn.Account, txn.TakerGets.value);
        tos.push(to);
    }
    if(typeof txn.Amount !== 'undefined') {
        const symbol = txn.Amount.currency;
        const from = helperSvc.getSimpleIO(symbol, txn.Account, txn.Amount.value);
        froms.push(from);
        if(typeof txn.Destination !== 'undefined'){
            const to = helperSvc.getSimpleIO(symbol, txn.Destination, txn.Amount.value);
            tos.push(to);
        }
    }

    if(typeof txn.Account !== 'undefined' && froms.length === 0) {
        const from = helperSvc.getSimpleIO(symbol, txn.Account, 0);
        froms.push(from);
    }
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    
    let ts = formatDate(txn.date);
    
    let transaction = {
        type: type,
        hash: txn.hash,
        block: txn.ledger_index,
        date: ts,
        froms: fromData,
        tos: toData
    };
    
    return transaction;
}

const formatDate = function(timestamp) {    
    let ts = timestamp;
    let yr = ts.substr(0,4);
    let mo = ts.substr(5,2);
    let day = ts.substr(8,2);
    let time = ts.substr(11,8);
    mo = helperSvc.getMonth(mo);
    
    ts = `${day}-${mo}-${yr} ${time}`;

    return ts;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getBlockTransactions,
    getTransactions,
    getTransaction,
    getBlocks
}