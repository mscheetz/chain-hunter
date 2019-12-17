const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.lisk.io/api";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Lisk';
    chain.symbol = 'LSK';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PROTOCOL;
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
    let endpoint = "/getAccount?address=" + addressToFind;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data;
            const quantity = parseInt(datas.balance)/1000000000;
            const balance = helperSvc.commaBigNumber(quantity.toString());
            let address = {
                address: datas.address,
                quantity: balance,
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

const blockCheck = async(blockNumber) => {
    let endpoint = `/unifiedSearch?q=${blockNumber}`;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        let blockId = 0;
        if(response.data.success && response.data.result.length > 0) {
            for(let res of response.data.result){
                if(res.type === "block"){
                    blockId = res.id;
                    break;
                }
            }
        }

        return blockId;
    } catch (err) {
        return 0;
    }
}

const getBlock = async(blockNumber) => {
    const blockId = await blockCheck(blockNumber);

    if(blockId === 0) {
        return null;
    }

    let endpoint = "/getBlock?blockId=" + blockId;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);

        if(response.data.success) {
            const datas = response.data.block;
            
            let amount = +datas.totalAmount/100000000;
            
            let block = {
                blockNumber: blockNumber,
                validator: datas.generatorId,
                transactionCount: datas.numberOfTransactions,
                date: getTime(datas.timestamp),
                //size: `${helperSvc.commaBigNumber(datas.blockSize.toString())} bytes`,
                hash: blockId,
                hasTransactions: true,
                volume: amount
            };

            let transactions = [];
            if(block.transactionCount > 0) {
                transactions = await getBlockTransactions(blockId);
            }

            block.transactions = transactions;

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlockTransactions = async(blockId) => {
    let endpoint = "/getTransactions?blockId=" + blockId + "&limit=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data.transactions;
            let transactions = [];

            datas.forEach(data => {
                let transaction = buildTransaction(data);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/getTransactions?address=" + address + "&limit=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data.transactions;
            let transactions = [];

            datas.forEach(data => {
                let transaction = buildTransaction(data);
                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/getTransaction?transactionId=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.success) {
            const datas = response.data.transaction;
            
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
    let froms = [];
    let tos = [];
    const symbol = "LSK";
    const quantity = txn.amount/100000000;

    const from = helperSvc.getSimpleIO(symbol, txn.senderId, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.recipientId, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.id,
        date: getTime(txn.timestamp),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const getTime = function(ts) {
    return helperSvc.unixToUTC(ts + 1464109200);
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}