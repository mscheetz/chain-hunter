const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.xrpscan.com/api";
const enums = require('../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ripple';
    chain.symbol = 'XRP';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
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
    if(searchType & enums.searchType.transaction) {
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
    let endpoint = "/v1/account/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data) {
            const quantity = parseFloat(response.data.xrpBalance);
            const total = helperSvc.commaBigNumber(quantity.toString());

            const address = {
                address: response.data.account,
                quantity: total,
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
    let endpoint = "/v1/account/" + address +"/payments";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.payments;
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                const quantity = parseInt(data.delivered_amount);
                const total = helperSvc.commaBigNumber(quantity.toString());

                transactions.push({
                    hash: data.tx_hash,
                    block: data.ledger_index,
                    symbol: "XRP",
                    quantity: total,
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
        if(response.data) {
            const data = response.data;
            const total = helperSvc.commaBigNumber(data.Amount.value.toString());

            const transaction = {
                hash: data.hash,
                block: data.ledger_index,
                symbol: data.Amount.currency,
                quantity: total,
                date: data.date,
                from: data.Account,
                to: data.Destination
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