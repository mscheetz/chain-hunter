const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explore.veforge.com/api";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'VeChain';
    chain.symbol = 'VET';
    chain.hasTokens = true;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.ENTERPRISE;
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

const getAddress = async(address) => {
    let endpoint = "/accounts/" + address;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const balance = getBalance(datas.balance);

            let addressData = {
                address: datas.id,
                quantity: balance,
                hasTransactions: true
            };
            const energy = getEnergy(datas.energy);
            let tokens = await getTokens(address);
            tokens.push(energy);

            addressData.tokens = tokens;

            return addressData;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBalance = function(quantity) {
    const exponential = helperSvc.exponentialToNumber(quantity);
    const newQuantity = helperSvc.bigNumberToDecimal(exponential, 18);
    const balance = helperSvc.commaBigNumber(newQuantity.toString());    
    const cleanBalance = helperSvc.decimalCleanup(balance);

    return cleanBalance;
}

const getEnergy = function(energy) {
    const balance = getBalance(energy);

    const asset = {
        quantity: balance,
        name: "VeThor",
        symbol: "VTHO"
    };
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const getTokens = async(address) => {
    let endpoint = "/accounts/" + address + "/tokenBalances";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== "undefined") {
            const datas = response.data;
            const tokenDetails = await getTokenDetails();
            const tokens = buildAssets(tokenDetails, datas);

            return tokens;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildAssets = function(details, balances) {
    let assets = [];
    for(const [key, value] of Object.entries(balances)) {
        const detail = details.find(d => d.address === key);
        const balance = getBalance(value);

        if(detail !== "undefined") {
            let asset = {
                quantity: balance,
                name: detail.name,
                symbol: detail.symbol
            };
            const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            asset.hasIcon = iconStatus;    
    
            assets.push(asset);
        }
    }

    return assets;
}

const getTokenDetails = async() => {
    let endpoint = "/contractData";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const tokenDetails = buildTokenDetails(datas);

            return tokenDetails;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTokenDetails = function(tokens) {
    let tokenDetails = [];
    for(const [key, value] of Object.entries(tokens)) {
        const token = value.metadata;
        const tokenDetail = buildTokenDetail(key, token);
        
        tokenDetails.push(tokenDetail);
    }

    return tokenDetails;
}

const buildTokenDetail = function(address, token) {
    const detail = {
        address: address,
        name: token.tokenName,
        symbol: token.tokenSymbol
    };

    return detail;
}

const getLatestBlock = async() => {
    let endpoint = "/clientInit";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;

            return datas.bestBlockNum;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/transactions?address=" + address + "&count=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.transactions.length > 0) {
            const datas = response.data.transactions;
            const latestBlock = await getLatestBlock();
            const transactions = buildTransactions(datas, latestBlock);

            return transactions;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransactions = function(txns, latestBlock) {
    let transactions = [];

    txns.forEach(txn => {
        const transaction = buildTransaction(txn, latestBlock);

        transactions.push(transaction);
    })

    return transactions;
}

const buildTransaction = function(txn, latestBlock) {
    const quantity = getBalance(txn.totalValue);
    const ts = helperSvc.unixToUTC(txn.timestamp)
    let to = [];
    txn.clauses.forEach(clause => {
        if(to.indexOf(clause.to) < 0 || to.length === 0) {
            to.push(clause.to);
        }
    });
    const confirmations = latestBlock > 0 ? (latestBlock - txn.block) : null;

    let transaction = {
        hash: txn.id,
        block: txn.block,
        confirmations: confirmations,
        quantity: quantity,
        symbol: "VET",
        date: ts,
        from: txn.origin,
        to: to.join(", ")
    };

    return transaction;
}

const getTransaction = async(hash) => {
    let endpoint = "/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transaction = {};
            if(datas.totalValue === 0) {
                transaction = await getTokenTransaction(hash, latestBlock);
            } else {
                transaction = buildTransaction(datas, latestBlock);
            }

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokenTransaction = async(hash, latestBlock) => {
    let endpoint = "/tokenTransfers?transactionId=" + hash + "&count=15&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.tokenTransfers.length > 0) {
            const datas = response.data.tokenTransfers[0];
            const tokenDetails = await getTokenDetails();
            const transaction = buildTokenTransaction(datas, tokenDetails, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTokenTransaction = function(txn, details, latestBlock) {
    const quantity = "Token Transfer";//getBalance(txn.totalValue);
    const ts = helperSvc.unixToUTC(txn.timestamp)
    const detail = details.find(d => d.address === txn.contractAddress);
    const confirmations = latestBlock > 0 ? (latestBlock - txn.block) : null;

    let transaction = {
        hash: txn.id,
        block: txn.block,
        confirmations: confirmations,
        quantity: quantity,
        symbol: detail.symbol,
        date: ts,
        from: txn.origin,
        to: txn.receiver
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction
}