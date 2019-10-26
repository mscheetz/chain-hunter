const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://api2.tzscan.io/v1";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tezos';
    chain.symbol = 'XTZ';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
    let endpoint = "/node_account/" + addressToFind;
    let url = base + endpoint;
    let referer = 'https://tzscan.io/'+ addressToFind;
    let config = {
        headers: {
            Referer: referer
        }
    };

    try{
        const response = await axios.get(url, config);
        if(response.data !== null) {
            const datas = response.data;

            const balance = parseFloat(datas.balance)/1000000;
            const cleaned = helperSvc.decimalCleanup(balance.toString());
            const total = helperSvc.commaBigNumber(cleaned.toString());

            let address = {
                address: addressToFind,
                quantity: total,
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

const getTransactions = async(address) => {
    let endpoint = "/operations/" + address + "?type=Transaction&p=0&number=10";
    let url = base + endpoint;
    let referer = 'https://tzscan.io/'+ address;
    let config = {
        headers: {
            Referer: referer
        }
    };

    try{
        const response = await axios.get(url, config);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                const transaction = buildTransaction(txn, latestBlock);
                let inout = null;
                if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                    inout = transaction.from === address ? "Sender" : "Receiver";
                    transaction.inout = inout;
                }                
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/operation/" + hash;
    let url = base + endpoint;
    let referer = 'https://tzscan.io/'+ hash;
    let config = {
        headers: {
            Referer: referer
        }
    };

    try{
        const response = await axios.get(url, config);
        if(response.data !== null) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            const transaction = buildTransaction(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "blocks_with_pred_fitness?p=0&number=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            return response.data[0].block.level;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }

}

const buildTransaction = function(txn, latestBlock) {
    let type = null;
    let froms = [];
    let tos = [];
    let from = null;
    let to = null;
    let fromDatas = null;
    let toDatas = null;
    let block = 0;
    let timestamp = null;
    let total = null;
    const symbol = "XTZ";
    if((typeof txn.type.kind.operations !== 'undefined') || txn.type.kind === "manager") {
        const kind = txn.type.operations[0].kind;
        type = kind === "delegation" 
                ? enums.transactionType.DELEGATION
                : kind === "origination"
                ? enums.transactionType.ORIGINATION
                : kind === "transaction"
                ? enums.transactionType.TRANSFER
                : enums.transactionType.ACTIVATION;

        from = txn.type.operations[0].src.tz;
        to = type === enums.transactionType.TRANSFER
            ? txn.type.operations[0].destination.tz
            : txn.type.operations[0].delegate.tz;
        block = parseInt(txn.type.operations[0].op_level);
        timestamp = txn.type.operations[0].timestamp;

        let quantity = type === enums.transactionType.TRANSFER
            ? parseFloat(txn.type.operations[0].amount)/1000000
            : type === enums.transactionType.ORIGINATION
            ? parseFloat(txn.type.operations[0].balance)/1000000
            : 0;
        if(quantity > 0) {
            let fromIO = helperSvc.getSimpleIO(symbol, from, quantity);
            froms.push(fromIO);            
            let toIO = helperSvc.getSimpleIO(symbol, to, quantity);
            tos.push(toIO);
            fromDatas = helperSvc.cleanIO(froms);
            toDatas = helperSvc.cleanIO(tos);
        }

    } else if (txn.type.kind === "endorsement") {
        type = enums.transactionType.ENDORSEMENT;
        from = txn.type.endorser.tz;
        block = parseInt(txn.type.op_level);
        timestamp = txn.type.timestamp;
    }
    
    const confirmations = latestBlock > 0 ? parseInt(latestBlock) - block : -1;

    let transaction = {
        type: type,
        hash: txn.hash,
        block: block,
        confirmations: confirmations,
        date: timestamp,
    };
    if(total !== null) {
        transaction.quantity = total;
        transaction.symbol = symbol;
    }
    if(fromDatas != null) {
        transaction.froms = fromDatas;
    } else if(from !== null) {
        transaction.from = from;
    }
    if(toDatas != null) {
        transaction.tos = toDatas;
    } else if(to !== null) {
        transaction.to = to;
    }

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}