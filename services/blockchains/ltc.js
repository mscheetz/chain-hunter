const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://insight.litecore.io/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Litecoin';
    chain.symbol = 'LTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
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
    let endpoint = "/addr/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const total = helperSvc.commaBigNumber(datas.balance.toString());

            const address = {
                address: datas.addrStr,
                quantity: total,
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
    let endpoint = "/blocks";
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        const datas = response.data.blocks;
        if(+datas[0].height < +blockNumber) {
            return null;
        }
        const block = datas.filter(d => d.height === +blockNumber);

        if(block.length === 0) {
            return null;
        }
        return block[0].hash;        
    } catch (err) {
        return null;
    }
}

const getBlock = async(blockNumber) => {
    const hash = await blockCheck(blockNumber);
    if(hash === null) {
        return null;
    }
    let endpoint = `/block/${hash}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        
        let validator = null;
        if(typeof datas.poolInfo !== 'undefined') {
            validator = datas.poolInfo.poolName;
        }

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
    let endpoint = "";
    let block = false;
    if(helperSvc.hasLetters(address)) {
        endpoint = "/txs?address=" + address;
    } else {
        const hash = await blockCheck(address);
        if(hash === null) {
            return [];
        }
        block = true;
        endpoint = `/txs?block=${hash}`;
    }
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        const datas = response.data.txs;//.splice(0, 10);
        const transactions = [];
        if(datas.length > 0) {
            datas.forEach(data => {
                let txn = buildTransaction(data);
                if(!block) {
                    txn = helperSvc.inoutCalculation(address, txn);
                }

                transactions.push(txn);
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if( response.data !== null) {
            const transaction = buildTransaction(response.data);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    if(txn != null) {
        let type = enums.transactionType.TRANSFER;
        let froms = [];
        let tos = [];
        const symbol = "LTC";
        txn.vin.forEach(vin => {
            let fromAddress = "";
            if(typeof vin.coinbase !== 'undefined') {
                fromAddress = "coinbase";
                type = enums.transactionType.MINING;
            } else {
                fromAddress = vin.addr;
            }
            const from = helperSvc.getSimpleIO(symbol, fromAddress, vin.value);
            froms.push(from);
        });
        txn.vout.forEach(vout => {
            if(vout.scriptPubKey && vout.scriptPubKey.addresses ) {
                const to = helperSvc.getSimpleIOAddresses(symbol, vout.scriptPubKey.addresses, vout.value);
                tos.push(to);
            }
        });
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

    return null;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}