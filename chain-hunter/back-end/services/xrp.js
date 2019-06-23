const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.xrpscan.com/api";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ripple';
    chain.symbol = 'XRP';
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
        console.log('finding xrp txn');
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v1/account/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data) {
            const address = {
                address: response.data.account,
                quantity: parseFloat(response.data.xrpBalance)
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
    let endpoint = "/v1/account/" + address +"/payments";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.payments;
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                transactions.push({
                    hash: data.tx_hash,
                    block: data.ledger_index,
                    symbol: "XRP",
                    quantity: parseInt(data.delivered_amount),
                    date: data.executed_time,
                    from: data.source,
                    to: data.destination
                });
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/v1/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        console.log(response.data);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const data = response.data.data;
            const transaction = {
                hash: data.hash,
                block: data.ledger_index,
                symbol: data.Amount.currency,
                quantity: data.Amount.value,
                date: data.date,
                from: data.Account,
                to: data.DesinationName
            };

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}