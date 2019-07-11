const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.omniexplorer.info/v1";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tether';
    chain.symbol = 'USDT';
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
        await delay(1000);
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/addr/details/";
    let url = base + endpoint;
    let data = "addr=" + addressToFind;

    try{
        const response = await axios.post(url, data);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.balance;
            let quantity = 0;
            datas.forEach(data => {
                if(data.propertyinfo.name == "TetherUS") {
                    quantity = data.propertyinfo.totaltokens;
                }
            });
            let address = {};
            if(quantity > 0){
                address = {
                    address: addressToFind,
                    quantity: quantity
                };
                address.transactions = getTransactions(datas.transactions);
            } else {
                address = null;
            }

            return address;
        } else {
            return null;
        }
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
    const transaction = {
        hash: txn.txid,
        block: txn.block,
        quantity: txn.amount,
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