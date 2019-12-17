const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://roma-net.mdw.aepps.com";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Aeternity';
    chain.symbol = 'AE';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let block = null;
    let address = null;
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
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.block = block;
    chain.address = address;
    chain.transaction = transaction;
    
    if(chain.block || chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getBlock = async(blockNumber) => {
    let endpoint = `/middleware/generations/${blockNumber}/${blockNumber}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data !== "undefined" && response.data !== null && response.data.data !== null && response.data.total_micro_blocks > 0) {
            const datas = response.data.data[blockNumber.toString()];
            const txnCount = response.data.total_transactions;
            let ts = datas.time.toString().substr(0,10);

            let block = {
                blockNumber: blockNumber,
                validator: datas.miner,
                transactionCount: txnCount,
                date: helperSvc.unixToUTC(ts),
                hash: datas.hash,
                hasTransactions: true
            };

            if(datas.micro_blocks) {
                const latestblock = await getLatestBlock();
                let values = [];
                let i = 0;
                let transactions = [];

                for(const [key, value] of Object.entries(datas.micro_blocks)) {
                    for(const [txnKey, txnValue] of Object.entries(value.transactions)) {
                        if(typeof txnValue.tx.amount !== 'undefined') {
                            let value = 0;
                            if(txnValue.tx.amount.toString().indexOf('e')>=0){
                                value = helperSvc.exponentialToNumber(txnValue.tx.amount);
                            } else {
                                value = txnValue.tx.amount;
                            }
                            values.push(helperSvc.bigNumberToDecimal(value.toString(), 18));
                        }
                        const transaction = buildTransaction(txnValue, "", latestblock, ts, enums.searchType.block);
                        
                        transactions.push(transaction);
                        i++;
                    }
                }
                let summed = 0;
                if(values.length > 0) {
                    summed = values.reduce((a, b) => +a + +b, 0);
                }
                block.volume = summed;
                block.transactions = transactions;
            }
            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v2/accounts/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const quantity = datas.balance/1000000000000000000;
        const total = helperSvc.commaBigNumber(quantity.toString());
        const address = {
            address: datas.id,
            quantity: total,
            hasTransactions: true
        };

        return address;
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/v2/key-blocks/current/height";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.height;
    } catch(error) {
        return 0;
    }
}

const getCurrentBlock = async(block) => {
    let endpoint = "/v2/generations/height/" + block;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data.key_block !== "undefined") {
            return response.data.key_block;
        }
        else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlockTime = async(block) => {
    const blockInfo = await getCurrentBlock(block);

    return blockInfo === null ? 0 : blockInfo.time;
}

const getTransactions = async(address) => {
    let endpoint = "/middleware/transactions/account/" + address + "?limit=10&page=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            let transactions = [];
            datas.forEach(data => {
                let transaction = buildTransaction(data, "", latestBlock, 0);
                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            })

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/v2/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        const latestBlock = await getLatestBlock();
        const txnBlockTime = await getBlockTime(datas.block_height);
        const transaction = buildTransaction(datas, hash, latestBlock, txnBlockTime);

        return transaction;
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn, hash, latestBlock, blockTime, source = enums.searchType.transaction) {
    let ts = "";
    let froms = [];
    let tos = [];
    const symbol = "AE";
    let type = enums.transactionType.TRANSFER;

    if(txn.tx.type === "NamePreclaimTx") {
        type = enums.transactionType.NAMEPRECLAIM;
        const from = { 
            addresses: [ txn.tx.account_id ]
        };
        froms.push(from);
        const to = { 
            addresses: [ txn.tx.commitment_id ]
        };
        tos.push(to);
    } else {
        let value = txn.tx.amount.toString().indexOf("e") > 0 
                    ? helperSvc.exponentialToNumber(txn.tx.amount)
                    : txn.tx.amount;
        const quantity = helperSvc.bigNumberToDecimal(value.toString(), 18);
        const from = helperSvc.getSimpleIO(symbol, txn.tx.sender_id, quantity);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, txn.tx.recipient_id, quantity);
        tos.push(to);
    }

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    if(typeof txn.time !== "undefined") {
        ts = txn.time.toString().substr(0,10);
    } else if(blockTime > 0){
        ts = blockTime.toString().substr(0,10);
    }

    let transaction = {
        type: type,
        hash: hash === "" ? txn.hash : hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        date: helperSvc.unixToUTC(ts),
        froms: fromData,
        tos: toData
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