const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://bch-chain.api.btc.com/v3";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Bitcoin Cash';
    chain.symbol = 'BCH';
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
    let endpoint = "/address/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.data;
            const address = {
                address: datas.address,
                quantity: datas.balance/100000000,
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
    let endpoint = "/address/" + address + "/tx";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.data.list.splice(0, 10);
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
    let endpoint = "/tx/" + hash + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const data = response.data.data;
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
    let from = [];
    let to = [];
    if(txn.is_coinbase) {
        from.push("Coinbase");
    } else {
        for(let i = 0; i < txn.inputs.length; i++) {
            txn.inputs[i].prev_addresses.forEach(address => {
                if(address && from.indexOf(address) <= -1) {
                    from.push(address);
                }
            })
        }
    }
    for(let i = 0; i < txn.outputs.length; i++) {
        txn.outputs[i].addresses.forEach(address => {
            if(address && to.indexOf(address) <= -1) {
                to.push(address);
            }
        })
    }

    const transaction = {
        hash: txn.hash,
        block: txn.block_height,
        quantity: txn.outputs_value/100000000,
        symbol: "BCH",
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.created_at),
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