const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://tracker.icon.foundation/v3";
const enums = require('../../classes/enums');
const _ = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Icon';
    chain.symbol = 'ICX';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);

    let address = null; 
    let transaction = null;
    let contract = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction && address === null && toFind.substr(0, 2) === "0x") {
        transaction = await getTransaction(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    chain.address = address;
    chain.transaction = transaction;
    chain.contract = contract;

    if(chain.address || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/info?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data === null){
            return null;
        } else {
            const datas = response.data.data;
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const address = {
                address: datas.address,
                quantity: total,
                tokens: await tokenConvert(datas.tokenList),
                hasTransactions: true
            };

            return address;
        }
    } catch(error) {
        return null;
    }
}

const tokenConvert = async(tokens) => {
    let assets = [];

    tokens.forEach(token => {
        const quantity = parseFloat(token.quantity);
        const total = helperSvc.commaBigNumber(quantity.toString());
        let asset = {
            quantity: total,
            symbol: token.contractSymbol,
            name: token.contractName
        }
        const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        asset.hasIcon = iconStatus;

        assets.push(asset);
    });

    return assets;
}

const getContract = async(address) => {
    let endpoint = "/contract/info?addr=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data === null) {
            return null;
        } else {
            const datas = response.data.data;
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            let contract = {
                address: datas.address,
                quantity: total,
                symbol: "ICX",
                creator: datas.creator,
                contractName: datas.tokenName
            };
            const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            contract.hasIcon = iconStatus;

            return contract;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let addressTransactions = await getAddressTransactions(address);
    let tokenTransactions = await getTokenTransactions(address);

    if(addressTransactions.length > 0 && tokenTransactions.length > 0) {
        addressTransactions.forEach(txn => {
            let hasCall = false;
            for(let i = 0; i < txn.froms.length; i++) {
                if(txn.froms[i].symbol === "CALL") {
                    hasCall = true;
                    break;
                }
            }

            if(hasCall) {
                const tokenTxn = tokenTransactions.find(t => t.hash === txn.hash);
                txn.froms = tokenTxn.froms;
                txn.tos = tokenTxn.tos;
            }
            txn = helperSvc.inoutCalculation(address, txn);
        });
    }

    return addressTransactions;
}

const getAddressTransactions = async(address) => {
    let endpoint = "/address/txList?address="+ address +"&page=1&count=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null && response.data.data.length > 0) {
            const datas = response.data.data;
            const transactions = [];            
            if(datas.length > 0) {
                const latestBlock = await getLatestBlock();
                datas.forEach(data => {
                    let transaction = buildTransaction(data, latestBlock);

                    //transaction = helperSvc.inoutCalculation(address, transaction);

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

const getTokenTransactions = async(address) => {
    let endpoint = "/address/tokenTxList?address="+ address +"&page=1&count=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null && response.data.data.length > 0) {
            const datas = response.data.data;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTokenTransaction(data));
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
    let endpoint = "/transaction/txDetail?txHash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);        
        if(response.data.data === null) {
            return null;
        } else {
            const datas = response.data.data;
            const transaction = buildTransactionII(datas);

            return transaction;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/block/list?page=1&count=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.data[0].height.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(txn.dataType.toUpperCase(), txn.fromAddr, txn.amount);
    froms.push(from);
    const to = helperSvc.getSimpleIO(txn.dataType.toUpperCase(), txn.toAddr, txn.amount);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    // const quantity = parseFloat(txn.amount);
    // const total = helperSvc.commaBigNumber(quantity.toString());

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.txHash,
        block: txn.height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.height,
        // quantity: total,
        // symbol: txn.dataType.toUpperCase(),
        date: txn.createDate,
        froms: fromData,
        tos: toData
        // from: txn.fromAddr,
        // to: txn.toAddr,
    };

    return transaction;
}

const buildTokenTransaction = function(txn) {
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(txn.contractSymbol, txn.fromAddr, txn.quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(txn.contractSymbol, txn.toAddr, txn.quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    // const quantity = parseFloat(txn.quantity);
    // const total = helperSvc.commaBigNumber(quantity.toString());

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.txHash,
        // quantity: total,
        // symbol: txn.contractSymbol,
        date: txn.createDate,
        froms: fromData, 
        tos: toData
        // from: txn.fromAddr,
        // to: txn.toAddr,
    };

    return transaction;
}

const buildTransactionII = function(txn) {
    let quantity = 0;
    let symbol = "";
    let fromAddress = "";
    let toAddress = "";
    let type = enums.transactionType.TRANSFER;

    if(txn.tokenTxList.length > 0){
        quantity = parseFloat(txn.tokenTxList[0].quantity);
        symbol = txn.tokenTxList[0].symbol.toUpperCase();
        fromAddress = txn.tokenTxList[0].fromAddr;
        toAddress = txn.tokenTxList[0].toAddr;
    } else {
        quantity = parseFloat(txn.amount);
        symbol = txn.dataType.toUpperCase();
        fromAddress = txn.fromAddr;
        toAddress = txn.toAddr;
    }
    if(txn.dataString.indexOf('giveReward') >= 0) {
        type = enums.transactionType.REWARD;
        symbol = null;
        quantity = 0;
    }
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: type,
        hash: txn.txHash,
        block: txn.height,
        confirmations: txn.confirmation,
        date: txn.createDate,
        froms: fromData,
        tos: toData,
        success: txn.status === "Success" ? "success" : "fail"
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getAddressTransactions,
    getTokenTransactions
}