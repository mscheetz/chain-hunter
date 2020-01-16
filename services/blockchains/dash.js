const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://insight.dash.org/insight-api";
const baseBlocks = "https://www.coinexplorer.net/api";
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
                transactionCount: datas.txAppearances,
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

const getBlockHash = async(blockNumber) => {
    let endpoint = `/block-index/${blockNumber}`;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
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
    let block = await getBlockByHash(hash);

    return block;
}

const getBlockByHash = async(hash) => {
    let endpoint = `/block/${hash}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data !== 'undefined' && response.data !== null) {
            const datas = response.data;

            let block = await buildBlock(datas);
            
            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocksInsight = async() => {
    let endpoint = `/blocks`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        let blocks = [];
        if(typeof response.data !== 'undefined' && response.data !== null && response.data.blocks.length > 0) {
            let datas = response.data.blocks;

            datas = datas.slice(0, 20);
            for(let data of datas) {
                let block = await buildBlock(data);
                
                blocks.push(block);
            }
            
        }
        return blocks;
    } catch(error) {
        return [];
    }
}

const getBlocks = async() => {
    let endpoint = `/v1/DASH/block/latest`;
    let url = baseBlocks + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data !== 'undefined' && response.data !== null && response.data.success) {
            const datas = response.data.result;
            
            let blocks = [];
            let ts = datas.time;
            let yr = ts.substr(0,4);
            let mo = ts.substr(5,2);
            let day = ts.substr(8,2);
            let time = ts.substr(11);
            mo = helperSvc.getMonth(mo);
            ts = `${day}-${mo}-${yr} ${time}`;

            let block = {
                blockNumber: datas.height,
                confirmations: 0,
                date: ts,
                hash: datas.hash,
                hasTransactions: true,
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                transactionCount: datas.tx.length,
                volume: datas.transactedInBlock
            };
            
            //block = await buildBlockTransactions(datas, block);

            blocks.push(block);
            
            return blocks;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildBlock = async(datas) => {
    const pool = (typeof datas.poolInfo.poolName !== 'undefined') ? datas.poolInfo.poolName : null;

    let block = {
        blockNumber: datas.height,
        confirmations: datas.confirmations,
        date: helperSvc.unixToUTC(datas.time),
        hash: datas.hash,
        hasTransactions: true,
        size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
        transactionCount: datas.tx.length,
        validator: pool,
        validatorIsAddress: false
    };    
    
    //block = await buildBlockTransactions(datas, block);

    return block;
}

const buildBlockTransactions = async(datas, block) => {
    if(datas.tx.length > 0) {
        let values = [];
        let i = 0;
        let transactions = []
        
        for(let tx of datas.tx) {
            i++;
            if(i === 25) {
                break;
            }
            const txn = await getTransaction(tx);
            if(txn.tos.length > 0) {
                let txnValues = txn.tos.map(t => +t.quantity);
                values = _.concat(values, txnValues);
            }
            transactions.push(txn);
        }
        if(typeof block.volume !== 'undefined'){
            if(block.transactionCount === transactions.length) {
                let quantity = 0;
                if(values.length > 0) {
                    quantity = values.reduce((a, b) => a + b, 0);
                }
                block.volume = quantity;
            }
        }
        block.transactions = transactions;
    }
}

const getBlockTransactions = async(blockNumber) => {
    const hash = await getBlockHash(blockNumber);
    if(hash === null) {
        return [];
    }
    let endpoint = `/block/${hash}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        let transactions = [];
        if(typeof response.data !== 'undefined' && response.data !== null) {
            const datas = response.data;
            let i = 0;
            for(let tx of datas.tx) {
                i++;
                if(i === 25) {
                    break;
                }
                const txn = await getTransaction(tx);
                //console.log(txn);
                if(txn !== null) {
                    transactions.push(txn);
                }
            }
        }
        return transactions;
    } catch(error) {
        return [];
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
        let quantity = output.value;
        let addresses = [];
        if(typeof output.scriptPubKey.addresses !== 'undefined') {
            addresses = output.scriptPubKey.addresses;
        } else {
            if(addresses.length == 0) {
                if(output.scriptPubKey.asm.indexOf("OP_RETURN") >= 0) {
                    addresses.push("OP_RETURN");
                } else {
                    addresses.push("Unknown Address");
                }
            }
        }
        const to = helperSvc.getSimpleIOAddresses(symbol, addresses, quantity);
        tos.push(to);
    })
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: type,
        hash: txn.txid,
        block: txn.blockheight,
        confirmations: txn.confirmations === 0 ? -1 : txn.confirmations,
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
    getBlockTransactions,
    getTransaction,
    getBlocks
}