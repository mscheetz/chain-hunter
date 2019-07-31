const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://insight.litecore.io/api";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Litecoin';
    chain.symbol = 'LTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
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
        if(response.data !== null) {
            const datas = response.data;
            const address = {
                address: datas.addrStr,
                quantity: datas.balance,
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

        let transaction = {};
        transaction.hash = txn.txid;
        transaction.block = txn.blockheight;
        transaction.symbol = "LTC";
        transaction.quantity = txn.valueOut;
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