const axios = require('axios');
const helperSvc = require('../helper.service.js');
const addressBase = "https://api.cosmostation.io";
const txnsBase = "https://app-es.cosmostation.io/cosmos/v1/getTxsByAddr";
const txnBase = "https://lcd.cosmostation.io";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Cosmos';
    chain.symbol = 'ATOM';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let contract = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.contract = contract;
    chain.transaction = transaction;
    
    if(chain.block || chain.address || chain.contract || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v1/account/balance/" + addressToFind;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;

            let balance = 0;
            
            datas.forEach(bal => {
                if(bal.denom === "uatom") {
                    balance += parseFloat(bal.amount)/1000000;
                }
            });
            
            let delations = await getAddressDelegations(addressToFind);
            balance += delations;
            
            let unbonding = await getAddressUnbondings(addressToFind);
            balance += unbonding;
            
            const total = helperSvc.commaBigNumber(balance.toString());

            const txnCount = await getAddressTxnCount(addressToFind);

            let address = {
                address: addressToFind,
                quantity: total,
                hasTransactions: true,
                transactionCount: txnCount
            };

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressRewards = async(address) => {
    let endpoint = "/v1/account/delegations/rewards/" + address;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);

        let balance = 0;
        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;
            
            for(let del of datas) {
                del.reward.forEach(reward => {
                    if(reward.denom === "uatom") {
                        balance += parseFloat(reward.amount)/1000000;
                    }
                })
            }
        }
        return balance;
    } catch(error) {
        return 0;
    }
}

const getAddressDelegations = async(address) => {
    let endpoint = "/v1/account/delegations/" + address;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);

        let balance = 0;
        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;
            
            for(let del of datas) {
                balance += parseFloat(del.amount)/1000000;
                del.delegator_rewards.forEach(reward => {
                    if(reward.denom === "uatom") {
                        balance += parseFloat(reward.amount)/1000000;
                    }
                })
            }
        }
        return balance;
    } catch(error) {
        return 0;
    }
}

const getAddressUnbondings = async(address) => {
    let endpoint = "/v1/account/unbonding-delegations/" + address;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);

        let balance = 0;
        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;
            
            for(let del of datas) {
                del.entries.forEach(entry => {
                    balance += parseFloat(entry.balance)/1000000;
                })
            }
        }
        return balance;
    } catch(error) {
        return 0;
    }
}

const getAddressTxnCount = async(address) => {
    let data = buildPostData(address);

    try {
        const response = await axios.post(txnsBase, data);
        
        let count = 0;
        if(typeof response.data.error_code === "undefined") {
            const datas = response.data;
            
            count = helperSvc.commaBigNumber(datas.hits.total.toString());
        }

        return count;
    } catch(error) {
        return 0;
    }
}

const getAddressOG = async(addressToFind) => {
    let endpoint = "/v1/account/balance/" + addressToFind;
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
            if(datas.rewards !== null) {
                let rwds = 0;
                datas.rewards.forEach(rew => {
                    if(rew.denom === "uatom") {
                        const amount = parseFloat(rew.amount)/1000000;
                        rwds += amount;
                    }
                })            
                balance += rwds;
            }
            if(datas.delegations !== null) {
                let dels = 0;
                datas.delegations.forEach(del => {
                    let delAmount = parseFloat(del.amount)/1000000;
                    dels += delAmount;
                })
                balance += dels;
            }
            const total = helperSvc.commaBigNumber(balance.toString());

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

const getBlock = async(blockNumber) => {
    blockNumber = +blockNumber;
    const searchNumber = blockNumber - 1;
    let endpoint = `/v1/blocks?limit=1&afterBlock=${searchNumber}`;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.error_code === 'undefined' && response.data !== null && response.data.length > 0 && response.data[0].height === blockNumber) {
            const datas = response.data[0];
            const latestBlock = await getLatestBlock();

            const block = await buildBlock(datas, latestBlock);

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = `/v1/blocks?limit=20`;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        let blocks = [];
        if(typeof response.data.error_code === 'undefined' && response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = datas[0].height;

            for(let data of datas) {
                const block = await buildBlock(data, latestBlock);
                
                blocks.push(block);
            }

        } 

        return blocks;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = `/v1/blocks?limit=1`;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        let latestBlock = 0;
        if(typeof response.data.error_code === 'undefined' && response.data !== null && response.data.length > 0) {
            const datas = response.data[0];

            latestBlock = datas.height;
        } 

        return latestBlock;
    } catch(error) {
        return 0;
    }
}

