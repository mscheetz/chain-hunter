const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://scan.tomochain.com/api";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tomo Chain';
    chain.symbol = 'TOMO';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
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

    if(searchType & enums.searchType.address || searchType & enums.searchType.contract) {
        const data = await getAddressOrContract(toFind);
        if(data !== null) {
            if (data.isAddress) {
                address = data.data;
            } else {
                contract = data.data;
            }
        }
    }
    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
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

const getAddressOrContract = async(addressToFind) => {
    let endpoint = "/accounts/" + addressToFind;
    let url = base + endpoint;
    
    try{
        const response = await axios.get(url);
        const datas = response.data;
        let data = null;
        let isAddress = true;
        if(typeof datas.isContract === 'undefined' || !datas.isContract) { 
            data = buildAddress(datas);
            isAddress = true;
        } else {
            data = buildContract(datas);
            isAddress = false;           
        }

        return { isAddress: isAddress, data: data };
    } catch(error) {
        return null;
    }
}

const buildAddress = function(data) {
    const balance = helperSvc.commaBigNumber(data.balanceNumber.toString());
    const cleanedTotal = helperSvc.decimalCleanup(balance);

    let address = {
        address: data.hash,
        quantity: cleanedTotal,
        hasTransactions: true
    };

    if(typeof data.accountName !== 'undefined' && data.accountName !== null){
        address.name = data.accountName;
    }

    return address;
}

const buildContract = function(data) {
    let quantity = data.balanceNumber;
    let symbol = "TOMO";
    let contractName = data.contract !== null ? data.contract.contractName : "";

    if(data.token !== null) {
        contractName = data.token.name;
        symbol = data.token.symbol;
        quantity = data.token.totalSupplyNumber;
    }
    const balance = helperSvc.commaBigNumber(quantity.toString());
    const cleanedTotal = helperSvc.decimalCleanup(balance);

    let contract = {
        address: data.hash,
        quantity: cleanedTotal,
        symbol: symbol,
        contractName: contractName
    };
    
    if(typeof data.contractCreation !== 'undefined') {
        contract.creator = data.contractCreation;
    }
    if(symbol !== "TOMO") {
        const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        contract.hasIcon = iconStatus;
    }

    return contract;
}

const getTokens = async(address) => {
    const trc20 = await getTrc20Tokens(address);
    const trc21 = await getTrc21Tokens(address);
    const trc721 = await getTrc721Tokens(address);

    let tokens = _.concat(trc20, trc21, trc721);

    return tokens;
}

const getTrc20Tokens = async(address) => {
    let endpoint = "/tokens/holding/trc20/" + address + "?page=1&limit=50";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        const datas = response.data.items;
        let assets = [];
        datas.forEach(data => {
            let asset = buildToken(data);
            assets.push(asset);
        })

        assets = tokenCleanup(assets);

        return assets;
    } catch(error) {
        return [];
    }
}

const getTrc21Tokens = async(address) => {
    let endpoint = "/tokens/holding/trc21/" + address + "?page=1&limit=50";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        const datas = response.data.items;
        let assets = [];
        datas.forEach(data => {
            let asset = buildToken(data);
            assets.push(asset);
        })

        assets = tokenCleanup(assets);

        return assets;
    } catch(error) {
        return [];
    }
}

const getTrc721Tokens = async(address) => {
    let endpoint = "/tokens/holding/trc721/" + address + "?page=1&limit=50";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        const datas = response.data.items;
        let assets = [];
        datas.forEach(data => {
            let asset = buildToken(data);
            assets.push(asset);
        })

        assets = tokenCleanup(assets);

        return assets;
    } catch(error) {
        return [];
    }
}

const buildToken = function(data) {
    let quantity = 0;
    if(typeof data.quantityNumber !== 'undefined') {
        quantity = data.quantityNumber;
    } else if(typeof data.tokenId !== 'undefined') {
        quantity = data.tokenId;
    }
    
    let asset = {
        quantity: quantity,
        symbol: data.tokenObj.symbol,
        name: data.tokenObj.name
    };
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const tokenCleanup = function(tokens) {
    let assets = [];

    tokens.forEach(token => {
        const exists = assets.find(a => a.symbol === token.symbol);

        if(typeof exists === 'undefined') {
            const available = tokens.filter(t => t.symbol === token.symbol);
            let quantity = 0;
            for(let i = 0; i < available.length; i++){
                quantity += available[i].quantity;
            }
            
            const total = helperSvc.commaBigNumber(quantity.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);

            let asset = {
                quantity: cleanedTotal,
                symbol: token.symbol,
                name: token.name,
                hasIcon: token.hasIcon
            }

            assets.push(asset);
        }
    });

    return assets;
}

const getBlock = async(blockNumber) => {
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;

        let ts = datas.timestamp;
        let yr = ts.substr(0,4);
        let mo = ts.substr(5,2);
        let day = ts.substr(8,2);
        let time = ts.substr(11,8);
        mo = helperSvc.getMonth(mo);
        
        ts = `${day}-${mo}-${yr} ${time}`;

        let block = {
            blockNumber: blockNumber,
            validator: datas.m2,
            transactionCount: datas.e_tx,
            date: ts,
            size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
            hash: datas.hash,
            hasTransactions: true
        };

        return block;
    } catch (err) {
        return null;
    }
}

