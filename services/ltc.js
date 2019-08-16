const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://insight.litecore.io/api";
const enums = require('../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Litecoin';
    chain.symbol = 'LTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
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
    let endpoint = "/addr/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
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
    let endpoint = "/txs?address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.txs.splice(0, 10);
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                const txn = buildTransaction(data);
                transactions.push(txn);
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if( response.data !== null) {
            const transaction = buildTransaction(response.data);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    if(txn != null) {
        let from = [];
        let to = [];
        txn.vin.forEach(vin => {
            if(vin.addr && from.indexOf(vin.addr) <= -1) {
                from.push(vin.addr);
            }
        });
        txn.vout.forEach(vout => {
            if(vout.scriptPubKey && vout.scriptPubKey.addresses ) {
                for(var i = 0; i < vout.scriptPubKey.addresses.length; i++) {
                    toAddy = vout.scriptPubKey.addresses[i];
                    if(to.indexOf(toAddy) <= -1) {
                        to.push(toAddy);
                    }
                }
            }
        });
        const total = helperSvc.commaBigNumber(txn.valueOut.toString());

        let transaction = {};
        transaction.hash = txn.txid;
        transaction.block = txn.blockheight;
        transaction.symbol = "LTC";
        transaction.quantity = total;
        transaction.confirmations = txn.confirmations;
        transaction.date = helperSvc.unixToUTC(txn.time);
        transaction.from = from.join(", ");
        transaction.to = to.join(", ");

        return transaction;
    }

    return null;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}