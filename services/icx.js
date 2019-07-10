const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://tracker.icon.foundation/v3";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Icon';
    chain.symbol = 'ICX';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    chain.contract = null;
    if(address === null) {
        await delay(1000);
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    await delay(1000);
    // const contract = await getContract(toFind);
    // chain.contract = contract;
    if(chain.address || chain.transaction/* || chain.contract*/) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/info?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.result !== 200){
            return null;
        } else {
            const datas = response.data.data;
            const address = {
                address: datas.address,
                quantity: datas.balance
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
            const contract = {
                address: datas.contractAddr,
                quantity: datas.balance,
                creator: datas.contractCreatorAddr,
                contractName: datas.contractName
            };

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
    let endpoint = "/address/txList?address="+ address +"&page=1&count=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null && response.data.data.length > 0) {
            const datas = response.data.data;
            const transactions = [];
            const latestBlock = 0;//await getLatestBlock();
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
    let endpoint = "/transaction/txDetail?txHash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.content === "undefined" || response.data.result !== 200) {
            return null;
        } else {
            const data = response.data.data;
            const latestBlock = 0;//await getLatestBlock();
            const transaction = buildTransactionII(data, latestBlock);

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
        let asset = {
            quantity: helperSvc.commaBigNumber(data.balance.toString()),
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
    const transaction = {
        hash: txn.txHash,
        block: txn.height,
        latestBlock: latestBlock,
        //confirmations: latestBlock - txn.blockNumber,
        quantity: txn.amount,
        symbol: txn.dataType.toUpperCase(),
        date: txn.createDate,
        from: txn.fromAddr,
        to: txn.toAddr,
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";

    if(txn.tokenTxList.length > 0){
        quantity = txn.tokenTxList[0].quantity;
        symbol = txn.tokenTxList[0].symbol;
        from = txn.tokenTxList[0].fromAddr;
        to = txn.tokenTxList[0].toAddr;
    } else {
        quantity = txn.amount;
        symbol = txn.datatType;
        from = txn.fromAddr;
        to = txn.toAddr;
    }

    const transaction = {
        hash: txn.txHash,
        block: txn.height,
        latestBlock: latestBlock,
        //confirmations: latestBlock - txn.blockNumber,
        quantity: quantity,
        symbol: symbol.toUpperCase(),
        date: txn.createDate,
        from: from,
        to: to,
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