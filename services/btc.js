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
    if(searchType & enums.searchType.transaction && address === null) {
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
            let address = {
                address: datas.address,
                quantity: datas.final_balance/100000000,
                hasTransactions: true
            };
            const latestblock = await getLatestBlock();
            const txns = datas.txs.slice(0, 10);
            address.transactions = getTransactions(txns, latestblock);

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
    let from = [];
    let to = [];
    let quantity = 0;
    txn.inputs.forEach(input => {
        if(typeof input.prev_out !== "undefined") {
            from.push(input.prev_out.addr);
        }
    });
    txn.out.forEach(output => {
        to.push(output.addr);
        quantity += output.value;
    });
    const confirmations = latestblock > 0 ? latestblock - txn.block_height : null;
    // if(txn.is_coinbase) {
    //     from.push("Coinbase");
    // } else {
    //     txn.inputs.forEach(input => {
    //         from.push(input.prev_out.addr);
    //     })
    //     for(let i = 0; i < txn.inputs.length; i++) {
    //         txn.inputs[i].prev_addresses.forEach(address => {
    //             if(address && from.indexOf(address) <= -1) {
    //                 from.push(address);
    //             }
    //         })
    //     }
    // }
    // for(let i = 0; i < txn.outputs.length; i++) {
    //     txn.outputs[i].addresses.forEach(address => {
    //         if(address && to.indexOf(address) <= -1) {
    //             to.push(address);
    //         }
    //     })
    // }
    
    const transaction = {
        hash: txn.hash,
        block: txn.block_height,
        quantity: quantity/100000000,
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