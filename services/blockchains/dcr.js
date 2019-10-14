const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://mainnet.decred.org/api";//"https://dcrdata.decred.org/api";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Decred';
    chain.symbol = 'DCR';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind) => {
    //const chain = await getEmptyBlockchain(blockchain);
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;            
            let address = {
                address: addressToFind,
                hasTransactions: true
            };
            
            const balance = helperSvc.commaBigNumber(datas.balance.toString());

            address.quantity = balance;
            
            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/txs?" + address + "&pageNum=0";
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const data = response.data;
            const transaction = buildTransactions(data);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
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

const buildTransactions = function(txns) {
    let transactions = [];

    if(txns.length > 0) {
        txns.forEach(txn => {
            transactions.push(buildTransaction(txn));
        });
    }

    return transactions;            
}

const buildTransaction = function(txn) {
    let from = [];
    let to = [];
    
    txn.vin.forEach(input => {
        if(typeof input.addr !== undefined) {
            if(from.indexOf(input.addr) === -1){
                from.push(input.addr);
            }
        }
    });
    txn.vout.forEach(output => {
        if(typeof output.scriptPubKey.addresses !== undefined) {
            output.scriptPubKey.addresses.forEach(address =>{
                if(to.indexOf(address) === -1){
                    to.push(address);
                }
            });
        }
    });
    const quantity = helperSvc.commaBigNumber(txn.valueOut.toString());
console.log(quantity);
    const transaction = {
        hash: txn.txid,
        block: txn.blockheight,
        quantity: quantity,
        symbol: "DCR",
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
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