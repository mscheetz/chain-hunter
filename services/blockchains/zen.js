const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.zen-solutions.io/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Horizen';
    chain.symbol = 'Zen';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PRIVACY;
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const quantity = parseInt(datas.balance);
        const balance = helperSvc.commaBigNumber(quantity.toString());
        let address = {
            address: datas.addrStr,
            quantity: balance,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getBlockHash = async(blockNumber) => {    
    let endpoint = `/block-index/${blockNumber}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;

        return datas.blockHash;
    } catch (err) {
        return null;
    }
}

const getBlock = async(blockNumber) => {
    const hash = await getBlockHash(blockNumber);
    if(hash === null) {
        return null;
    }
    
    let endpoint = "/block/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;
        const validator = typeof datas.poolInfo !== 'undefined' && typeof datas.poolInfo.poolName !== 'undefined' 
            ? datas.poolInfo.poolName 
            : null;
            
        let block = {
            blockNumber: blockNumber,
            validator: validator,
            transactionCount: datas.tx.length,
            date: helperSvc.unixToUTC(datas.time),
            size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
            hash: hash,
            hasTransactions: true
        };

        return block;
    } catch (err) {
        return null;
    }
}

const getTransactions = async(address) => {
    let method = "";
    let isBlock = false;
    if(helperSvc.hasLetters(address)) {
        method = "address";
    } else { 
        method = "block";
        isBlock = true;
    }
    let endpoint = `/txs?${method}=${address}&pageNum=0`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.txs.length === 0) {
            return null;
        }
        const datas = response.data.txs;
        let transactions = [];
        datas.forEach(data => {
            let transaction = buildTransaction(data);

            if(!isBlock) {
                transaction = helperSvc.inoutCalculation(address, transaction);
            }

            transactions.push(transaction);
        })

        return transactions;
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        
        const transaction = buildTransaction(datas);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "ZEN";
    let type = enums.transactionType.TRANSFER;

    txn.vin.forEach(input => {
        let address = "";
        let quantity = 0;
        if(typeof input.addr === 'undefined' && typeof input.coinbase !== 'undefined') {
            type = enums.transactionType.MINING;
            address = "coinbase";
            quantity = txn.valueOut;
        } else {
            address = input.addr;
            quantity = parseFloat(input.value);
        }
        let from = helperSvc.getSimpleIO(symbol, address, quantity);
        froms.push(from);
    })
    txn.vout.forEach(output => {
        let quantity = parseFloat(output.value);
        for(let i = 0; i < output.scriptPubKey.addresses.length; i++) {
            let to = helperSvc.getSimpleIO(symbol, output.scriptPubKey.addresses[i], quantity);
            tos.push(to);
        }
    })

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: type,
        hash: txn.txid,
        block: txn.blockheight,
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
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