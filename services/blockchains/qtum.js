const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://qtum.info/api";
const enums = require('../../classes/enums');
const divisor = 100000000;
const _ = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'QTUM';
    chain.symbol = 'QTUM';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let contract = null;
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
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.contract = contract;
    chain.transaction = transaction;
    
    if(chain.address || chain.block || chain.contract || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data;
        const quantity = parseInt(datas.balance)/divisor;
        const total = helperSvc.commaBigNumber(quantity.toString());
        const cleanedTotal = helperSvc.decimalCleanup(total);
        const tokens = buildTokens(datas);
        
        let address = {
            address: addressToFind,
            quantity: cleanedTotal,
            hasTransactions: true,
            tokens: tokens
        };

        return address;
    } catch(error) {
        return null;
    }
}

const buildTokens = function(datas) {
    let assets = [];
    if(datas.qrc20Balances.length > 0) {
        datas.qrc20Balances.forEach(bal => {
            const quantity = helperSvc.bigNumberToDecimal(bal.balance, bal.decimals);
            const total = helperSvc.commaBigNumber(quantity);
            const cleanedTotal = helperSvc.decimalCleanup(total);
            let asset = {
                quantity: cleanedTotal,
                symbol: bal.symbol,
                name: bal.name
            }
            const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            asset.hasIcon = iconStatus;

            assets.push(asset);
        });
    }
    if(datas.qrc721Balances.length > 0) {
        datas.qrc721Balances.forEach(bal => {
            const quantity = helperSvc.bigNumberToDecimal(bal.balance, bal.decimals);
            const total = helperSvc.commaBigNumber(quantity);
            const cleanedTotal = helperSvc.decimalCleanup(total);
            let asset = {
                quantity: cleanedTotal,
                symbol: bal.symbol,
                name: bal.name
            }
            const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            asset.hasIcon = iconStatus;

            assets.push(asset);
        })
    }
    return assets;
}

const getBlock = async(blockNumber) => {
    let endpoint = "/block/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;

        let block = {
            blockNumber: blockNumber,
            validator: datas.miner,
            transactionCount: datas.transactions.length,
            date: helperSvc.unixToUTC(datas.timestamp),
            size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
            hash: datas.hash,
            hasTransactions: true
        };

        let transactions = [];
        if(datas.transactions.length > 0) {
            let values = [];
            const txns = datas.transactions.join(",");

            transactions = await getMultipleTransactions(txns, false);

            transactions.forEach(txn => {
                if(txn.tos.length > 0) {
                    const tos = txn.tos.filter(t => t.symbol === 'QTUM');
                    if(tos.length > 0) {
                        let txnValues = tos.map(t => +t.quantity.replace(/,/g, ""));
                        values = _.concat(values, txnValues);
                    }
                }
            });
            if(block.transactionCount === transactions.length) {
                let quantity = 0;
                if(values.length > 0) {
                    quantity = values.reduce((a, b) => a + b, 0);
                }
                block.volume = quantity;
            }
        }

        block.transactions = transactions;
        return block;
    } catch(error) {
        return null;
    }
}

const getMultipleTransactions = async(hashes, address = "") => {
    let endpoint = "/txs/" + hashes;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url, { timeout: 5000 });
    
        const datas = response.data;

        let transactions = [];
        datas.forEach(data => {
            let transaction = buildTransaction(data);
            if(address != "") {
                transaction = helperSvc.inoutCalculation(address, transaction);
            }
            transactions.push(transaction);
        })

        return transactions;
    } catch(err) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/address/" + address + "/txs?limit=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data.transactions;
        
        const hashes = datas.join(",");
        const transactions = await getMultipleTransactions(hashes, address);
        
        return transactions;
    } catch(error) {
        return null;
    }
}

const getContract = async(addressToFind) => {
    let endpoint = "/contract/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data;
        const supply = helperSvc.bigNumberToDecimal(datas.qrc20.totalSupply, datas.qrc20.decimals);
        const quantity = helperSvc.commaBigNumber(supply.toString());
        
        let contract = {
            address: datas.address,
            quantity: quantity,
            symbol: datas.qrc20.symbol,
            contractName: datas.qrc20.name
        };
        const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        contract.hasIcon = iconStatus;

        return contract;
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        
        const datas = response.data;

        const transaction = buildTransaction(datas);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {    
    const symbol = "QTUM";
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;
    if(typeof txn.qrc20TokenTransfers !== 'undefined') {
        txn.qrc20TokenTransfers.forEach(xfer => {
            const value = helperSvc.bigNumberToDecimal(xfer.value, xfer.decimals);
            const from = helperSvc.getSimpleIO(xfer.symbol, xfer.from, value);
            froms.push(from);
            const to = helperSvc.getSimpleIO(xfer.symbol, xfer.to, value);
            tos.push(to);
        })
    }
    txn.inputs.forEach(input => {
        if(typeof input.coinbase !== 'undefined') {
            type = enums.transactionType.MINING;
            const from = {
                addresses: ["coinbase"]
            }
            froms.push(from);
        }
        if(typeof input.value !== 'undefined'){
            const value = parseFloat(input.value)/divisor;
            const from = helperSvc.getSimpleIO(symbol, input.address, value);
            froms.push(from);
        }
    })
    txn.outputs.forEach(output => {
        if(output.scriptPubKey.type === "evm_call"){
            type = enums.transactionType.CONTRACT;
        }
        if(typeof output.address !== "undefined" && output.value !== "0" && output.scriptPubKey.type !== "empty" && output.scriptPubKey.type !== "nulldata") {
            const value = parseFloat(output.value)/divisor;
            const to = helperSvc.getSimpleIO(symbol, output.address, value);
            tos.push(to);
        }
    });

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const date = (typeof txn.timestamp !== 'undefined') && txn.timestamp > 0 ? helperSvc.unixToUTC(txn.timestamp) : 'new transaction';

    let transaction = {
        type: type,
        hash: txn.hash,
        block: txn.blockHeight,
        confirmations: txn.confirmations,
        date: date,
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
    getContract,
    getTransaction
}