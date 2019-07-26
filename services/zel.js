const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explorer.zel.cash/api";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'ZelCash';
    chain.symbol = 'ZEL';
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            let address = {
                address: datas.addrStr,
                quantity: datas.balance
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
    let endpoint = "/txs?address=" + address + "&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data.txs;
            console.log(datas);
            let transactions = [];
            datas.forEach(txn =>{ 
                transactions.push(buildTransaction(txn));
            });

            return transactions;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
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
    let from = [];
    let to = [];
    txn.vin.forEach(input => {
        from.push(input.addr);
    })
    for(let i = 0; i < txn.vout.length; i++) {
        txn.vout[i].scriptPubKey.addresses.forEach(address => {
            if(address && to.indexOf(address) <= -1) {
                to.push(address);
            }
        })
    }

    let transaction = {
        hash: txn.txid,
        quantity: txn.valueOut,
        block: txn.blockheight,
        confirmations: txn.confirmations,
        symbol: "ZEL",
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