const axios = require('axios')
const helperSvc = requre('helper')
const base = "https://chain.api.btc.com/v3"

const getBlockchain = async(toFind) => {
    const chain = {};
    chain.name = 'Bitcoin';
    chain.symbol = 'BTC';

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }

    return chain;
}

const getAddress = async(toFind) => {
    let endpoint = "/address/" + toFind;
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

const getTransactions = async(toFind) => {
    let endpoint = "/address/" + toFind + "/tx";
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

const getTransaction = function(toFind) {
    let endpoint = "/tx/" + toFind + "?verbose=3";;
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
        console.log(error);
    }
}

const buildTransaction = function(txn) {
    const transaction = {
    hash: txn.hash,
    block: txn.block_height,
    quantity: txn.outputs_value/100000000,
    symbol: "BTC",
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