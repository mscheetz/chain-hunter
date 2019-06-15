const axios = require('axios');
const helperSvc = requre('helper');
const ethscanBase = "https://api.etherscan.io/api";
const ethscanKey = "&apikey=YYT6FH7R4K7WK729Z2ZPTC2ZNTK48WEKHG";
const ethplorerBase = "http://api.ethplorer.io";
const ethplorerKey = "?apiKey=freekey";

const getBlockchain = function(toFind) {
    const chain = {};
    chain.name = 'Ethereum';
    chain.symbol = 'ETH';
    chain.hasTokens = true;

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
    let endpoint = "?module=account&action=balance&address="+ address +"&tag=latest";
    let url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(response.status === "1" || response.message === "OK") {
            const datas = response.data;
            const address = {};
            address.address = datas.address;
            address.quantity = datas.balance === null || datas.balance === 0
            ? 0 : datas.balance / Math.pow(10, 18);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressTransactions = async(address) => {
    let endpoint = "?module=account&action=txlistinternal&address=" + address + "&page=1&offset=10&sort=asc";
    let url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(!response.error && response.result !== null) {
            const datas = response.result.splice(0, 10);
            const lastestBlock = await getLatestBlock();            
            datas.forEach(txn => {
                txn.lastestBlock = lastestBlock;
            });
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
        return []
    }
}

const getAddressTokenTransactions = async(address) => {
    let endpoint = "?module=account&action=tokentx&address=" + address + "&startblock=0&endblock=999999999&page=1&offset=10&sort=asc";
    let url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(!response.error && response.result !== null) {
            const datas = response.result.splice(0, 10);
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
        return []
    }
}

const getTransaction = function(hash) {
    let endpoint = "?module=account&action=txlistinternal&txhash="+ hash;
    let url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(!response.error && response.result !== null) {
            const data = response.result;
            data.lastestBlock = await getLatestBlock();
            const transaction = buildTransaction(data);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    const transactions = [];
    const internals = await getAddressTransactions(address);
    if(internals.length > 0) {
        internals.forEach(txn => {
            transactions.push(txn);
        })
    }
    const tokens = await getAddressTokenTransactions(address);
    if(tokens.length > 0) {
        tokens.forEach(txn => {
            transactions.push(txn);
        })
    }

    return transactions;
}

const getTokens = async(address) => {
    const endpoint = "/getAddressInfo/" + address;
    const url = ethplorerBase + endpoint + ethplorerKey;
    
    try{
        const response = await axios.get(url);
        const datas = response.tokens;
        const assets = [];

        datas.forEach(token => {
            const quantity = helperSvc.exponentialToNumber(token.balance);
            quantity = quantity.toString();
            assets.push({
                quantity = this.helperSvc.commaBigNumber(quantity),
                symbol = token.tokenInfo.symbol
            });
        });

        return assets;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    const endpoint = "?module=proxy&action=eth_blockNumber";
    const url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        return response.result;
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn) {
    const decimals = txn.hasOwnPropery('tokenDecimal') 
                ? txn.tokenDecimal : 8;
    const precision = helperSvc.getPrecision(decimals);
    const symbol = txn.hasOwnPropery('tokenSymbol') 
                ? txn.tokenSymbol : "ETH";
    const confirmations = txn.hasOwnPropery('confirmations') 
                ? txn.confirmations : txn.lastestBlock - txn.blockNumber;

    const transaction = {
        hash: txn.hash,
        block: txn.blockNumber,
        quantity: txn.value/precision,
        symbol: symbol,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.timeStamp),
        from: txn.from,
        to: txn.to
    };

    return transaction;
}

module.exports = {
    getBlockchain,
    getAddress,
    getAddressTransactions,
    getTokens,
    getTransaction,
    getTransactions
}