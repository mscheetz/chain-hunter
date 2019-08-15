const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.omniexplorer.info/v1";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tether';
    chain.symbol = 'USDT';
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
    let endpoint = "/address/addr/details/";
    let url = base + endpoint;
    let data = "addr=" + addressToFind;

    try{
        const response = await axios.post(url, data);
        
        const datas = response.data.balance;
        const txns = response.data.transactions;
        let quantity = 0;
        datas.forEach(data => {
            if(data.propertyinfo.name == "TetherUS") {
                quantity = parseInt(data.value)/100000000;
            }
        });
        let address = {};
        if(quantity > 0) {
            const total = helperSvc.commaBigNumber(quantity.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);

            address = {
                address: addressToFind,
                quantity: cleanedTotal,
                hasTransactions: true
            };
            address.transactions = getTransactions(txns);
        } else {
            address = null;
        }

        return address;
    } catch(error) {
        return null;
    }
}

const getTransactions = function(txns) {
    let txnCount = 0;
    let transactions = [];
    txns.forEach(txn => {
        if(txnCount < 10){
            if(txn.propertyname === "TetherUS"){
                transactions.push(buildTransaction(txn));

                txnCount++;
            }
        }
    });
    return transactions;            
}

const getTransaction = async(hash) => {
    let endpoint = "/transaction/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.type !== "Error - Not Found") {
            const datas = response.data;
            const transaction = buildTransaction(datas);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {    
    const total = helperSvc.commaBigNumber(txn.amount.toString());
    const cleanedTotal = helperSvc.decimalCleanup(total);

    const transaction = {
        hash: txn.txid,
        block: txn.block,
        quantity: cleanedTotal,
        symbol: "USDT",
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.blocktime),
        from: txn.sendingaddress,
        to: txn.referenceaddress
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