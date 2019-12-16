const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://api6.dunscan.io";// "https://api2.tzscan.io/v1";
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
    let block = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;
    
    if(chain.address || chain.block || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v3/balance/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data[0];

            const balance = getTz(datas);

            let address = {
                address: addressToFind,
                quantity: balance,
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

const getBlockHash = async(blockNumber) => {
    let endpoint = "/v3/block_hash_level/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });

        return response.data[0];
    } catch(err) {
        return null;
    }
}

const getTz = function(amount) {    
    const balance = +amount/1000000;
    const cleaned = helperSvc.decimalCleanup(balance.toString());
    const total = helperSvc.commaBigNumber(cleaned.toString());

    return total;
}

const getBlock = async(blockNumber) => {
    const hash = await getBlockHash(blockNumber);
    if(hash === null) { 
        return null;
    }
    let endpoint = "/v3/block/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;

        let ts = datas.timestamp;
        let yr = ts.substr(0,4);
        let mo = ts.substr(5,2);
        let day = ts.substr(8,2);
        let time = ts.substr(11,8);
        mo = helperSvc.getMonth(mo);
        
        ts = `${day}-${mo}-${yr} ${time}`;

        const volume = getTz(datas.volume);

        let block = {
            blockNumber: blockNumber,
            validator: datas.baker.tz,
            transactionCount: datas.nb_operations,
            date: ts,
            hash: hash,
            volume: volume,
            hasTransactions: true
        };

        return block;
    } catch (err) {
        return null;
    }
}

const getTransactions = async(hash) => {
    if(!helperSvc.hasLetters(hash)) {
        hash = await getBlockHash(hash);
        if(hash === null) { 
            return null;
        }
    }
    let txns = [];
    let activations = await getActivations(hash, true);
    if(activations.length > 0) {
        txns.push(...activations);
    }
    let delegations = await getDelegations(hash, true);
    if(delegations.length > 0) {
        txns.push(...delegations);
    }
    let endorsements = await getEndorsements(hash, true);
    if(endorsements.length > 0) {
        txns.push(...endorsements);
    }
    let originations = await getOriginations(hash, true);
    if(originations.length > 0) {
        txns.push(...originations);
    }
    let transactions = await getTransactionDetails(hash, true);
    if(transactions.length > 0) {
        txns.push(...transactions);
    }

    return txns;
}


const getTransactionDetails = async(hash, block = false) => {
    let endpoint = "/v3/operations/" + hash + "?type=Transaction";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn, latestBlock);
                if(!block) {
                    let inout = null;
                    if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                        transaction = helperSvc.inoutCalculation(hash, transaction);
                        // inout = transaction.from === hash ? "Sender" : "Receiver";
                        // transaction.inout = inout;
                    }
                }     
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getActivations = async(hash, block = false) => {
    let endpoint = "/v3/operations/" + hash + "?type=Activation";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn, latestBlock);
                if(!block) {
                    let inout = null;
                    if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                        transaction = helperSvc.inoutCalculation(hash, transaction);
                        // inout = transaction.from === hash ? "Sender" : "Receiver";
                        // transaction.inout = inout;
                    }
                }     
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getDelegations = async(hash, block = false) => {
    let endpoint = "/v3/operations/" + hash + "?type=Delegation";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn, latestBlock);
                if(!block) {
                    let inout = null;
                    if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                        transaction = helperSvc.inoutCalculation(hash, transaction);
                        // inout = transaction.from === hash ? "Sender" : "Receiver";
                        // transaction.inout = inout;
                    }
                }     
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getOriginations = async(hash, block = false) => {
    let endpoint = "/v3/operations/" + hash + "?type=Origination";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn, latestBlock);
                if(!block) {
                    let inout = null;
                    if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                        transaction = helperSvc.inoutCalculation(hash, transaction);
                        // inout = transaction.from === hash ? "Sender" : "Receiver";
                        // transaction.inout = inout;
                    }
                }     
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getEndorsements = async(hash, block = false) => {
    let endpoint = "/v3/operations/" + hash + "?type=Endorsement";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn, latestBlock);
                if(!block) {
                    let inout = null;
                    if(transaction.type !== enums.transactionType.ENDORSEMENT) {
                        transaction = helperSvc.inoutCalculation(hash, transaction);
                        // inout = transaction.from === hash ? "Sender" : "Receiver";
                        // transaction.inout = inout;
                    }
                }     
                transactions.push(transaction);
            });

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getATransactions = async(address) => {
    let endpoint = "/v3/operations/" + address + "?type=Transaction";
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
    let endpoint = "/v3/operation/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
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
    let endpoint = "/v3/head";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            return response.data.level;
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
    let ts = null;
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
        ts = txn.type.operations[0].timestamp;
        let yr = ts.substr(0,4);
        let mo = ts.substr(5,2);
        let day = ts.substr(8,2);
        let time = ts.substr(11,8);
        mo = helperSvc.getMonth(mo);
        
        ts = `${day}-${mo}-${yr} ${time}`;

        for(let op of txn.type.operations){
            from = op.src.tz;
            to = op.kind === "reveal" 
                ? ""
                : op.kind === "transaction"
                    ? op.destination.tz
                    : op.delegate.tz;
            block = parseInt(op.op_level);
            let quantity = op.kind === "transaction"
                ? parseFloat(op.amount)/1000000
                : type === enums.transactionType.ORIGINATION
                ? parseFloat(op.balance)/1000000
                : 0;
                
            let fromIO = helperSvc.getSimpleIO(symbol, from, quantity);
            froms.push(fromIO);
            if(to !== "") {
                let toIO = helperSvc.getSimpleIO(symbol, to, quantity);
                tos.push(toIO);
            }
        }
        if(froms.length > 0){
            fromDatas = helperSvc.cleanIO(froms);
        }
        if(tos.length > 0){
            toDatas = helperSvc.cleanIO(tos);
        }

    } else if (txn.type.kind === "endorsement") {
        type = enums.transactionType.ENDORSEMENT;
        from = txn.type.endorser.tz;
        block = parseInt(txn.type.op_level);
        ts = txn.type.timestamp;
    }
    
    const confirmations = latestBlock > 0 ? parseInt(latestBlock) - block : -1;

    let transaction = {
        type: type,
        hash: txn.hash,
        block: block,
        confirmations: confirmations,
        date: ts,
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