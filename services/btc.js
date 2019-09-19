const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://blockchain.info";//"https://chain.api.btc.com/v3";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

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

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
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
        let inout = "";
        let quantity = "";
        let symbol = "";
        transaction.froms.forEach(from => {
            for(let i = 0; i < from.addresses.length; i++) {
                if(from.addresses[i] === address) {
                    quantity = from.quantity;
                    symbol = from.symbol;
                    inout = "Sender";
                    break;
                }
            }
        });
        if(inout === "") {
            inout = "Receiver";
            transaction.tos.forEach(to => {
                for(let i = 0; i < to.addresses.length; i++) {
                    if(to.addresses[i] === address) {
                        quantity = to.quantity;
                        symbol = to.symbol;
                        break;
                    }
                }
            });
        }
        transaction.inout = inout;
        if(inout === "Receiver") {
            transaction.ios = transaction.froms;
        } else {            
            transaction.ios = transaction.tos;
        }
        
        transaction.froms = [];
        transaction.tos = [];
        transaction.quantity = quantity;
        transaction.symbol = symbol;
        transactions.push(transaction);
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

const buildTransactionOG = function(txn, latestblock) {
    let from = [];
    let to = [];
    let quantity = 0;
    txn.inputs.forEach(input => {
        if(typeof input.prev_out !== "undefined") {
            if(from.length === 0 || from.indexOf(input.prev_out.addr) < 0){
                from.push(input.prev_out.addr);
            }
        }
    });
    txn.out.forEach(output => {
        if(to.length === 0 || to.indexOf(output.addr) < 0){
            to.push(output.addr);
        }
        quantity += output.value;
    });
    const confirmations = latestblock > 0 ? latestblock - txn.block_height : null;
    const newQuantity = quantity/100000000;
    const total = helperSvc.commaBigNumber(newQuantity.toString());
    
    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.block_height,
        quantity: total,
        symbol: "BTC",
        confirmations: confirmations,
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