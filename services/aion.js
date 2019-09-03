const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://mainnet-api.aion.network/aion/dashboard";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'AION';
    chain.symbol = 'AION';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
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
    if((searchType & enums.searchType.transaction) && address === null) {
        transaction = await getTransaction(toFind);
    }
    if((searchType & enums.searchType.contract) && transaction === null) {
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
    let endpoint = "/getAccountDetails?accountAddress=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return null;
        } else {
            const datas = response.data.content[0];
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);
            const address = {
                address: datas.address,
                quantity: cleanedTotal,
                hasTransactions: true
            };

            return address;
        }
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "/getContractDetailsByContractAddress?searchParam=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return null;
        } else {
            const datas = response.data.content[0];
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);
            let contract = {
                address: datas.contractAddr,
                quantity: cleanedTotal,
                symbol: "AION",
                creator: datas.contractCreatorAddr,
                contractName: datas.contractName
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

const getAddressTokenContracts = async(address) => {
    let endpoint = "/getAccountDetails?accountAddress=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return [];
        } else {
            const datas = response.data.content[0].tokens;
            let contracts = [];
            datas.forEach(data => {
                contracts.push(data.contractAddr);
            });

            return contracts;
        }
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/getTransactionsByAddress?accountAddress="+ address +"&page=0&size=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.content !== null && response.data.content.length > 0) {
            const datas = response.data.content;
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
    hash = hash.substr(0, 2) === "0x" ? hash.substr(2) : hash;
    let endpoint = "/getTransactionDetailsByTransactionHash?searchParam=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.content === "undefined") {
            return null;
        } else {
            const data = response.data.content[0];
            const latestBlock = await getLatestBlock();
            const transaction = buildTransaction(data, latestBlock);

            return transaction;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    const tokenContracts = await getAddressTokenContracts(address);
    let tokens = [];
    for (let i = 0; i < tokenContracts.length; i++) {
        const contract = tokenContracts[i];
        token = await getToken(address, contract);
        if(token !== null) {
            tokens.push(token);
        }
    }

    return tokens;
}

const getToken = async(address, contract) => {    
    let endpoint = "/getAccountDetails?accountAddress=" + address + "&tokenAddress=" + contract;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const data = response.data.content[0];
        const total = helperSvc.commaBigNumber(datas.balance.toString());
        const cleanedTotal = helperSvc.decimalCleanup(total);
        let asset = {
            quantity: cleanedTotal,
            symbol: aionAddress.tokenSymbol
        };

        return asset;

    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/getBlockList?page=0&size=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.content[0].blockNumber.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const ts = txn.transactionTimestamp.toString().substr(0, 10);
    const total = helperSvc.commaBigNumber(txn.value.toString());
    const cleanedTotal = helperSvc.decimalCleanup(total);

    const transaction = {
        hash: "0x" + txn.transactionHash,
        block: txn.blockNumber,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.blockNumber,
        quantity: cleanedTotal,
        symbol: "AION",
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: txn.fromAddr,
        to: txn.toAddr,
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