const axios = require('axios');
const helperSvc = require('./helperService.js');
const apiKey = "67de405a0cb8a9e2fe5e33000cf9a88a";
const base = "https://api.iostabc.com/api/?apikey=" + apiKey;
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'IOST';
    chain.symbol = 'IOST';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    let address = null;
    let transaction = null;
    let contract = null;
    if(toFind.substr(0, 8) === "Contract"){
        contract = await getContract(toFind);
    } else {
        address = await getAddress(toFind);
        if(address === null) {
            await delay(1000);
            transaction = await getTransaction(toFind);
        }
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
    let endpoint = "&module=account&action=get-account-balance&account=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;

        const address = {
            address: addressToFind,
            quantity: datas.balance,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "&module=contract&action=get-contract-detail&contract=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;
        if(Object.entries(datas).length === 0 && datas.constructor === Object) {
            return null;
        } else {
            const contract = {
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
    let endpoint = "&module=transaction&action=get-transaction-detail&tx_hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
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

    const transaction = {
        hash: txn.tx_hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        quantity: parseFloat(datas[3]),
        symbol: datas[0].toUpperCase(),
        date: txn.created_at,
        from: txn.from,
        to: txn.to,
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const block = parseInt(txn.block_number);
    const confirmations = latestBlock - block;
    const ts = txn.transaction.time.toString().substr(0, 10);
    const datas = JSON.parse(txn.transaction.actions[0].data);

    const transaction = {
        hash: txn.transaction.hash,
        block: block,
        latestBlock: latestBlock,
        confirmations: confirmations,
        quantity: parseFloat(datas[3]),
        symbol: datas[0].toUpperCase(),
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: datas[1],
        to: datas[2],
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction,
    getContract
}