const buildBlock = async(datas, latestBlock) => {
    let confirmations = latestBlock > 0 ? latestBlock - datas.height : -1;

    let block = {
        blockNumber: datas.height,
        validator: datas.operator_address,
        transactionCount: datas.num_txs,
        confirmations: confirmations,
        date: datas.time,
        hash: datas.block_hash,
        hasTransactions: true
    };
    if(datas.tx_data !== null && datas.tx_data.txs !== null && datas.tx_data.txs.length > 0) {
        let transactions = [];
        let volume = 0;
        for(let i = 0; i < datas.tx_data.txs.length; i++) {
            const transaction = await getTransaction(datas.tx_data.txs[i]);
            if(transaction !== null) {
                transaction.tos.forEach(to => {
                    if(to.symbol === "ATOM") {
                        volume+= +to.quantity;
                    }
                });
                transactions.push(transaction);
            }
        }
        block.volume = volume;
        block.transactions = transactions;
    }

    return block;
}

const getContract = async(address) => {
    let endpoint = "/v1/staking/validator/" + address;
    let url = addressBase + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;

        const balance = parseFloat(datas.tokens)/1000000;
        const total = helperSvc.commaBigNumber(balance.toString());

        let contract = {
            address: address,
            quantity: total,
            symbol: "ATOM",
            creator: datas.operator_address,
            contractName: datas.moniker,
            icon: datas.keybase_url
        };

        const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        contract.hasIcon = iconStatus;

        return contract;
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let url = txnsBase;
    let data = buildPostData(address);

    try{
        const response = await axios.post(url, JSON.stringify(data));
        if(response.data !== null && response.data.hits.total > 0) {
            const datas = response.data.hits.hits;
            const latestBlock = await getLatestBlock();

            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransactionNew(txn._source, latestBlock, address);
                
                if(transaction !== null) {
                    transaction = helperSvc.inoutCalculation(address, transaction);

                    transactions.push(transaction);
                }
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
            const latestBlock = await getLatestBlock();

            const transaction = buildTransactionNew(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildSendTransaction = function(txn, latestBlock, address = null) {
    let froms = [];
    let tos = [];
    const symbol = "ATOM";
    let success = false;
    let hash = "";
    let time = "";
    txn.tx.value.msg.forEach(msg => {
        let quantity = 0;
        let fromAddy = msg.value.from_address;
        let toAddy = msg.value.to_address;
        msg.value.amount.forEach(amt => {
            if(amt.denom === "uatom") {
                let amount = parseFloat(amt.amount)/1000000;
                quantity += amount;
            }
        })
        const from = helperSvc.getSimpleIO(symbol, fromAddy, quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, toAddy, quantity);
        tos.push(to);
    })
    if(typeof txn.tags !== 'undefined') {
        hash = txn.txhash;
        time = txn.timestamp;
        success = txn.logs[0].success;
    } else {
        hash = txn.hash;
        time = txn.time;
        success = txn.result.log[0].success;
    }
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    let confirmations = latestBlock > 0 ? latestBlock - txn.height : -1;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: hash,
        block: txn.height,
        confirmations: confirmations,
        date: time,
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };

    return transaction;
}

const buildRewardTransaction = function(txn, address = null) {
    let froms = [];
    let tos = [];
    let quantity = 0;
    const symbol = "ATOM";
    let tags = [];
    const block = txn.height;
    let time = "";
    let hash = "";
    let success = false;
    if(typeof txn.tags !== 'undefined') {
        hash = txn.txhash;
        tags = txn.tags;
        time = txn.timestamp;
        success = txn.logs[0].success;
    } else {
        hash = txn.hash;
        tags = txn.result.tags;
        time = txn.time;
        success = txn.result.log[0].success;
    }
    for(let i = 0; i < tags.length; i++){
        const tag = tags[i];
        if(tag.key === "rewards") {
            quantity = 0;
            if(tag.value.includes("uatom")){
                let amount = tag.value.replace("uatom","");
                amount = parseFloat(amount)/1000000;
                quantity += amount;
            }
            let fromAddy = "", toAddy = "";
            if(tags[i+1].key === "delegator") {
                toAddy = tags[i+1].value;
            } 
            if(tags[i+2].key === "delegator" && toAddy === "") {
                toAddy = tags[i+2].value;
            } 
            if(tags[i+1].key === "source-validator") {
                fromAddy = tags[i+1].value;
            } 
            if(tags[i+2].key === "source-validator" && fromAddy === "") {
                fromAddy = tags[i+2].value;
            } 
            if(fromAddy !== "") {
                let from = helperSvc.getSimpleIO(symbol, fromAddy, quantity);
                from.type = enums.transactionType.REWARD;
                froms.push(from);
            }
            if(toAddy !== "") {
                const to = helperSvc.getSimpleIO(symbol, toAddy, quantity);
                to.type = enums.transactionType.REWARD;
                tos.push(to);
            }
        }
    }
    
    for(let [key, value] of Object.entries(txn.tx.value.msg)) {
        if(value.type.indexOf('Delegate') >= 0) {
            quantity = +value.value.amount.amount/1000000;
            let from = helperSvc.getSimpleIO(symbol, value.value.validator_address, quantity);
            from.type = enums.transactionType.DELEGATION;
            froms.push(from);
            let to = helperSvc.getSimpleIO(symbol, value.value.delegator_address, quantity);
            to.type = enums.transactionType.DELEGATION;
            tos.push(to);
        }
    }

    const fromData = helperSvc.cleanIOTypes(froms);
    const toData = helperSvc.cleanIOTypes(tos);

    let transaction = {
        type: enums.transactionType.REWARD,
        hash: hash,
        block: block,
        date: time,
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };
    
    return transaction;
}

const buildUnbondingTransaction = function(txn, address = null) {
    let froms = [];
    let tos = [];
    let quantity = 0;
    const symbol = "ATOM";
    let tags = [];
    const block = txn.height;
    let time = "";
    let hash = "";
    let success = false;
    if(typeof txn.tags !== 'undefined') {
        hash = txn.txhash;
        tags = txn.tags;
        time = txn.timestamp;
        success = txn.logs[0].success;
    } else {
        hash = txn.hash;
        tags = txn.result.tags;
        time = txn.time;
        success = txn.result.log[0].success;
    }
    
    for(let [key, value] of Object.entries(txn.tx.value.msg)) {
        if(value.type.indexOf('Undelegate') >= 0) {
            quantity = +value.value.amount.amount/1000000;
            let from = helperSvc.getSimpleIO(symbol, value.value.validator_address, quantity);
            from.type = enums.transactionType.UNDELEGATE;
            froms.push(from);
            let to = helperSvc.getSimpleIO(symbol, value.value.delegator_address, quantity);
            to.type = enums.transactionType.UNDELEGATE;
            tos.push(to);
        }
    }
    
    const fromData = helperSvc.cleanIOTypes(froms);
    const toData = helperSvc.cleanIOTypes(tos);

    let transaction = {
        type: enums.transactionType.UNDELEGATE,
        hash: hash,
        block: block,
        date: time,
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };
    
    return transaction;
}

const buildTransaction = function(txn, address = null) {
    let txnType = ""
    if((typeof txn.tags !== 'undefined') && txn.tags !== null && txn.tags.length > 0 && txn.tags[0].key === "action") {
        txnType = txn.tags[0].value;
    } else if((typeof txn.result.tags !== 'undefined') && txn.result.tags !== null && txn.result.tags.length > 0 && txn.result.tags[0].key === "action") {
        txnType = txn.result.tags[0].value;
    }
    
    if(txnType === "send") {
        return buildSendTransaction(txn, address);
    } else if (txnType === "withdraw_delegator_reward") {
        return buildRewardTransaction(txn, address);
    } else if(txnType === "begin_unbonding") {
        return buildUnbondingTransaction(txn, address);
    } else {
        return null;
    }
}

const buildTransactionNew = function(txn, address = null) {
    let txnType = "";

    for(let msg of txn.tx.value.msg) {
        if (msg.type.indexOf("MsgWithdrawDelegationReward") > 0 || msg.type.indexOf("MsgDelegate") > 0) {
            txnType = "MsgWithdrawDelegationReward";
        } else if (msg.type.indexOf("MsgUndelegate") > 0) {
            txnType = "MsgUndelegate";
        } else if (msg.type.indexOf("MsgSend") > 0) {
            txnType = "MsgSend";
        }
    }
        
    if(txnType === "MsgSend") {
        return buildSendTransactionNew(txn, address);
    } else if (txnType === "MsgWithdrawDelegationReward") {
        return buildRewardTransactionNew(txn, address);
    } else if(txnType === "MsgUndelegate") {
        return buildUnbondingTransactionNew(txn, address);
    } else {
        return null;
    }
}

const buildRewardTransactionNew = function(txn, address = null) {
    let froms = [];
    let tos = [];
    const symbol = "ATOM";
    const block = txn.height;
    const hash = (typeof txn.txhash !== 'undefined') ? txn.txhash : txn.hash;
    let success = true;
    
    for(let i = 0; i < txn.logs.length; i++) {
        let log = txn.logs[i];
        let msg = txn.tx.value.msg[i];
        let quantity = 0;
        let type = enums.transactionType.REWARD;
        if(!log.success) {
            success = false;
        }

        if(msg.type.indexOf('MsgDelegate') >= 0) {
            quantity = +msg.value.amount.amount/1000000;
            type = enums.transactionType.DELEGATION;
        }
        else if (msg.type.indexOf('MsgWithdrawDelegationReward') >= 0) {
            quantity = 0;
            for(let event of log.events) {
                for(let attr of event.attributes) {
                    if (attr.key === "amount" && attr.value.indexOf("uatom") >= 0) {
                        let amount = attr.value.replace("uatom","");
                        amount = parseFloat(amount)/1000000;
                        quantity += amount;
                    }
                }
            }
        }

        let from = helperSvc.getSimpleIO(symbol, msg.value.validator_address, quantity);
        from.type = type;
        froms.push(from);

        let to = helperSvc.getSimpleIO(symbol, msg.value.delegator_address, quantity);
        to.type = type;
        tos.push(to);
    }
    
    const fromData = helperSvc.cleanIOTypes(froms);
    const toData = helperSvc.cleanIOTypes(tos);

    let transaction = {
        type: enums.transactionType.REWARD,
        hash: hash,
        block: block,
        date: reformatTime(txn.timestamp),
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };
    
    return transaction;
}

const buildUnbondingTransactionNew = function(txn, address = null) {
    let froms = [];
    let tos = [];
    let quantity = 0;
    const symbol = "ATOM";
    const block = txn.height;
    const hash = (typeof txn.txhash !== 'undefined') ? txn.txhash : txn.hash;
    const success = true;

    for(let log of txn.logs) {
        if(!log.success) {
            success = false;
        }
    }
    
    for(let msg of txn.tx.value.msg) {
        if(msg.type.indexOf('MsgUndelegate') >= 0) {
            quantity = +msg.value.amount.amount/1000000;
            let from = helperSvc.getSimpleIO(symbol, msg.value.validator_address, quantity);
            from.type = enums.transactionType.UNDELEGATE;
            froms.push(from);
            let to = helperSvc.getSimpleIO(symbol, msg.value.delegator_address, quantity);
            to.type = enums.transactionType.UNDELEGATE;
            tos.push(to);
        }
    }

    const fromData = helperSvc.cleanIOTypes(froms);
    const toData = helperSvc.cleanIOTypes(tos);

    let transaction = {
        type: enums.transactionType.UNDELEGATE,
        hash: hash,
        block: block,
        date: reformatTime(txn.timestamp),
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };
    
    return transaction;
}

const buildSendTransactionNew = function(txn, latestBlock, address = null) {
    let froms = [];
    let tos = [];
    const symbol = "ATOM";
    const hash = (typeof txn.txhash !== 'undefined') ? txn.txhash : txn.hash;
    const success = true;

    for(let log of txn.logs) {
        if(!log.success) {
            success = false;
        }
    }
    
    for(let msg of txn.tx.value.msg) {
        let quantity = 0;
        let fromAddy = msg.value.from_address;
        let toAddy = msg.value.to_address;
        msg.value.amount.forEach(amt => {
            if(amt.denom === "uatom") {
                let amount = +amt.amount/1000000;
                quantity += amount;
            }
        })
        const from = helperSvc.getSimpleIO(symbol, fromAddy, quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, toAddy, quantity);
        tos.push(to);
    }
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    let confirmations = latestBlock > 0 ? latestBlock - txn.height : -1;

    let transaction = {
        type: enums.transactionType.TRANSFER,
        hash: hash,
        block: txn.height,
        confirmations: confirmations,
        date: reformatTime(txn.timestamp),
        froms: fromData,
        tos: toData,
        success: success ? 'success' : 'fail'
    };

    return transaction;
}

const reformatTime = function(ts) {
    let yr = ts.substr(0,4);
    let mo = ts.substr(5,2);
    let day = ts.substr(8,2);
    let time = ts.substr(11,5);
    mo = helperSvc.getMonth(mo);
    
    const reformatted = `${day}-${mo}-${yr} ${time}`;

    return reformatted;
}

const buildPostData = function(address) {    
    let data = {
        from: 0, 
        size: 10,
        query: {
                bool: {
                    should:[
                        {
                            multi_match: {
                                query: address ,
                                fields:[
                                    "tx.value.msg.value.delegator_address",
                                    "tx.value.msg.value.from_address",
                                    "tx.value.msg.value.to_address",
                                    "tx.value.msg.value.depositor",
                                    "tx.value.msg.value.voter",
                                    "tx.value.msg.value.inputs.address",
                                    "tx.value.msg.value.outputs.address",
                                    "tx.value.msg.value.proposer",
                                    "tx.value.msg.value.address"
                                ]
                            }
                        },
                        {
                            multi_match: {
                                query: address,
                                fields:[
                                    "tx.value.msg.value.address"
                                ]
                            }
                        },
                        {
                            bool: {
                                must: [
                                    {
                                        match: {
                                            "tx.value.msg.value.address": address,
                                        }
                                    },
                                    {
                                        match: {
                                            "tx.value.msg.type":"cosmos-sdk/MsgWithdrawValidatorCommission"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            sort:[
                {
                    height:
                    {
                        order: "desc"
                    }
                }
            ]
        };
    
    return data;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getBlocks
}