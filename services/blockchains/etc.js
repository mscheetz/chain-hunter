const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://blockscout.com/etc/mainnet/api";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ethereum Classic';
    chain.symbol = 'ETC';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let contract = null;
    let transaction = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.contract = contract;
    chain.transaction = transaction;

    if(chain.address || chain.contract || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "?module=account&action=balance&address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const quantity = helperSvc.bigNumberToDecimal(response.data.result, 18);
            const balance = helperSvc.commaBigNumber(quantity.toString());
            const cleanedTotal = helperSvc.decimalCleanup(balance);
            let address = {
                address: addressToFind,
                quantity: cleanedTotal,
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

const getContract = async(address) => {
    let endpoint = "?module=contract&action=getsourcecode&address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const datas = response.data.result[0];
            let contractAddress = datas.Address;

            let contract = {
                address: contractAddress,
                contractName: datas.ContractName
            };

            return contract;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    let endpoint = "?module=account&action=tokenlist&address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        if(response.data.status === "1") {
            const datas = response.data.result;
            let assets = [];
            datas.forEach(data => {
                let asset = buildToken(data);
                assets.push(asset);
            })

            return assets;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const buildToken = function(data) {
    const decimals = parseInt(data.decimals);
    const qty = data.balance.length > decimals 
                ? helperSvc.bigNumberToDecimal(data.balance, decimals)
                : data.balance;
    const total = helperSvc.commaBigNumber(qty.toString());
    const cleanedTotal = helperSvc.decimalCleanup(total);
    let asset = {
        quantity: cleanedTotal,
        symbol: data.symbol,
        name: data.name
    };
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const getTransactions = async(address) => {
    const etcTxns = await getEtcTransactions(address);
    const tokenTxns = await getTokenTransactions(address);

    let transactions = _.concat(etcTxns, tokenTxns);
    let sorted = _.sortBy(transactions, 'date');

    let sliced = _.takeRight(sorted, 10);

    sliced.forEach(slice => {
        slice.date = helperSvc.unixToUTC(slice.date);
    })

    return sliced;
}

const getTokenTransactions = async(address) => {
    let endpoint = "?module=account&action=tokentx&address=" + address + "&sort=desc&page=1&offset=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const datas = response.data.result;
            let transactions = [];
            datas.forEach(data => {
                let transaction = buildTransaction(data, true);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getEtcTransactions = async(address) => {
    let endpoint = "?module=account&action=txlist&address=" + address + "&sort=desc&page=1&offset=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const datas = response.data.result;
            let transactions = [];
            datas.forEach(data => {
                let transaction = buildTransaction(data);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "?module=transaction&action=gettxinfo&txhash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const datas = response.data.result;
            
            let froms = [];
            let tos = [];
            let noDetail = false;
            if(datas.logs.length > 0) {
                const details = await getComboTokenTransactions(datas.from, parseInt(datas.blockNumber), hash);
                froms = details.froms;
                tos = details.tos;
                noDetail = true;
            }
            let transaction = buildTransaction(datas, false, noDetail);

            transaction.date = helperSvc.unixToUTC(transaction.date);
            
            if(noDetail){
                transaction.froms = froms;
                transaction.tos = tos;
            }

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getComboTokenTransactions = async(address, block, hash) => {
    const startBlock = block - 1;
    const endBlock = block + 1;
    let endpoint = "?module=account&action=tokentx&address=" + address + "&startblock="+ startBlock +"&endblock=" + endBlock;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.status === "1") {
            const datas = response.data.result;
            const txns = datas.filter(d => d.hash === hash);

            let froms = [];
            let tos = [];
            txns.forEach(txn => {
                let symbol = "ETC";
                let decimals = 18;
                if(typeof txn.tokenSymbol !== 'undefined') {
                    symbol = txn.tokenSymbol;
                    decimals = parseInt(txn.tokenDecimal);

                }
                const qty = txn.value.length > decimals 
                            ? helperSvc.bigNumberToDecimal(txn.value, decimals)
                            : txn.value;
                const total = helperSvc.commaBigNumber(qty.toString());
                const cleanedTotal = helperSvc.decimalCleanup(total);
                
                const from = helperSvc.getSimpleIO(symbol, txn.from, cleanedTotal);
                froms.push(from);
                const to = helperSvc.getSimpleIO(symbol, txn.to, cleanedTotal);
                tos.push(to);
            });

            const fromData = helperSvc.cleanIO(froms);
            const toData = helperSvc.cleanIO(tos);            

            return { froms: fromData, tos: toData };
        } else {
            return { froms: [], tos: [] };
        }
    } catch(error) {
        return { froms: [], tos: [] };
    }
}

const buildTransaction = function(txn, token = false, noDetail = false) {
    let froms = [];
    let tos = [];
    const symbol = token ? txn.tokenSymbol : "ETC";
    const decimals = token ? parseInt(txn.decimals) : 18;
    const qty = txn.value.length > decimals 
                ? helperSvc.bigNumberToDecimal(txn.value, decimals)
                : txn.value;
    const total = helperSvc.commaBigNumber(qty.toString());
    const cleanedTotal = helperSvc.decimalCleanup(total);
    const timestamp = parseInt(txn.timeStamp)

    const from = helperSvc.getSimpleIO(symbol, txn.from, cleanedTotal);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, txn.to, cleanedTotal);
    tos.push(to);
    
    const fromData = noDetail ? [] : helperSvc.cleanIO(froms);
    const toData = noDetail ? [] : helperSvc.cleanIO(tos);

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.blockNumber,
        confirmations: txn.confirmations,
        date: timestamp,
        froms: fromData,
        tos: toData
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