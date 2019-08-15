const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://cardanoexplorer.com/api";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Cardano';
    chain.symbol = 'ADA';
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
                hasTransactions: true
            };
            const txns = datas.caTxList.slice(0, 10);
            address.transactions = getTransactions(txns);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = function(txns) {
    let transactions = [];
    txns.forEach(txn => {
        transactions.push(buildTransaction(txn));
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
    let from = [];
    let to = [];
    txn.ctbInputs.forEach(input => {
        if(from.length === 0 || from.indexOf(input[0]) < 0) {
            from.push(input[0]);
        }
    })
    txn.ctbOutputs.forEach(output => {
        if(to.length === 0 || to.indexOf(output[0]) < 0) {
            to.push(output[0]);
        }
    })

    const quantity = txn.ctbOutputSum.getCoin/1000000;
    const total = helperSvc.commaBigNumber(quantity.toString());

    let transaction = {
        hash: txn.ctbId,
        quantity: total,
        symbol: "ADA",
        date: helperSvc.unixToUTC(txn.ctbTimeIssued),
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}


const buildTransactionII = function(txn) {
    let from = [];
    let to = [];
    txn.ctsInputs.forEach(input => {
        if(from.length === 0 || from.indexOf(input[0]) < 0) {
            from.push(input[0]);
        }
    })
    txn.ctsOutputs.forEach(output => {
        if(to.length === 0 || to.indexOf(output[0]) < 0) {
            to.push(output[0]);
        }
    })

    let block = txn.ctsBlockEpoch + "." + txn.ctsBlockSlot;
    const quantity = txn.ctsTotalOutput.getCoin/1000000;
    const total = helperSvc.commaBigNumber(quantity.toString());

    let transaction = {
        hash: txn.ctsId,
        block: parseFloat(block),
        quantity: total,
        symbol: "ADA",
        date: helperSvc.unixToUTC(txn.ctsTxTimeIssued),
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