const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://insight.dash.org/insight-api";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Dash';
    chain.symbol = 'DASH';
    chain.hasTokens = false;
    chain.hasContracts = false;
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
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

const getBlock = async(blockNumber) => {
    let endpoint = `/block/${blockNumber}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data !== 'undefined' && response.data !== null) {
            const datas = response.data;
            const pool = (typeof datas.poolInfo.poolName !== 'undefined') ? datas.poolInfo.poolName : null;

            let block = {
                blockNumber: blockNumber,
                confirmations: datas.confirmations,
                date: helperSvc.unixToUTC(datas.time),
                hash: datas.hash,
                hasTransactions: true,
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                transactionCount: datas.tx.length,
                validator: pool,
            };
            
            if(datas.tx.length > 0) {
                let values = [];
                let i = 0;
                let transactions = []
                
                for(let i = 0; i < 10; i++) {
                    const txn = await getTransaction(datas.tx[i]);

                    if(txn.tos.length > 0) {
                        let txnValues = txn.tos.map(t => +t.quantity);
                        values = _.concat(values, txnValues);
                    }
                    transactions.push(txn);
                }
                if(block.transactionCount === transactions.length) {
                    let quantity = 0;
                    if(values.length > 0) {
                        quantity = values.reduce((a, b) => a + b, 0);
                    }
                    block.volume = quantity;
                }
                block.transactions = transactions;
            }
            
            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}


const getTransactions = async(address) => {
    let endpoint = "/txs?address="+ address +"&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
            const datas = response.data.txs;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data);

                    transaction = helperSvc.inoutCalculation(address, transaction);

                    transactions.push(transaction);
                })
            }

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.status === 200) {
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

const buildTransaction = function(txn) {
    let froms = [];
    let tos = [];
    const symbol = "DASH";
    let type = enums.transactionType.TRANSFER;
    txn.vin.forEach(input => {
        let fromAddress = "";
        if(typeof input.addr !== 'undefined'){
            fromAddress = input.addr
        }
        if(fromAddress === "" && typeof input.coinbase !== 'undefined') {
            type = enums.transactionType.MINING;
            fromAddress = "coinbase";
        }
        const from = helperSvc.getSimpleIO(symbol, fromAddress, input.value);
        froms.push(from);
    });
    txn.vout.forEach(output => {
        const to = helperSvc.getSimpleIOAddresses(symbol, output.scriptPubKey.addresses, output.value);
        tos.push(to);
    })
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
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