const axios = require('axios');
const helperSvc = require('../helper.service.js');
const enums = require('../../classes/enums');
const config = require('../../config');
const apiKey = config.IOSTABC_API_KEY;
const base = "https://api.iostabc.com/api/?apikey=" + apiKey;
const baseII = "https://www.iostabc.com/api";
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

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let transaction = null;
    let contract = null;

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
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;
    chain.contract = contract;

    if(chain.address || chain.block || chain.transaction || chain.contract) {
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

const getBlock = async(blockNumber) => {
    let endpoint = "&module=block&action=get-block-detail&number=" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0) {
            const datas = response.data.data;
            const latestBlock = await getLatestBlock();
            
            const block = await buildBlock(datas, latestBlock);

            return block;
        }
        return null;
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = "/blocks?page=1&size=25";
    let url = baseII + endpoint;

    try{
        const response = await axios.get(url);

        if(response.data.blocks.length > 0) {
            const datas = response.data.blocks;
            const latestBlock = datas[0].block.number;

            let blocks = [];
            for(let data of datas) {
                const block = await buildBlock(data, latestBlock);

                blocks.push(block);
            }
            return blocks;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildBlock = async(data, latestBlock = 0) => {
    const ts = data.block.time/1000000000;
    const confirmations = data.status === "PENDING" 
                        ? -1 
                        : latestBlock - data.block.number;

    let block = {
        blockNumber: data.block.number,
        validator: data.block.witness,
        validatorIsAddress: false,
        transactionCount: data.block.tx_count,
        date: helperSvc.unixToUTC(ts),
        confirmations: confirmations,
        hash: data.block.hash,
        hasTransactions: true
    };

    return block;
}

const getBlockTransactions = async(blockNumber) => {
    let endpoint = "&module=block&action=get-block-tx&number=" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.data.code === 0 && response.data.data.transactions.length > 0) {
            const datas = response.data.data.transactions;
            
            for(let i = 0; i < datas.length; i++) {
                const transaction = await getTransaction(datas[i]);

                if(transaction !== null) {
                    transactions.push(transaction);
                }
            }
        }
        return transactions;
    } catch(error) {
        return [];
    }
}

const getContract = async(address) => {
    let contract = await getContractDetail(address);
    if(contract === null) {
        contract = await getTokenContract(address);
    }

    return contract;
}

const getContractDetail = async(address) => {
    let endpoint = "&module=contract&action=get-contract-detail&contract=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
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

            return contract;
        }
    } catch(error) {
        return null;
    }
}

const getTokenContract = async(symbol) => {
    let endpoint = "&module=token&action=get-token-detail&token=" + symbol;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data.data;
        if(Object.entries(datas).length === 0 && datas.constructor === Object) {
            return null;
        } else {
            let token = {
                address: datas.issuer,
                creator: datas.tx_hash,
                quantity: datas.current_supply,
                symbol: datas.symbol,
                name: datas.full_name
            };

            return token;
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
                    let transaction = buildTransaction(data, latestBlock);

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
    let endpoint = "&module=transaction&action=get-transaction-detail&tx_hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
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
            const symbol = datas.tokens[i].symbol;
            const detail = await getTokenContract(symbol);

            let asset = {
                quantity: qty,
                symbol: symbol.toUpperCase(),
                name: detail.name,
                address: symbol
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
    let quantity = +datas[3];
    let symbol = datas[0].toUpperCase();
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(symbol, txn.from, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.to, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.tx_hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        date: txn.created_at,
        froms: fromData,
        tos: toData,
        success: txn.status_code === "SUCCESS" ? "success" : "fail"
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const block = parseInt(txn.block_number);
    const confirmations = latestBlock - block;
    const ts = txn.transaction.time.toString().substr(0, 10);
    const datas = JSON.parse(txn.transaction.actions[0].data);
    let type = enums.transactionType.TRANSFER;
    let froms = [];
    let tos = [];
    let quantity = null;
    let symbol = "";
    if(datas.length > 3 && !helperSvc.hasLetters(datas[3])) {
        quantity = parseFloat(datas[3]);
        symbol = helperSvc.hasLetters(datas[0]) ? datas[0].toUpperCase() : "";
    }
    if(quantity !== null) {
        const from = helperSvc.getSimpleIO(symbol, datas[1], quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, datas[2], quantity);
        tos.push(to);
    }

    if(txn.transaction.tx_receipt !== null && txn.transaction.tx_receipt.receipts.length > 0) {
        txn.transaction.tx_receipt.receipts.forEach(receipt => {
            let r = [];
            try{
                r = JSON.parse(receipt.content);
            } catch(err) {
                r = [];             
            }

            if(r.length > 0){
                if(receipt.func_name === "token.iost/issue") {
                    type = enums.transactionType.ISSUE;
                    symbol = "IOST";
                    quantity = r[2];
                    const fromAddress = "coinbase";
                    const toAddress = r[1];
                    const from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
                    froms.push(from);
                    const to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
                    tos.push(to);
                } else {
                    type = enums.transactionType.CONTRACT;
                    symbol = r[0].toUpperCase();
                    if(helperSvc.hasLetters(r[2])) {
                        const from = helperSvc.getSimpleIO(symbol, r[1], r[3]);
                        froms.push(from);
                        const to = helperSvc.getSimpleIO(symbol, r[2], r[3]);
                        tos.push(to);
                    } else {
                        const from = helperSvc.getSimpleIO(symbol, r[1], r[2]);
                        froms.push(from);
                    }
                }
            }
        })
    }
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: type,
        hash: txn.transaction.hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(parseInt(ts)),
        froms: fromData,
        tos: toData,
        success: txn.transaction.tx_receipt.status_code === "SUCCESS" ? "success" : "fail"
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getBlockTransactions,
    getTransaction,
    getContract,
    getBlocks
}