const axios = require('axios');
const helperSvc = require('./helperService.js');
const apiKey = "67de405a0cb8a9e2fe5e33000cf9a88a";
const base = "https://api.iostabc.com/api/?apikey=" + apiKey;
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'IOST';
    chain.symbol = 'IOST';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.contract = null;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let transaction = null;
    let contract = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction) {
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
    let endpoint = "&module=account&action=get-account-balance&account=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;
        const total = helperSvc.commaBigNumber(datas.balance.toString());

        const address = {
            address: addressToFind,
            quantity: total,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "&module=contract&action=get-contract-detail&contract=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;
        if(Object.entries(datas).length === 0 && datas.constructor === Object) {
            return null;
        } else {
            let contract = {
                address: datas.contract_id,
                creator: datas.publisher,
                quantity: null,
                symbol: null,
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
    let endpoint = "&module=account&action=get-account-tx&account=" + address + "&size=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data.transactions !== null && response.data.data.transactions.length > 0) {
            const datas = response.data.data.transactions;
            const transactions = [];
            const latestBlock = await getLatestBlock();
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data, latestBlock));
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
    let endpoint = "&module=transaction&action=get-transaction-detail&tx_hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;

        if(Object.entries(datas).length === 0 && datas.constructor === Object) {
            return null;
        } else {
            const latestBlock = await getLatestBlock();
            const transaction = buildTransactionII(datas, latestBlock);

            return transaction;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address, contract) => {    
    let endpoint = "&module=account&action=get-token-list&account=" + address;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        const datas = response.data.data;
        let assets = [];

        for(let i = 0; i < datas.tokens.length; i++) {
            const qty = helperSvc.commaBigNumber(datas.tokens[i].balance.toString());

            let asset = {
                quantity: qty,
                symbol: datas.tokens[i].symbol,
                name: datas.tokens[i].symbol
            };
            const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            asset.hasIcon = iconStatus;
            
            assets.push(asset);
        }

        return assets;

    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "&module=block&action=get-latest-block";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.data.block.number;
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const block = parseInt(txn.block);
    const confirmations = latestBlock - block;
    const datas = JSON.parse(txn.data);
    const quantity = parseFloat(datas[3]);
    const total = helperSvc.commaBigNumber(quantity.toString());

    const transaction = {
        hash: txn.tx_hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        quantity: total,
        symbol: datas[0].toUpperCase(),
        date: txn.created_at,
        from: txn.from,
        to: txn.to,
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const block = parseInt(txn.block_number);
    const confirmations = latestBlock - block;
    const ts = txn.transaction.time.toString().substr(0, 10);
    const datas = JSON.parse(txn.transaction.actions[0].data);
    const quantity = parseFloat(datas[3]);
    const total = helperSvc.commaBigNumber(quantity.toString());

    const transaction = {
        hash: txn.transaction.hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        quantity: total,
        symbol: datas[0].toUpperCase(),
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: datas[1],
        to: datas[2],
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction,
    getContract
}