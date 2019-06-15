const axios = require('axios')
const helperSvc = requre('helper')
const base = "https://bch-chain.api.btc.com/v3"

const getBlockchain = function(toFind) {
    const chain = {};
    chain.name = 'Bitcoin Cash';
    chain.symbol = 'BCH';
    chain.hasTokens = false;

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
    let endpoint = "/address/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
            const datas = response.data;
            const address = {};
            address.address = datas.address;
            address.quantity = datas.balance/100000000;

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
        if(response.err_no === 0 && response.data !== null) {
            const datas = response.data.list;
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
    let endpoint = "/tx/" + hash + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
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
    const transaction = {
    hash: txn.hash,
    block: txn.block_height,
    quantity: txn.outputs_value/100000000,
    symbol: "BCH",
    confirmations: txn.confirmations,
    date: helperSvc.unixToUTC(txn.created_at),
    from: txn.inputs[0].prev_addresses[0],
    to: txn.outputs[0].addresses[0]
    };

    return transaction;
}

module.exports = {
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}