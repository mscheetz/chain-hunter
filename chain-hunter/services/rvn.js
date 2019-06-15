const axios = require('axios');
const helperSvc = requre('helper');
const base = "https://ravencoin.network/api";

const getBlockchain = async(toFind) => {
    const chain = {};
    chain.name = 'Raven Coin';
    chain.symbol = 'RVN';
    chain.hasTokens = true;

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
        if(response) {
            const address = {};
            address.address = response.addrStr;
            address.quantity = response.balance/100000000;

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/txs?address=" + address +"&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
            const datas = response.txs;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data));
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

const getTransaction = function(hash) {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response) {
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
    let transaction = null;

    if(txn != null) {
        let from = "";
        let to = ""
        txn.vin.forEach(vin => {
            if(from !== "") {
                from += ", ";
            } 
            from += vin.addr;
        });
        txn.vout.forEach(vout => {
            if(to !== "") {
                to += ", ";
            } 
            to += vout.scriptPubKey.addresses.join(", ");
        });
        transaction.hash = txn.txid;
        transaction.block = txn.blockheight;
        transaction.quantity = txn.valueOut/100000000;
        transaction.confirmations = txn.confirmations;
        transaction.date = helperSvc.unixToUTC(txn.blocktime);
        transaction.from = from;
        transaction.to = to;
    }

    return transaction;
}

module.exports = {
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}