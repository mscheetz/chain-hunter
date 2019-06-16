const axios = require('axios');
const helperSvc = requre('helper');
const base = "https://insight.litecore.io/api";

const getEmptyBlockchain = function() {
    const chain = {};
    chain.name = 'Litecoin';
    chain.symbol = 'LTC';
    chain.hasTokens = false;

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }

    return chain;
}

const getAddress = async(address) => {
    let endpoint = "/addr/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
            const datas = response.data;
            const address = {};
            address.address = datas.address;
            address.quantity = datas.balance;

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
        const datas = response.txs;
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                transactions.push(buildTransaction(data));
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = function(hash) {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
            const transaction = buildTransaction(response);

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
        let transaction = {};

        let qty = txn.valueOut;
        let from = "";
        let to = ""
        txn.vin.forEach(vin => {
            if(from !== "") {
                from += ", ";
            } 
            if(vin.addr) {
                from += vin.addr;
            }
        });
        txn.vout.forEach(vout => {
            if(from !== "") {
                from += ", ";
            } 
            if(vout.scriptPubKey && vout.scriptPubKey.addresses) {
                from += vout.scriptPubKey.addresses.join(", ");
            }
        });

        transaction.hash = txn.txid;
        transaction.block = txn.blockheight;
        transaction.symbol = "LTC";
        transaction.quantity = txn.valueOut;
        transaction.confirmations = txn.confirmations;
        transaction.date = this.helperSvc.unixToUTC(txn.time);
        transaction.from = from;
        transaction.to = to;

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