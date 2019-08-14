const axios = require('axios');
const helperSvc = require('./helperService.js');
const ethscanBase = "https://api.etherscan.io/api";
const ethscanKey = "&apikey=YYT6FH7R4K7WK729Z2ZPTC2ZNTK48WEKHG";
const ethplorerBase = "http://api.ethplorer.io";
const ethplorerKey = "?apiKey=freekey";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ethereum';
    chain.symbol = 'ETH';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let transaction = null;
    let contract = null;

    if(toFind.substr(0,2) === "0x") {
        const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

        if(searchType & enums.searchType.address) {
            address = await getAddress(toFind);
        }
        if(searchType & enums.searchType.transaction) {
            transaction = await getTransaction(toFind);
        }
        if(searchType & enums.searchType.contract) {
            await delay(1000);
            contract = await getContract(toFind);
        }
        
        chain.address = address;
        chain.transaction = transaction;
        chain.contract = contract;

        if(chain.address || chain.transaction || chain.contract) {
            chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
        }
    }
    
    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "?module=account&action=balance&address="+ addressToFind +"&tag=latest";
    let url = ethscanBase + endpoint + ethscanKey;

    try {
        const response = await axios.get(url);
        if((response.data.status === "1" || response.data.message === "OK") && response.data.result !== "0") {            
            const balanceFull = response.data.result;
            let quantity = 0;
            if(balanceFull !== null && balanceFull !== "0") {
                const balInt = parseInt(balanceFull);
                quantity = balInt / Math.pow(10, 18);
            }
            let address = {
                address: addressToFind,
                quantity: quantity,
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

const getContract = async(addressToFind) => {
    let endpoint = "?module=contract&action=getsourcecode&address="+ addressToFind +"&tag=latest";
    let url = ethscanBase + endpoint + ethscanKey;

    try {
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const name = response.data.result[0].ContractName;
            let contract = {
                address: addressToFind,
                quantity: null,
                symbol: null,
                creator: null,
                contractName: name

            };

            return contract;
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
            let datas = response.data.result.splice(0, 10);
            const lastestBlock = await getLatestBlock();
            let blockNos = [];
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
    let endpoint = "?module=proxy&action=eth_getTransactionByHash&txhash=" + hash;
    let url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(!response.data.error && response.data.result !== null) {
            let data = response.data.result;
            data.lastestBlock = await getLatestBlock();
            const blockData = await getBlock(data.blockNumber);
            data.timeStamp = blockData.timestamp;
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
        const datas = response.data.tokens;
        const assets = [];

        datas.forEach(token => {
            let quantity = helperSvc.exponentialToNumber(token.balance);
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

const getBlock = async(blockNumber) => {
    const endpoint = "?module=proxy&action=eth_getBlockByNumber&tag="+ blockNumber +"&boolean=true";
    const url = ethscanBase + endpoint + ethscanKey;

    try{
        const response = await axios.get(url);
        if(!response.data.error && response.data.result !== null) {
            const data = response.data.result.timestamp;
            const block = {
                blockHex: blockNumber,
                blockNumber: parseInt(blockNumber, 16),
                timestamp:  parseInt(data)
            };
            return block;
        }
    } catch(error) {
        return null;
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
    const txnQty = txn.hasOwnProperty('value') ? txn.value : txn.value/precision;
    const quantity = parseInt(txnQty) / Math.pow(10,10);

    const transaction = {
        hash: txn.hash,
        block: blockNumber,
        quantity: quantity,
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