const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://qtum.info/api/";
const enums = require('../classes/enums');
const divisor = 100000000;

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

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let contract = null;
    let transaction = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.contract = contract;
    chain.transaction = transaction;
    
    if(chain.address || chain.contract || chain.transaction) {
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

const getTransactions = async(address) => {
    let endpoint = "/address/" + address + "/txs?limit=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data.transactions;
        let transactions = [];
        for(let i = 0; i < datas.length; i++) {
            let transaction = await getTransaction(datas[i]);

            transaction = helperSvc.inoutCalculation(address, transaction);

            transactions.push(transaction);
        }
        
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

        const transaction = await buildTransaction(datas);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = async(txn) => {
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
        const value = parseFloat(input.value)/divisor;
        const from = helperSvc.getSimpleIO(symbol, input.address, value);
        froms.push(from);
    })
    txn.outputs.forEach(output => {
        if(output.scriptPubKey.type === "evm_call"){
            type = enums.transactionType.CONTRACT;
        }
        if(typeof output.address !== "undefined" && output.value !== "0") {
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