const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://cardanoexplorer.com/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Cardano';
    chain.symbol = 'ADA';
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
    let endpoint = "/addresses/summary/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.Right !== "undefined") {
            const datas = response.data.Right;
            const quantity = parseInt(datas.caBalance.getCoin)/1000000;
            const balance = helperSvc.commaBigNumber(quantity.toString());
            let address = {
                address: datas.caAddress,
                quantity: balance,
                hasTransactions: true,
                transactionCount: datas.caTxNum
            };
            const txns = datas.caTxList.slice(0, 10);
            address.transactions = getTransactions(address.address, txns);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = function(address, txns) {
    let transactions = [];
    txns.forEach(txn => {        
        let transaction = buildTransaction(txn);
        transaction = helperSvc.inoutCalculation(address, transaction);

        transactions.push(transaction);
    });
    
    return transactions;            
}

const getTransaction = async(hash) => {
    let endpoint = "/txs/summary/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.Right !== "undefined") {
            const datas = response.data.Right;
            
            const transaction = buildTransactionII(datas);

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
    const symbol = "ADA";

    txn.ctbInputs.forEach(input => {
        let i = 0;
        let address = "";
        let quantity = 0;
        for(const [key, value] of Object.entries(input)) {
            if(i === 0) {
                address = value;
            } else if (i === 1) {
                quantity = value.getCoin/1000000;
            }
            i++;
        }
        let from = helperSvc.getSimpleIO(symbol, address, quantity);
        froms.push(from);
    })
    txn.ctbOutputs.forEach(output => {
        let i = 0;
        let address = "";
        let quantity = 0;
        for(const [key, value] of Object.entries(output)) {
            if(i === 0) {
                address = value;
            } else if (i === 1) {
                quantity = value.getCoin/1000000;
            }
            i++;
        }
        let to = helperSvc.getSimpleIO(symbol, address, quantity);
        tos.push(to);
    })

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.ctbId,
        date: helperSvc.unixToUTC(txn.ctbTimeIssued),
        froms: fromData,
        tos: toData
    };

    return transaction;
}


const buildTransactionII = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "ADA";

    txn.ctsInputs.forEach(input => {
        let i = 0;
        let address = "";
        let quantity = 0;
        for(const [key, value] of Object.entries(input)) {
            if(i === 0) {
                address = value;
            } else if (i === 1) {
                quantity = value.getCoin/1000000;
            }
            i++;
        }
        let from = helperSvc.getSimpleIO(symbol, address, quantity);
        froms.push(from);
    })
    txn.ctsOutputs.forEach(output => {
        let i = 0;
        let address = "";
        let quantity = 0;
        for(const [key, value] of Object.entries(output)) {
            if(i === 0) {
                address = value;
            } else if (i === 1) {
                quantity = value.getCoin/1000000;
            }
            i++;
        }
        let to = helperSvc.getSimpleIO(symbol, address, quantity);
        tos.push(to);
    })

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    let block = txn.ctsBlockEpoch + "." + txn.ctsBlockSlot;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.ctsId,
        block: parseFloat(block),
        date: helperSvc.unixToUTC(txn.ctsTxTimeIssued),
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