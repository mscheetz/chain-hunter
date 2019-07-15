const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://tracker.icon.foundation/v3";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Icon';
    chain.symbol = 'ICX';
    chain.hasTokens = false;
    chain.hasContracts = true;
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
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
     const contract = await getContract(toFind);
     chain.contract = contract;
    if(chain.address || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/info?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data === null){
            return null;
        } else {
            const datas = response.data.data;
            const address = {
                address: datas.address,
                quantity: datas.balance,
                tokens: tokenConvert(datas.tokenList)
            };

            return address;
        }
    } catch(error) {
        return null;
    }
}

const tokenConvert = async(tokens) => {
    let assets = [];

    tokens.forEach(token => {
        const asset = {
            quantity: parseFloat(token.quantity),
            symbol: token.contractSymbol
        }

        assets.push(asset);
    });

    return assets;
}

const getContract = async(address) => {
    let endpoint = "/contract/info?addr=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data === null) {
            return null;
        } else {
            const datas = response.data.data;
            const contract = {
                address: datas.address,
                quantity: null,
                symbol: datas.symbol,
                creator: datas.creator,
                contractName: datas.tokenName
            };

            return contract;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let addressTransactions = await getAddressTransactions(address);
    let tokenTransactions = await getTokenTransactions(address);

    if(addressTransactions.length > 0 && tokenTransactions.length > 0) {
        addressTransactions.forEach(txn => {
            if(txn.symbol === "CALL") {
                const tokenTxn = tokenTransactions.find(t => t.hash === txn.hash);

                if(tokenTxn !== null) {
                    txn.quantity = tokenTxn.quantity;
                    txn.symbol = tokenTxn.symbol;
                }
            }
        });
    }

    return addressTransactions;
}

const getAddressTransactions = async(address) => {
    let endpoint = "/address/txList?address="+ address +"&page=1&count=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null && response.data.data.length > 0) {
            const datas = response.data.data;
            const transactions = [];            
            if(datas.length > 0) {
                const latestBlock = await getLatestBlock();
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

const getTokenTransactions = async(address) => {
    let endpoint = "/address/tokenTxList?address="+ address +"&page=1&count=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null && response.data.data.length > 0) {
            const datas = response.data.data;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTokenTransaction(data));
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
        if(response.data.data === null) {
            return null;
        } else {
            const datas = response.data.data;
            const transaction = buildTransactionII(datas);

            return transaction;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/block/list?page=1&count=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.data[0].height.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const transaction = {
        hash: txn.txHash,
        block: txn.height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.height,
        quantity: parseFloat(txn.amount),
        symbol: txn.dataType.toUpperCase(),
        date: txn.createDate,
        from: txn.fromAddr,
        to: txn.toAddr,
    };

    return transaction;
}

const buildTokenTransaction = function(txn) {
    const transaction = {
        hash: txn.txHash,
        quantity: parseFloat(txn.quantity),
        symbol: txn.contractSymbol,
        date: txn.createDate,
        from: txn.fromAddr,
        to: txn.toAddr,
    };

    return transaction;
}

const buildTransactionII = function(txn) {
    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";

    if(txn.tokenTxList.length > 0){
        quantity = parseFloat(txn.tokenTxList[0].quantity);
        symbol = txn.tokenTxList[0].symbol;
        from = txn.tokenTxList[0].fromAddr;
        to = txn.tokenTxList[0].toAddr;
    } else {
        quantity = parseFloat(txn.amount);
        symbol = txn.dataType;
        from = txn.fromAddr;
        to = txn.toAddr;
    }

    const transaction = {
        hash: txn.txHash,
        block: txn.height,
        confirmations: txn.confirmation,
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
    getTransactions,
    getTransaction,
    getAddressTransactions,
    getTokenTransactions
}