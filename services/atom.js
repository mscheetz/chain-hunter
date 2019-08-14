const axios = require('axios');
const helperSvc = require('./helperService.js');
const addressBase = "https://api.cosmostation.io";
const txnBase = "https://lcd.cosmostation.io";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Cosmos';
    chain.symbol = 'ATOM';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    let address = null;
    if(toFind.substr(0,6) === "cosmos") {
        address = await getAddress(toFind);
    }
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v1/account/" + addressToFind;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;

            let balance = 0;
            let avail = 0;
            datas.balance.forEach(bal => {
                if(bal.denom === "uatom") {
                    avail = parseFloat(bal.amount)/1000000;
                }
            });
            balance += avail;
            let rwds = 0;
            datas.rewards.forEach(rew => {
                if(rew.denom === "uatom") {
                    const amount = parseFloat(rew.amount)/1000000;
                    rwds += amount;
                }
            })
            balance += rwds;
            let dels = 0;
            datas.delegations.forEach(del => {
                let delAmount = parseFloat(del.amount)/1000000;
                dels += delAmount;
            })
            balance += dels;
            let address = {
                address: addressToFind,
                quantity: balance,
                hasTransactions: false
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
    let endpoint = "/txs?address=" + address + "&pageNum=0";
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data.txs;
            let transactions = [];
            datas.forEach(txn =>{ 
                transactions.push(buildTransaction(txn));
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
    let endpoint = "/txs/" + hash;
    let url = txnBase + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error === "undefined") {
            const datas = response.data;
            const transaction = buildTransaction(datas);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildSendTransaction = function(txn) {
    let from = [];
    let to = [];
    let quantity = 0;
    txn.tx.value.msg.forEach(msg => {
        from.push(msg.value.from_address);
        to.push(msg.value.to_address);
        msg.value.amount.forEach(amt => {
            if(amt.denom === "uatom") {
                let amount = parseFloat(amt.amount)/1000000;
                quantity += amount;
            }
        })
    })

    let transaction = {
        hash: txn.txhash,
        quantity: quantity,
        block: txn.height,
        //confirmations: txn.confirmations,
        symbol: "ATOM",
        date: txn.timestamp,
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}

const buildRewardTransaction = function(txn) {
    let from = [];
    let to = [];
    let quantity = 0;
    txn.tags.forEach(tag => {
        if(tag.key === "rewards") {
            if(tag.value.includes("uatom")){
                let amount = tag.value.replace("uatom","");
                amount = parseFloat(amount)/1000000;
                quantity += amount;
            }
        }
        if(tag.key === "delegator") {
            if(to.indexOf(tag.value) === -1){
                to.push(tag.value);
            }
        }
        if(tag.key === "source-validator") {
            if(from.indexOf(tag.value) === -1){
                from.push(tag.value)
            }
        }
    })

    let transaction = {
        hash: txn.txhash,
        quantity: quantity,
        block: txn.height,
        //confirmations: txn.confirmations,
        symbol: "ATOM",
        date: txn.timestamp,
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}

const buildTransaction = function(txn) {
    if(txn.tags[0].key === "action") {
        if(txn.tags[0].value === "send") {
            return buildSendTransaction(txn);
        } else if (txn.tags[0].value === "withdraw_delegator_reward") {
            return buildRewardTransaction(txn);
        }
    }
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}