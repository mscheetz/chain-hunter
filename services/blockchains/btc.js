const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://blockchain.info";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Bitcoin';
    chain.symbol = 'BTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.transaction = transaction;
    
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/rawaddr/" + addressToFind + "?limit=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const quantity = datas.final_balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: datas.address,
                quantity: total,
                hasTransactions: true
            };
            const latestblock = await getLatestBlock();
            const txns = datas.txs.slice(0, 10);
            address.transactions = getTransactions(txns, latestblock, datas.address);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = function(txns, latestblock, address) {
    let transactions = [];
    txns.forEach(txn => {
        let transaction = buildTransaction(txn, latestblock);
        transaction = helperSvc.inoutCalculation(address, transaction);
        
        transactions.push(transaction);
    });

    return transactions;            
}

const getTransaction = async(hash) => {
    let endpoint = "/rawtx/" + hash;
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
    let froms = [];
    let tos = [];
    txn.inputs.forEach(input => {
        let from = null;
        if(typeof input.prev_out === "undefined") {
            from = {
                addresses: ["coinbase"]
            }
        } else {
            from = helperSvc.getIO("BTC", input, true);
        }
        froms.push(from);
    });
    txn.out.forEach(output => {
        const to = helperSvc.getIO("BTC", output, false);
        tos.push(to);
    });

    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);
    
    const confirmations = latestblock > 0 ? latestblock - txn.block_height : null;
    
    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.block_height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.time),
        froms: fromDatas,
        tos: toDatas
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