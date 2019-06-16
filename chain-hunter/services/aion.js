const axios = require('axios');
const helperSvc = requre('helper');
const base = "https://mainnet-api.aion.network/aion/dashboard";

const getEmptyBlockchain = function() {
    const chain = {};
    chain.name = 'AION';
    chain.symbol = 'AION';
    chain.hasTokens = true;

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }

    return chain;
}

const getAddress = async(address) => {
    let endpoint = "/getAccountDetails?accountAddress=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.content === "undefined") || response.content === null || response.content.length === 0){
            return null;
        } else {
            const datas = response.content[0];
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

const getAddressTokenContracts = async(address) => {
    let endpoint = "/getAccountDetails?accountAddress=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.content === "undefined") || response.content === null || response.content.length === 0){
            return [];
        } else {
            const datas = response.content[0].tokens;
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
        if(response.content !== null && response.content.length > 0) {
            const datas = response.content;
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

const getTransaction = function(hash) {
    hash = hash.substr(0, 2) === "0x" ? hash.substr(2) : hash;
    let endpoint = "/getTransactionDetailsByTransactionHash?searchParam=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.content === "undefined") {
            return null;
        } else {
            const data = response.content[0];
            const latestBlock = await getLatestBlock(chain);
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
    tokenContracts.forEach(contract => {
        token = await getToken(address, contract);
        if(token !== null) {
            tokens.push(token);
        }
    });

    return tokens;
}

const getToken = async(address, contract) => {    
    let endpoint = "/getAccountDetails?accountAddress=" + address + "&tokenAddress=" + tokenAddress;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const data = response.content[0];
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
        
        return response.content[0].blockNumber.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const ts = txn.transactionTimestamp.toString().substr(0, 10);

    const transaction = {
        hash = "0x" + txn.transactionHash,
        block = txn.blockNumber,
        latestBlock = latestBlock,
        confirmations = latestBlock - txn.blockNumber,
        quantity = txn.value,
        symbol = "AION",
        date = helperSvc.unixToUTC(parseInt(ts)),
        from = txn.fromAddr,
        to = txn.toAddr,
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