const getTransactions = async(address) => {
    let method = "";
    let block = false;
    if(helperSvc.hasLetters(address)) {
        method = "listByAccount";
    } else {
        block = true;
        method = "listByBlock"
    }

    let endpoint = `/txs/${method}/${address}?page=1&limit=20`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data.items;
        let transactions = [];

        for(let i = 0; i < datas.length; i++) {
            let transaction = await buildTransaction(datas[i], true);
            
            if(!block) {
                transaction = helperSvc.inoutCalculation(address, transaction);
            }

            transactions.push(transaction);            
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash, rawData = false) => {
    let endpoint = "/txs/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        const datas = response.data;
        
        let transaction = rawData ? datas : buildTransaction(datas);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = async(txn, canExpand = false) => {    
    if(canExpand && txn.value === "0" && (typeof txn.trc20Txs === 'undefined')){
        txn = await getTransaction(txn.hash, true);
    }
    let type = enums.transactionType.TRANSFER;
    let froms = [];
    let tos = [];
    let tokenTxn = false;
    
    if((typeof txn.trc20Txs !== 'undefined') && txn.trc20Txs.length > 0){
        tokenTxn = true;
        txn.trc20Txs.forEach(tx => {
            const from = helperSvc.getSimpleIO(tx.symbol, tx.from, tx.valueNumber);
            froms.push(from);
            const to = helperSvc.getSimpleIO(tx.symbol, tx.to, tx.valueNumber);
            tos.push(to);
        })
    }
    if((typeof txn.trc21Txs !== 'undefined') && txn.trc21Txs.length > 0){
        tokenTxn = true;
        txn.trc21Txs.forEach(tx => {
            const from = helperSvc.getSimpleIO(tx.symbol, tx.from, tx.valueNumber);
            froms.push(from);
            const to = helperSvc.getSimpleIO(tx.symbol, tx.to, tx.valueNumber);
            tos.push(to);
        })
    }
    if((typeof txn.trc721Txs !== 'undefined') && txn.trc721Txs.length > 0){
        tokenTxn = true;
        
        txn.trc721Txs.forEach(tx => {
            const from = helperSvc.getSimpleIO(tx.symbol, tx.from, tx.tokenId);
            froms.push(from);
            const to = helperSvc.getSimpleIO(tx.symbol, tx.to, tx.tokenId);
            tos.push(to);
        })
    }
    if(!tokenTxn) {
        if(typeof txn.internals !== 'undefined' && txn.internals !== null && txn.internals.length > 0) {
            txn.internals.forEach(internal => {                
                const symbol = "TOMO";
                const total = helperSvc.bigNumberToDecimal(internal.value, 18);
                const commad = helperSvc.commaBigNumber(total);
                const cleanedTotal = helperSvc.decimalCleanup(commad);
                const from = helperSvc.getSimpleIO(symbol, internal.from, cleanedTotal);
                froms.push(from);
                const to = helperSvc.getSimpleIO(symbol, internal.to, cleanedTotal);
                tos.push(to);
            });            
        } else {
            let contract = false;
            if(typeof txn.from_model !== 'undefined'){
                if((typeof txn.from_model.isContract !== 'undefined') && txn.from_model.isContract != null && txn.from_model.isContract){
                    contract = true;
                }
            }
            if(typeof txn.to_model !== 'undefined'){
                if(!contract && (typeof txn.to_model.isContract !== 'undefined') && txn.to_model.isContract != null && txn.to_model.isContract){
                    contract = true;
                }
            }
            if(contract){
                type = enums.transactionType.CONTRACT;
            }
            const symbol = "TOMO";
            const total = helperSvc.bigNumberToDecimal(txn.value, 18);
            const commad = helperSvc.commaBigNumber(total);
            const cleanedTotal = helperSvc.decimalCleanup(commad);
            const from = helperSvc.getSimpleIO(symbol, txn.from, cleanedTotal);
            froms.push(from);
            const to = helperSvc.getSimpleIO(symbol, txn.to, cleanedTotal);
            tos.push(to);
        }
    }
    const confirmations = txn.latestBlockNumber - txn.blockNumber;
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    
    let transaction = {
        type: type,
        hash: txn.hash,
        block: txn.blockNumber,
        confirmations: confirmations,
        date: txn.createdAt,
        froms: fromData,
        tos: toData
    };
    if(typeof txn.isPending !== 'undefined' && !txn.isPending) {
        transaction.success = 'success';
    }

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddressOrContract,
    getTokens,
    getTransactions,
    getTransaction
}