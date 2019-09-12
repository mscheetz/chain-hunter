const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://horizon.stellar.org";
const enums = require('../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Stellar Lumens';
    chain.symbol = 'XLM';
    chain.hasTokens = true;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PAYMENT;
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
    let endpoint = "/accounts/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const balances = datas.balances;
        let assets = [];
        let total = "0";
        balances.forEach(bal => {
            if(bal.asset_type === "native") {
                total = helperSvc.commaBigNumber(bal.balance.toString());
            } else {
                let asset = buildToken(bal);
                assets.push(asset);
            }
        })
        const cleanedTotal = helperSvc.decimalCleanup(total);

        const address = {
            address: addressToFind,
            quantity: cleanedTotal,
            hasTransactions: true,
            tokens: assets
        };

        return address;
    } catch(error) {
        return null;
    }
}

const buildToken = function(token) {
    const total = helperSvc.commaBigNumber(token.balance.toString());
    let asset = {
        quantity: total,
        symbol: token.asset_code,
        name: token.asset_code
    }
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const getTransactions = async(address) => {
    let endpoint = "/accounts/" + address + "/transactions?limit=10&order=desc";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        const datas = response.data._embedded.records;
        const latestBlock = await getLatestBlock();
        const transactions = [];
        if(datas.length > 0) {
            for(let i = 0; i < datas.length; i++){
                const transaction = await buildTransaction(datas[i], latestBlock);

                transactions.push(transaction);
            }
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const data = response.data;
        const latestBlock = await getLatestBlock();
        let transaction = await buildTransaction(data, latestBlock);

        return transaction;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/ledgers?limit=1&order=desc";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data._embedded.records[0];

        return datas.sequence;
    } catch(error) {
        return 0;
    }
}

const getOperations = async(hash) => {
    let endpoint = "/transactions/" + hash + "/operations";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data._embedded.records;
        let operations = [];
        datas.forEach(data => {
            let operation = buildOperation(data);

            operations.push(operation);
        })

        return operations;
    } catch(error) {
        return null;
    }
}

const buildOperation = function(op) {
    let quantity = "0";
    let from = "";
    let to = "";
    if((typeof op.amount !== 'undefined')) {
        quantity = op.amount;
        from = op.from;
        to = op.to;
    } else if((typeof op.limit !== 'undefined')) {
        quantity = op.limit;
        from = op.trustor;
        to = op.trustee;
    }
    const total = helperSvc.commaBigNumber(quantity);
    const cleanedTotal = helperSvc.decimalCleanup(total);
    let symbol = "XLM";
    if((typeof op.asset_type === 'undefined') && (typeof op.selling_asset_code !== 'undefined')) {
        symbol = op.selling_asset_code;
    } else if (op.asset_type !== "native") {
        symbol = op.asset_type;
    }
    let type = enums.transactionType.PAYMENT
    if(op.type === "manage_offer") {
        type = enums.transactionType.MANAGEOFFER;
    } else if(op.type === "trade") {
        type = enums.transactionType.TRADE;
    } else if(op.type === "change_trust") {
        type = enums.transactionType.CHANGETRUST;
    } else if(op.type === "account_credited") {
        type = enums.transactionType.CREDIT;
    } else if(op.type === "trustline_removed") {
        type = enums.transactionType.TRUSTREMOVED;
    } else if(op.type === "trustline_created") {
        type = enums.transactionType.TRUSTCREATED;
    }

    let operation = {
        type: type,
        symbol: symbol,
        quantity: cleanedTotal,
        from: from,
        to: to
    };

    return operation;
}

const buildTransaction = async(txn, latestBlock) => {
    const operations = await getOperations(txn.id);
    let symbol = "";
    let quantity = "";
    let from = "";
    let to = "";
    if(operations.length === 1) {
        const op = operations[0];
        symbol = op.symbol;
        quantity = op.quantity;
        from = op.from;
        to = op.to;
    } else {
        quantity = "Multiple operations"
        const froms = operations.map(o => o.from);
        from = froms.join(", ");
        const tos = operations.map(o => o.to);
        to = tos.join(", ");
    }
    
    const confirmations = latestBlock - txn.ledger;

    const transaction = {
        hash: txn.hash,
        block: txn.ledger,
        confirmations: confirmations,
        quantity: quantity,
        symbol: symbol,
        date: txn.created_at,
        from: from,
        to: to
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