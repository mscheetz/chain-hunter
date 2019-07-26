const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://cardanoexplorer.com/api";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Cardano';
    chain.symbol = 'ADA';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
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
            let quantity = parseInt(datas.caBalance.getCoin)/1000000;
            let address = {
                address: datas.caAddress,
                quantity: quantity
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
        from.push(input[0]);
    })
    txn.ctbOutputs.forEach(output => {
        to.push(output[0]);
    })

    let transaction = {
        hash: txn.ctbId,
        quantity: txn.ctbOutputSum.getCoin/1000000 ,
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
        from.push(input[0]);
    })
    txn.ctsOutputs.forEach(output => {
        to.push(output[0]);
    })

    let block = txn.ctsBlockEpoch + "." + txn.ctsBlockSlot;

    let transaction = {
        hash: txn.ctsId,
        block: parseFloat(block),
        quantity: txn.ctsTotalOutput.getCoin/1000000 ,
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