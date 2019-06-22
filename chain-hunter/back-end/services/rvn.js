const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://ravencoin.network/api";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Raven Coin';
    chain.symbol = 'RVN';
    chain.hasTokens = false;
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
    let endpoint = "/addr/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response) {
            const address = {
                address: response.addrStr,
                quantity: response.balance/100000000
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

const getTransaction = async(hash) => {
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
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}