const axios = require('axios')
const helperSvc = requre('helper')
const base = "https://api.xrpscan.com/api"

const getBlockchain = function() {
    const chain = {};
    chain.name = 'Ripple';
    chain.symbol = 'XRP';

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
    let endpoint = "/v1/account/" + toFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response) {
            const address = {};
            address.address = response.account;
            address.quantity = parseFloat(response.xrpBalance);

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
        const datas = response.payments;
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                transactions.push({
                    hash: data.tx_hash,
                    block: data.ledger_index,
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

const getTransaction = function(toFind) {
    let endpoint = "/tx/" + toFind + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.err_no === 0 && response.data !== null) {
            const data = response.data;
            const transaction = {
                hash: data.hash,
                block: data.ledger_index,
                symbol: "XRP",
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
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}