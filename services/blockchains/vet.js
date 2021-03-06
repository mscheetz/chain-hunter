const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://sync-mainnet.vechain.org";// "https://explore.veforge.com/api";
const enums = require('../../classes/enums');
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

const getAddress = async(address) => {
    let endpoint = "/accounts/" + address;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const balance = getBalance(datas.balance);

            let addressData = {
                address: address,
                quantity: balance,
                hasTransactions: true
            };
            const energy = getEnergy(datas.energy);
            let tokens = []; //await getTokens(address);
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

const getBlock = async(blockNumber) => {
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();

            const block = buildBlock(datas, latestBlock);

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = "/blocks/best";
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            let blocks = [];
            const datas = response.data;
            const latestBlock = datas.number;

            const block = buildBlock(datas, latestBlock);
            blocks.push(block);

            return blocks;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildBlock = function(data, latestBlock) {    
    let block = {
        blockNumber: data.number,
        validator: data.signer,
        validatorIsAddress: true,
        transactionCount: data.transactions.length,
        confirmations: latestBlock - data.number,
        date: helperSvc.unixToUTC(data.timestamp),
        size: `${helperSvc.commaBigNumber(data.size.toString())} bytes`,
        hash: data.id,
        hasTransactions: true
    };

    return block;
}

const getBlockTransactions = async(blockNumber) => {
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.data !== null && response.data.transactions.length > 0) {
            const hashes = response.data.transactions;
            const latestBlock = await getLatestBlock();

            for(let hash of hashes) {
                const transaction = await getTransaction(hash, latestBlock);

                transactions.push(transaction);
            }
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getBalance = function(hex) {
    const quantity = helperSvc.hexToNumber(hex);
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
    let endpoint = "/blocks/best";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;

            return datas.number;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const getLatestBlockOG = async() => {
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
    let endpoint = "/logs/transfer";
    let url = base + endpoint;
    let data = {
        options: {
            offset: 0,
            limit: 50
        },
        criteriaSet: [
            {
                sender: address
            },
            {
                recipient: address
            }
        ],
        order: "desc"
    };

    try {
        const response = await axios.post(url, data);
        let transactions = [];
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();

            for(let txn of datas) {
                let transaction = buildTransactionII(txn, latestBlock);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            }
        }
        return transactions;
    } catch(err) {
        return [];
    }
}

const getTransactionsOG = async(address) => {
    let endpoint = "/transactions?address=" + address + "&count=10&offset=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.transactions.length > 0) {
            const datas = response.data.transactions;
            const latestBlock = await getLatestBlock();
            const transactions = buildTransactions(datas, latestBlock, address);

            return transactions;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransactions = function(txns, latestBlock, address) {
    let transactions = [];

    txns.forEach(txn => {
        let transaction = buildTransaction(txn, latestBlock);

        transaction = helperSvc.inoutCalculation(address, transaction);

        transactions.push(transaction);
    })

    return transactions;
}

const buildTransaction = function(txn, latestBlock) {
    const quantity = getBalance(txn.totalValue);
    const ts = helperSvc.unixToUTC(txn.timestamp)
    let froms = [];
    let tos = [];
    const symbol = "VET";
    const from = helperSvc.getSimpleIO(symbol, txn.origin, quantity);
    froms.push(from);
    txn.clauses.forEach(clause => {
        const to = helperSvc.getSimpleIO(symbol, clause.to, quantity);
        tos.push(to);
    });
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const confirmations = latestBlock > 0 ? (latestBlock - txn.block) : null;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.id,
        block: txn.block,
        confirmations: confirmations,
        date: ts,
        froms: fromData,
        tos: toData
    };

    return transaction;
}


const buildTransactionII = function(txn, latestBlock) {
    const quantity = getBalance(txn.amount);
    let froms = [];
    let tos = [];
    const symbol = "VET";
    const from = helperSvc.getSimpleIO(symbol, txn.sender, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.recipient, quantity);
    tos.push(to);
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const confirmations = latestBlock > 0 ? (latestBlock - txn.meta.blockNumber) : null;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.meta.txID,
        block: txn.meta.blockNumber,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.meta.blockTimestamp),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const buildTransactionIII = function(txn, latestBlock) {
    let froms = [];
    let tos = [];
    const symbol = "VET";
    for(let clause of txn.clauses) {
        const quantity = getBalance(clause.value);
        const from = helperSvc.getSimpleIO(symbol, txn.origin, quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, clause.to, quantity);
        tos.push(to);
    }
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const confirmations = latestBlock > 0 ? (latestBlock - txn.meta.blockNumber) : null;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.id,
        block: txn.meta.blockNumber,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.meta.blockTimestamp),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const getTransaction = async(hash, latestBlock = 0) => {
    let endpoint = "/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
            
            transaction = buildTransactionIII(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}


const getTransactionOG = async(hash) => {
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
        type: enums.transactionType.TRANSFER,
        hash: txn.transaction.id,
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
    getBlockTransactions,
    getTransactions,
    getTransaction,
    getBlocks
}