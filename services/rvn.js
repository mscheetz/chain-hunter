const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://ravencoin.network/api";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Raven Coin';
    chain.symbol = 'RVN';
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
        if(response.data) {
            const address = {
                address: response.data.addrStr,
                quantity: response.data.balance/100000000,
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
    let endpoint = "/txs?address=" + address +"&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null) {
            const datas = response.data.txs.splice(0, 10);
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
        if(response.data) {
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
        let quantity = 0;
        let manyAddresses = false;
        if(txn.vin.length > 5) {
            from.push(txn.vin.length + ' incoming addresses');
            manyAddresses = true;
        }
        txn.vin.forEach(vin => {
            if(vin.addr && from.indexOf(vin.addr) <= -1 && !manyAddresses) {
                from.push(vin.addr);
            }
            quantity += +vin.value;
        });
        if(txn.vout.length > 5) {
            to.push(txn.vout.length + ' outgoing addresses');
        } else {
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
        }
        let transaction = {};
        transaction.hash = txn.txid;
        transaction.block = txn.blockheight;
        transaction.quantity = quantity;
        transaction.symbol = "RVN";
        transaction.confirmations = txn.confirmations;
        transaction.date = helperSvc.unixToUTC(txn.blocktime);
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