const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://api.viewblock.io/v1/zilliqa";
const enums = require('../../classes/enums');
const config = require('../../config');
const apiKey = config.ZIL_API_KEY;

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Zilliqa';
    chain.symbol = 'Zil';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;

    if(chain.address || chain.block || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/addresses/" + addressToFind;
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        const datas = response.data[0];
        
        const decimaled = helperSvc.bigNumberToDecimal(datas.balance, 12);
        const balance = helperSvc.commaBigNumber(decimaled.toString());
        
        let address = {
            address: addressToFind,
            quantity: balance,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {    
    let endpoint = "/stats/";
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        return response.data.txHeight;
    } catch (err) {
        return 0;
    }
}

const getBlock = async(blockNumber) => {    
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        const datas = response.data;
        const latestBlock = await getLatestBlock();

        let block = buildBlock(datas, latestBlock);

        return block;
    } catch (err) {
        return null;
    }
}

const getBlocks = async() => {
    let blockNumber = await getLatestBlock();
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        const datas = response.data;
        const latestBlock = blockNumber;
        let blocks = [];

        let block = buildBlock(datas, latestBlock);

        blocks.push(block);

        return blocks;
    } catch (err) {
        return [];
    }

}

const buildBlock = function(data, latestBlock) {
    let ts = data.timestamp/1000;

    let block = {
        blockNumber: data.height,
        transactionCount: data.txCount,
        confirmations: latestBlock - data.height,
        date: helperSvc.unixToUTC(ts),
        hasTransactions: false
    };

    return block;    
}

const getTransactions = async(address) => {
    let endpoint = "/addresses/" + address + "/txs";
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        if(response.data.length === 0) {
            return null;
        }
        const latestBlock = await getLatestBlock();
        const datas = response.data.slice(0, 10);
        let transactions = [];
        datas.forEach(data => {
            let transaction = buildTransaction(data, latestBlock);

            transaction = helperSvc.inoutCalculation(address, transaction);

            transactions.push(transaction);
        })

        return transactions;
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/txs/" + hash;
    let url = base + endpoint;

    try{
        let options = {
            headers: {
                'X-APIKEY': apiKey
            }
        }
        const response = await axios.get(url, options);
        const datas = response.data;
        const latestBlock = await getLatestBlock();
        
        const transaction = buildTransaction(datas, latestBlock);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn, latestBlock) {
    let froms = [];
    let tos = [];
    const symbol = "ZIL";
    const decimals = 12;
    let type = enums.transactionType.TRANSFER;
    const qty = helperSvc.bigNumberToDecimal(txn.value, decimals);
    const total = helperSvc.commaBigNumber(qty.toString());
    const cleanedTotal = helperSvc.decimalCleanup(total);

    const from = helperSvc.getSimpleIO(symbol, txn.from, cleanedTotal);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.to, cleanedTotal);
    tos.push(to);
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: type,
        hash: txn.hash,
        block: txn.blockHeight,
        confirmations: latestBlock - txn.blockHeight,
        date: helperSvc.unixToUTC(txn.timestamp),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getBlocks
}