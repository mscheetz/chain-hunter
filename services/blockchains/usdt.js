const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://api.omniexplorer.info/v1";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tether (Omni)';
    chain.symbol = 'USDT';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.STABLECOIN;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;
    let contract = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
            address.transactions = getTransactions(txns, addressToFind);
        } else {
            address = null;
        }

        return address;
    } catch(error) {
        return null;
    }
}

const getTransactions = function(txns, address) {
    let txnCount = 0;
    let transactions = [];
    txns.forEach(txn => {
        if(txnCount < 10){
            if(txn.propertyname === "TetherUS"){
                let transaction = buildTransaction(txn);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);

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
    const symbol = "USDT";
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(symbol, txn.sendingaddress, txn.amount);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.referenceaddress, txn.amount);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        hash: txn.txid,
        block: txn.block,
        // quantity: cleanedTotal,
        // symbol: "USDT",
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.blocktime),
        froms: fromData,
        tos: toData
        // from: txn.sendingaddress,
        // to: txn.referenceaddress
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