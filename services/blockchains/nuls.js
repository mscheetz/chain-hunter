const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://nulscan.io/api/";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'ZelCash';
    chain.symbol = 'ZEL';
    chain.hasTokens = false;
    chain.hasContracts = false;
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
    let data = {
        jsonrpc: '2.0',
        method: 'getAccount',
        params: [
            1,
            addressToFind
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error !== 'undefined') {
            const datas = response.data.result;
            const quantity = datas.totalBalance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: datas.address,
                quantity: total,
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
    let endpoint = "/block-index/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data === null) {
            return null;
        }

        return response.data.blockHash;
    } catch (err) {
        return null;
    }
}

const getBlock = async(blockNumber) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getHeaderByHeight',
        params: [
            1,
            blockNumber
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error !== 'undefined') {
            const datas = response.data.result;

            let block = {
                blockNumber: blockNumber,
                validator: datas.packingAddress,
                transactionCount: datas.txHashList.length,
                date: helperSvc.unixToUTC(datas.createTime),
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                hash: datas.hash,
                hasTransactions: true
            };

            return block;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

const getContract = async(address) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getContract',
        params: [
            1,
            address
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error !== 'undefined') {
            const datas = response.data.result;

            let contract = {
                address: datas.contractAddress,
                quantity: datas.totalSupply,
                symbol: datas.symbol,
                contractName: datas.alias,
                creator: datas.creater
            };

            if(symbol !== "TOMO") {
                const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
                const iconStatus = helperSvc.iconExists(icon);
                contract.hasIcon = iconStatus;
            }

            return contract;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getAccountTokens',
        params: [
            1,
            1,
            10,
            address
        ]
    }

    try{
        const response = await axios.post(base, data);
        let assets = [];
        if(response.data !== null && typeof response.data.error !== 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            for(let data of datas) {
                let quantity = helperSvc.bigNumberToDecimal(data.balance, data.decimals);
                quantity = helperSvc.commaBigNumber(quantity);
                
                let asset = {
                    quantity: quantity,
                    symbol: datas.tokenSymbol,
                    name: data.tokenName,
                    address: data.contractAddress
                };
                const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
                const iconStatus = helperSvc.iconExists(icon);
                asset.hasIcon = iconStatus;

                assets.push(asset);
            }
        
            return assets;

        }
        return assets;
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let transactions = [];
    const latestBlock = await getLatestBlock();
    if(helperSvc.hasLetters(address)) {
        const transfers = await getAccountTransactions(address, latestBlock);
        const tokenXfers = await getTokenTransactions(address, latestBlock);

        transactions = transfers.concat(tokenXfers);
    } else {
        transactions = await getBlockTransactions(address, latestBlock);
    }

    return _.orderBy(transactions, "ts");
}

const getAccountTransactions = async(address, latestBlock = 0) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getAccountTxs',
        params: [
            1,
            1,
            10,
            address,
            0,
            -1,
            -1
        ]
    }

    try{
        const response = await axios.post(base, data);
        let transactions = [];
        if(response.data !== null && typeof response.data.error !== 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
            let transactions = [];
            for(let txn of datas) {                
                let transaction = await getTransaction(txn.txHash, latestBlock);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            }

        }
        return transactions;
    } catch(error) {
        return [];
    }
}

const getTokenTransactions = async(address, latestBlock = 0) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getTokenTransfers',
        params: [
            1,
            1,
            10,
            address,
            ''
        ]
    }

    try{
        const response = await axios.post(base, data);
        let transactions = [];
        if(response.data !== null && typeof response.data.error !== 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
            let transactions = [];
            for(let txn of datas) {                
                let transaction = buildTokenTransaction(txn, latestBlock);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            }

        }
        return transactions;
    } catch(error) {
        return [];
    }
}

const getBlockTransactions = async(blockNumber, latestBlock = 0) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getHeaderByHeight',
        params: [
            1,
            blockNumber
        ]
    }

    try{
        const response = await axios.post(base, data);
        let transactions = [];
        if(response.data !== null && typeof response.data.error !== 'undefined' && response.data.result.txHashList.length > 0) {            
            const datas = response.data.result.txHashList;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
            
            for(let data of datas){
                const transaction = await getTransaction(data, latestBlock);

                transactions.push(transaction);
            }
        }
        return transactions;
    } catch (err) {
        return [];
    }
}

const getLatestBlock = async() => {
    let data = {
        jsonrpc: '2.0',
        method: 'getBestBlockHeader',
        params: [
            1
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error !== 'undefined') {
            const datas = response.data.result;
            
            return datas.height;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash, latestBlock = 0) => {
    let data = {
        jsonrpc: '2.0',
        method: 'getTx',
        params: [
            1,
            hash
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error !== 'undefined') {
            const datas = response.data.result;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;

            const transaction = buildTransaction(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn, latestBlock) {
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;

    if(txn.coinsFroms.length > 0) {
        for(let tx of txn.coinsFroms) {
            let quantity = tx.amount/100000000;
            const from = helperSvc.getSimpleIO(tx.symbol, tx.address, quantity);
            froms.push(from);
        }
    }
    if(txn.coinsTos.length > 0) {
        for(let tx of txn.coinsTos) {
            let quantity = tx.amount/100000000;
            const from = helperSvc.getSimpleIO(tx.symbol, tx.address, quantity);
            froms.push(from);
        }
    }

    if(txn.txData !== null && typeof txn.txData.tokenTransfers !== 'undefined' && txn.txData.tokenTransfers.length > 0) {
        for(let tfr of txn.txData.tokenTransfers) {
            let quantity = helperSvc.bigNumberToDecimal(tfr.value, tfr.decimals);
            const symbol = tfr.symbol;
            const from = helperSvc.getSimpleIO(symbol, tfr.fromAddress, quantity);
            froms.push(from);
            const to = helperSvc.getSimpleIO(symbol, tfr.toAddress, quantity);
            tos.push(to);
        }
    }

    const confirmations = latestBlock - txn.height;
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: type,
        hash: txn.hash,
        block: txn.height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.createTime),
        froms: fromData,
        tos: toData,
        ts: txn.createTime
    };

    return transaction;
}

const buildTokenTransaction = function(txn, latestBlock) {
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;

    let quantity = helperSvc.bigNumberToDecimal(txn.value, txn.decimals);
    const symbol = txn.symbol;
    const from = helperSvc.getSimpleIO(symbol, txn.fromAddress, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.toAddress, quantity);
    tos.push(to);

    const confirmations = latestBlock - txn.height;
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: type,
        hash: txn.txHash,
        block: txn.height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.time),
        froms: fromData,
        tos: toData,
        ts: txn.time
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