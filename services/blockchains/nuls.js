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

        if(response.data !== null && typeof response.data.error === 'undefined') {
            const datas = response.data.result;
            const quantity = datas.totalBalance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: datas.address,
                quantity: total,
                transactionCount: datas.txCount,
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
        if(response.data !== null && typeof response.data.error === 'undefined') {
            const datas = response.data.result;
            const latestBlock = await getLatestBlock();

            let block = {
                blockNumber: blockNumber,
                validator: datas.packingAddress,
                transactionCount: datas.txHashList.length,
                confirmations: latestBlock - blockNumber,
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

const getBlocks = async() => {
    let data = {
        jsonrpc: '2.0',
        method: 'getBlockHeaderList',
        params: [
            1,
            1,
            20,
            false,
            ""
        ]
    }

    try{
        const response = await axios.post(base, data);
        if(response.data !== null && typeof response.data.error === 'undefined') {
            const datas = response.data.result.list;
            const latestBlock = datas[0].height;
            let blocks = [];

            for(let data of datas) {
                let block = {
                    blockNumber: data.height,
                    transactionCount: data.txCount,
                    confirmations: latestBlock - data.height,
                    date: helperSvc.unixToUTC(data.createTime),
                    size: `${helperSvc.commaBigNumber(data.size.toString())} bytes`,
                    hasTransactions: true
                };

                blocks.push(block);
            }
            return blocks;
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

        if(response.data !== null && typeof response.data.error === 'undefined') {
            const datas = response.data.result;            
            const quantity = datas.totalSupply !== null 
                    ? helperSvc.commaBigNumber(datas.totalSupply)
                    : null;

            let contract = {
                address: datas.contractAddress,
                quantity: quantity,
                symbol: datas.symbol,
                contractName: datas.alias,
                creator: datas.creater
            };

            if(contract.symbol !== null && contract.symbol !== "NULS") {
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
        if(response.data !== null && typeof response.data.error === 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            for(let data of datas) {
                let quantity = data.balance/Math.pow(10,data.decimals);
                quantity = helperSvc.commaBigNumber(quantity.toString());
                
                let asset = {
                    quantity: quantity,
                    symbol: data.tokenSymbol,
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

    return _.orderBy(transactions, "ts", "desc");
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
        if(response.data !== null && typeof response.data.error === 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
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
        if(response.data !== null && typeof response.data.error === 'undefined' && response.data.result.list.length > 0) {
            const datas = response.data.result.list;
            latestBlock = latestBlock === 0 ? await getLatestBlock() : latestBlock;
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
        
        if(response.data !== null && typeof response.data.error === 'undefined' && response.data.result.txHashList.length > 0) {            
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
        if(response.data !== null && typeof response.data.error === 'undefined') {
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
        if(response.data !== null && typeof response.data.error === 'undefined') {
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
    let type = getType(txn.type);
    
    if(txn.coinFroms.length > 0) {
        for(let tx of txn.coinFroms) {
            let quantity = tx.amount/100000000;
            const from = helperSvc.getSimpleIO(tx.symbol, tx.address, quantity);
            froms.push(from);
        }
    }
    if(txn.coinTos.length > 0) {
        for(let tx of txn.coinTos) {
            let quantity = tx.amount/100000000;
            const to = helperSvc.getSimpleIO(tx.symbol, tx.address, quantity);
            tos.push(to);
        }
    }

    if(txn.txData !== null && typeof txn.txData.resultInfo !== 'undefined' && typeof txn.txData.resultInfo.tokenTransfers !== 'undefined' && txn.txData.resultInfo.tokenTransfers.length > 0) {
        for(let tfr of txn.txData.resultInfo.tokenTransfers) {
            let quantity = tfr.value/Math.pow(10,tfr.decimals);
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
    let type = getType(txn.type);

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

const getType = function(id) {
    if(id === 1) {
        return enums.transactionType.REWARD
    } else if (id === 2) {
        return enums.transactionType.TRANSFER;
    } else if (id === 3) {
        return enums.transactionType.ALIASED;
    } else if (id === 4) {
        return enums.transactionType.REGISTER_NODE;
    } else if (id === 5) {
        return enums.transactionType.STAKING;
    } else if (id === 6) {
        return enums.transactionType.CANCEL_CONSENSUS;
    } else if (id === 7) {
        return enums.transactionType.YELLOW_CARD;
    } else if (id === 8) {
        return enums.transactionType.RED_CARD;
    } else if (id === 9) {
        return enums.transactionType.UNREGISTER_NODE;
    } else if (id === 10) {
        return enums.transactionType.CROSS_TRADING;
    } else if (id === 11) {
        return enums.transactionType.CROSS_REGISTER;
    } else if (id === 12) {
        return enums.transactionType.CROSS_CANCELLATION;
    } else if (id === 13) {
        return enums.transactionType.ADD_CROSS_ASSETS;
    } else if (id === 14) {
        return enums.transactionType.CANCEL_CROSS_ASSETS;
    } else if (id === 15) {
        return enums.transactionType.CONTRACT_CREATION;
    } else if (id === 16) {
        return enums.transactionType.CONTRACT;
    } else if (id === 17) {
        return enums.transactionType.DELETE_CONTRACT;
    } else if (id === 18) {
        return enums.transactionType.CONTRACT_TRANSFER;
    } else if (id === 19) {
        return enums.transactionType.CONTRACT_RETURN;
    } else if (id === 20) {
        return enums.transactionType.CONTRACT_CREATION_NODE;
    } else if (id === 21) {
        return enums.transactionType.CONTRACT_STAKE;
    } else if (id === 22) {
        return enums.transactionType.CONTRACT_CONSENSUS;
    } else if (id === 23) {
        return enums.transactionType.CONTRACT_CANCELLATION_NODE;
    } else if (id === 24) {
        return enums.transactionType.VERIFIER_CHANGE;
    } else if (id === 25) {
        return enums.transactionType.VERIFIER_INITIALIZATION;
    }
    return enums.transactionType.TRANSFER;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction,
    getBlocks
}