const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://horizon.stellar.org";
const enums = require('../../classes/enums');

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

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
                let transaction = await buildTransaction(datas[i], latestBlock, address);

                transaction = helperSvc.inoutCalculation(address, transaction);

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

const getOperations = async(hash, address = null) => {
    let endpoint = "/transactions/" + hash + "/operations?limit=200";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data._embedded.records;
        let operations = [];
        datas.forEach(data => {
            let operation = buildOperation(data, address);

            if(operation !== null) {
                operations.push(operation);
            }
        })

        return operations;
    } catch(error) {
        return null;
    }
}

const buildOperation = function(op, address = null) {
    let quantity = "0";
    let fromAddress = "";
    let toAddress = "";
    let froms = [];
    let tos = [];
    let symbol = "XLM";
    if((typeof op.asset_type === 'undefined') && (typeof op.selling_asset_code !== 'undefined')) {
        symbol = op.selling_asset_code;
    } else if((typeof op.asset_type === 'undefined') && (typeof op.buying_asset_code !== 'undefined')) {
        symbol = op.buying_asset_code;
    } else if ((typeof op.asset_type !== 'undefined') && op.asset_type !== "native") {
        symbol = op.asset_code;
    }
    if((typeof op.amount !== 'undefined')) {
        quantity = op.amount;
    } else if((typeof op.limit !== 'undefined')) {
        quantity = op.limit;
    } else {
        quantity = op.starting_balance;
    }
    if(typeof op.from !== 'undefined') {
        fromAddress = op.from;
    } else if (typeof op.trustor !== 'undefined') {
        fromAddress = op.trustor;
    } else if (typeof op.source_account !== 'undefined') {
        fromAddress = op.source_account;
    }
    if(typeof op.to !== 'undefined') {
        toAddress = op.to;
    } else if (typeof op.trustee !== 'undefined') {
        toAddress = op.trustee;
    } else if (typeof op.account !== 'undefined') {
        toAddress = op.account;
    } else if (typeof op.selling_asset_issuer !== 'undefined') {
        toAddress = op.selling_asset_issuer;
    } else if (typeof op.buying_asset_issuer !== 'undefined') {
        toAddress = op.buying_asset_issuer;
    }
    let operation = null;

    if(address === null || (address === fromAddress || address === toAddress)){
        const from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
        tos.push(to);
        
        const fromData = helperSvc.cleanIO(froms);
        const toData = helperSvc.cleanIO(tos);
        
        let type = enums.transactionType.PAYMENT
        if(op.type === "manage_offer") {
            type = enums.transactionType.MANAGEOFFER;
        } else if(op.type === "manage_buy_offer") {
            type = enums.transactionType.MANAGEBUYOFFER;
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
        } else if(op.type === "create_account") {
            type = enums.transactionType.CREATE_ACCOUNT;
        }

        operation = {
            type: type,
            froms: fromData,
            tos: toData,
        };
    }
    return operation;
}

const buildTransaction = async(txn, latestBlock, address = null) => {
    const operations = await getOperations(txn.id, address);    
    let froms = [];
    let tos = [];
    let type = null;
    
    if(operations !== null) {
        operations.forEach(op => {
            if(type === null) {
                type = op.type;
            }
            froms.push(...op.froms);
            tos.push(...op.tos);
        })
    }
    
    const confirmations = latestBlock - txn.ledger;

    const transaction = {
        type: type,
        hash: txn.hash,
        block: txn.ledger,
        confirmations: confirmations,
        date: txn.created_at,
        froms: froms,
        tos: tos
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