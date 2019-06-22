const axios = require('axios');
const helperSvc = require('./helperService.js');
const ethscanBase = "https://api.etherscan.io/api";
const ethscanKey = "&apikey=YYT6FH7R4K7WK729Z2ZPTC2ZNTK48WEKHG";
const ethplorerBase = "http://api.ethplorer.io";
const ethplorerKey = "?apiKey=freekey";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ethereum';
    chain.symbol = 'ETH';
    chain.hasTokens = false;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "?module=account&action=balance&address="+ addressToFind +"&tag=latest";
    let url = ethscanBase + endpoint + ethscanKey;

    try {
        const response = await axios.get(url);
        if(response.data.status === "1" || response.data.message === "OK") {            
            const balanceFull = response.data.result;
            let quantity = 0;
            if(balanceFull !== null && balanceFull !== "0") {
                const balInt = parseInt(balanceFull);
                quantity = balInt / Math.pow(10, 18);
            }
            let address = {
                address: addressToFind,
                quantity: quantity
            };

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
        if(!response.data.error && response.data.result !== null) {
            const datas = response.data.result.splice(0, 10);
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
        if(!response.data.error && response.data.result !== null) {
            const datas = response.data.result.splice(0, 10);

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

const getTransaction = async(hash) => {
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
    // const tokens = await getAddressTokenTransactions(address);
    // if(tokens.length > 0) {
    //     tokens.forEach(txn => {
    //         transactions.push(txn);
    //     })
    // }

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
                quantity: helperSvc.commaBigNumber(quantity),
                symbol: token.tokenInfo.symbol
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
        return parseInt(response.data.result);
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn) {
    const decimals = 8;
    if(txn.hasOwnProperty('tokenDecimal')) {
        decimals = txn.tokenDecimal; 
    }
    const precision = helperSvc.getPrecision(decimals);
    const symbol = txn.hasOwnProperty('tokenSymbol') 
                ? txn.tokenSymbol : "ETH";
    const blockNumber = parseInt(txn.blockNumber);
    const confirmations = txn.hasOwnProperty('confirmations') 
                ? txn.confirmations : txn.lastestBlock - blockNumber;

    const transaction = {
        hash: txn.hash,
        block: blockNumber,
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
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getAddressTransactions,
    getTokens,
    getTransaction,
    getTransactions
}