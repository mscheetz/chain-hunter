const axios = require('axios');
const helperSvc = requre('helper');
const base = "https://apilist.tronscan.org/api";

const getBlockchain = function(toFind) {
    const chain = {};
    chain.name = 'Tron';
    chain.symbol = 'TRX';
    chain.hasTokens = true;

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
        if(transaction === null) {
            const contract = await getContract(toFind);
            chain.contract = contract;
        }
    }

    return chain;
}

const getAddress = async(address) => {
    let endpoint = "/account?address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.address) {
            const datas = response.address;
            const address = {
                address: datas.address,
                quantity: datas.balance/100000000
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
    let endpoint = "/contract?contract=" + address;
    let url = this.base + endpoint;

    try{
        const response = await axios.get(url);
        if(response && response.data.address !== "") {
            const datas = response.address;
            const contract = {
                address: datas.address,
                quantity: datas.balance/100000000
            };
            return contract;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressTokens = async(address) => {
    let endpoint = "/account?address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.address) {
            const datas = response.address;
            let tokens = [];
            tokens["10"] = datas.tokenBalances;
            tokens["20"] = datas.trc20token_balances;
            
            return tokens;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/transaction?sort=-timestamp&count=true&limit=10&start=0&address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.length > 0) {
            response.forEach(data => {
                transactions.push(buildTransaction(data));
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = function(hash) {
    let endpoint = "/transaction-info?hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.hash) {
            const transaction = buildTransaction(response);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    const addyTokens = await getAddressTokens(address);

}

const getTrx10Tokens = async() => {
    
}

const buildTransaction = function(txn) {
    const transaction = {
        hash: txn.hash,
        block: txn.block,
        quantity: txn.contractData.amount,
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        from: txn.ownerAddress,
        to: txn.toAddress
    };

    return transaction;
}

module.exports = {
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}