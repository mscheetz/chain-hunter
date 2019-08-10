const axios = require('axios');
const _ = require('lodash');
const helperSvc = require('./helperService.js');
const ethplorerBase = "https://ethplorer.io/service/service.php?data=";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ethereum';
    chain.symbol = 'ETH';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    let chain = await getEmptyBlockchain();

    if(toFind.substr(0,2) === "0x") {
        chain.address = null;
        chain.transaction = null;
        chain.contract = null;

        chain = await ethCheck(chain, toFind);
        if(address === null) {
            await delay(1000);
            const transaction = await getTransaction(toFind);
            chain.transaction = transaction;
            if(transaction === null) {
                await delay(1000);
                const contract = await getContract(toFind);
                chain.contract = contract;
            }
        }
        if(chain.address || chain.transaction || chain.contract) {
            chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
        }
    }
    
    return chain;
}

const ethCheck = async(chain, addressToFind) => {
    let endpoint = addressToFind +"&showTx=all";
    let url = ethplorerBase + endpoint;

    try {
        const response = await axios.get(url);
        const datas = response.data;
        if(_.has(datas, 'isContract')) {
            if(datas.isContract) {
                chain.contract = createContract(datas.token);
            } else {
                let address = {
                    address: addressToFind,
                    quantity: datas.balance,
                    hasTransactions: true
                }
                address.tokens = createTokens(datas);
                address.transactions = createTransactions(datas.transfers);
                chain.address = address;
            }
        } else if(_.has(datas, 'tx')) {
            if(datas.operations.length > 0) {
                chain.transaction = createTokenTransaction(datas.operations[0]);
            } else {
                chain.transaction = createEthTransaction(datas.tx);                
            }
        }
        return chain;
    } catch (error) {
        return chain;
    }
}

const createContract = function(datas) {
    const contract = {
        address: datas.address,
        quantity: datas.totalSupply,
        symbol: datas.symbol,
        creator: datas.owner,
        contractName: datas.name
    };

    return contract;
}

const createTokens = function(datas) {
    let tokens = {};

    return tokens;
}

const createEthTransaction = function(datas) {
    const transaction = {
        hash: datas.transactionHash,
        block: datas.blockNumber,
        quantity: datas.intValue/100000000,
        symbol: symbol,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.timeStamp),
        from: txn.from,
        to: txn.to
    };

    return transaction;
}

const createTokenTransaction = function(datas) {
    const transaction = {
        hash: datas.transactionHash,
        block: datas.blockNumber,
        quantity: datas.intValue/100000000,
        symbol: symbol,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.timeStamp),
        from: txn.from,
        to: txn.to
    };

    return transaction;
}

const createTransactions = function(datas) {
    let transactions = [];

    return transactions;
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