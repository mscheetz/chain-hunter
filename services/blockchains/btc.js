const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://blockchain.info";
const enums = require('../../classes/enums');
const _  = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Bitcoin';
    chain.symbol = 'BTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let block = null;
    let address = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.block = block;
    chain.address = address;
    chain.transaction = transaction;
    
    if(chain.block || chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getBlock = async(blockNumber) => {
    let endpoint = `/block-height/${blockNumber}?format=json`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data !== "undefined" && response.data !== null && response.data.blocks !== null && response.data.blocks.length > 0) {
            const datas = response.data.blocks[0];
            
            let ts = datas.time;
            let block = {
                //validator: datas.Generator,
                transactionCount: datas.n_tx,
                date: helperSvc.unixToUTC(datas.time),
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                hash: datas.hash,
                hasTransactions: true
            };

            if(datas.tx.length > 0) {
                const latestblock = await getLatestBlock();
                const confirmations = latestblock - blockNumber;
                let values = [];
                let i = 0;
                let transactions = []
                
                datas.tx.forEach(txn => {
                    if(txn.out.length > 0) {
                        let txnValues = txn.out.map(o => o.value);
                        values = _.concat(values, txnValues);
                    }
                    if(i < 10) {
                        let transaction = buildTransaction(txn, latestblock);
                        transaction.confirmations = confirmations;
                        transaction.block = blockNumber;
                        transactions.push(transaction);
                    }
                    i++;
                });
                
                if(values.length > 0) {
                    const summed = values.reduce((a, b) => a + b, 0);
                    const quantity = summed/100000000;
                    const total = helperSvc.commaBigNumber(quantity.toString());

                    block.txnVolume = total;
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

const getAddress = async(addressToFind) => {
    let endpoint = "/rawaddr/" + addressToFind + "?limit=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const quantity = datas.final_balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: datas.address,
                quantity: total,
                hasTransactions: true
            };
            const latestblock = await getLatestBlock();
            const txns = datas.txs.slice(0, 10);
            address.transactions = getTransactions(txns, latestblock, datas.address);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = function(txns, latestblock, address) {
    let transactions = [];
    txns.forEach(txn => {
        let transaction = buildTransaction(txn, latestblock);
        transaction = helperSvc.inoutCalculation(address, transaction);
        
        transactions.push(transaction);
    });

    return transactions;            
}

const getTransaction = async(hash) => {
    let endpoint = "/rawtx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data !== null) {
            const data = response.data;

            const latestblock = await getLatestBlock();
            const transaction = buildTransaction(data, latestblock);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/latestblock";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const data = response.data;

            return data.height;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestblock) {
    let froms = [];
    let tos = [];
    txn.inputs.forEach(input => {
        let from = null;
        if(typeof input.prev_out === "undefined") {
            from = {
                addresses: ["coinbase"]
            }
        } else {
            from = helperSvc.getIO("BTC", input, true);
        }
        froms.push(from);
    });
    txn.out.forEach(output => {
        const to = helperSvc.getIO("BTC", output, false);
        tos.push(to);
    });

    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);
    
    const confirmations = latestblock > 0 ? latestblock - txn.block_height : null;
    
    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.block_height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.time),
        froms: fromDatas,
        tos: toDatas
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