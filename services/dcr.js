const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://dcrdata.decred.org/api";//"https://mainnet.decred.org/api";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Decred';
    chain.symbol = 'DCR';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    let address = null;
    if(toFind.substr(0,1) === "D") {
        address = await getAddress(toFind);
    }
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/" + addressToFind + "/totals";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            let address = {
                address: addressToFind,
                quantity: datas.dcr_unspent,
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

const getTransactions = function(txns, latestblock) {
    let transactions = [];
    txns.forEach(txn => {
        transactions.push(buildTransaction(txn, latestblock));
    });

    return transactions;            
}

const getTransactionsOG = async(address) => {
    let endpoint = "/address/" + address + "/tx";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.data.list.splice(0, 10);
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data));
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
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const data = response.data;

            const latestblock = await getLatestBlock();
            const transaction = buildTransaction(data, latestblock);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/latestblock";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const data = response.data;

            return data.height;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestblock) {
    let from = [];
    let to = [];
    txn.vin.forEach(input => {
        if(from.indexOf(input.addr) === -1){
            from.push(input.addr);
        }
    });
    txn.vout.forEach(output => {
        output.scriptPubKey.addresses.forEach(address =>{
            if(to.indexOf(address) === -1){
                to.push(address);
            }
        });
    });

    const transaction = {
        hash: txn.txid,
        block: txn.blockheight,
        quantity: txn.valueOut,
        symbol: "DCR",
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}