const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://roma-net.mdw.aepps.com";
const enums = require('../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Aeternity';
    chain.symbol = 'AE';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PLATFORM;
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
    let endpoint = "/v2/accounts/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const quantity = datas.balance/1000000000000000000;
        const total = helperSvc.commaBigNumber(quantity.toString());
        const address = {
            address: datas.id,
            quantity: total,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/v2/key-blocks/current/height";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.height;
    } catch(error) {
        return 0;
    }
}

const getBlock = async(block) => {
    let endpoint = "/v2/generations/height/" + block;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data.key_block !== "undefined") {
            return response.data.key_block;
        }
        else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlockTime = async(block) => {
    const blockInfo = await getBlock(block);

    return blockInfo === null ? 0 : blockInfo.time;
}

const getTransactions = async(address) => {
    let endpoint = "/middleware/transactions/account/" + address + "?limit=10&page=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(data => {
                let transaction = buildTransaction(data, "", latestBlock, 0);
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
    let endpoint = "/v2/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const latestBlock = await getLatestBlock();
        const txnBlockTime = await getBlockTime(datas.block_height);
        const transaction = buildTransaction(datas, hash, latestBlock, txnBlockTime);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn, hash, latestBlock, blockTime) {
    let ts = "";
    let froms = [];
    let tos = [];
    const symbol = "AE";

    const quantity = txn.tx.amount/1000000000000000000;
    const from = helperSvc.getSimpleIO(symbol, txn.tx.sender_id, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.tx.recipient_id, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    if(typeof txn.time !== "undefined") {
        ts = txn.time.toString().substr(0,10);
    } else if(blockTime > 0){
        ts = blockTime.toString().substr(0,10);
    }
    const total = helperSvc.commaBigNumber(quantity.toString());

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: hash === "" ? txn.hash : hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        date: helperSvc.unixToUTC(ts),
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
    getTransaction
}