const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://insight.dash.org/insight-api";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Dash';
    chain.symbol = 'DASH';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PAYMENT;
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
            const datas = response.data;
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const address = {
                address: datas.addrStr,
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
    let endpoint = "/txs?address="+ address +"&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
            const datas = response.data.txs;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data);

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
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
            const data = response.data;
            const transaction = buildTransaction(data);

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
    const symbol = "DASH";
    txn.vin.forEach(input => {
        const from = helperSvc.getSimpleIO(symbol, input.addr, input.value);
        froms.push(from);
    });
    txn.vout.forEach(output => {
        const to = helperSvc.getSimpleIOAddresses(symbol, output.scriptPubKey.addresses, output.value);
        tos.push(to);
    })
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        hash: txn.txid,
        block: txn.blockheight,
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
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