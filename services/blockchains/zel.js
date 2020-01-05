const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.zel.cash/api";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'ZelCash';
    chain.symbol = 'ZEL';
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
    let endpoint = "/addr/" + addressToFind + "/?noTxList=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const total = helperSvc.commaBigNumber(datas.balance.toString());

            let address = {
                address: datas.addrStr,
                quantity: total,
                transactionCount: datas.txApperances,
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
    let endpoint = "/block-index/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data === null) {
            return null;
        }

        return response.data.blockHash;
    } catch (err) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/blocks";
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        return response.data.blocks[0].height;
    } catch (err) {
        return 0;
    }

}

const getBlock = async(blockNumber) => {
    const hash = await getBlockHash(blockNumber);
    if(hash === null) {
        return null;
    }
    
    let endpoint = "/block/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data;
        const latestBlock = await getLatestBlock();

        let block = buildBlock(datas, latestBlock);

        return block;
    } catch (err) {
        return null;
    }
}

const getBlocks = async() => {    
    let endpoint = "/blocks";
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        const datas = response.data.blocks;
        const latestBlock = datas[0].height;

        let blocks = [];
        for(let data of datas) {
            let block = buildBlock(data, latestBlock);

            blocks.push(block);
        }

        return blocks;
    } catch (err) {
        return [];
    }
}

const buildBlock = function(data, latestBlock) {
        let block = {
        blockNumber: data.height,
        validator: data.minedBy,
        transactionCount: data.tx.length,
        confirmations: latestBlock - data.height,
        date: helperSvc.unixToUTC(data.time),
        size: `${helperSvc.commaBigNumber(data.size.toString())} bytes`,
        hash: data.hash,
        hasTransactions: true
    };

    return block;
}

const getTransactions = async(address) => {
    let queryString = "";
    let hash = "";
    let isBlock = false;
    if(helperSvc.hasLetters(address)) {
        hash = address;
        queryString = "address"
    } else {
        isBlock = true;
        hash = await getBlockHash(address);
        if(hash === null) {
            return [];
        }
        queryString = "block"
    }
    let endpoint = `/txs?${queryString}=${hash}&pageNum=0`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(response.data !== null) {
            const datas = response.data.txs;
            let transactions = [];
            datas.forEach(txn =>{ 
                let transaction = buildTransaction(txn);

                if(!isBlock) {
                    transaction = helperSvc.inoutCalculation(address, transaction);
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
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
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

const buildTransaction = function(txn) {
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;
    const symobl = "ZEL";
    if(txn.isCoinBase) {
        type = enums.transactionType.MINING;
        const from = {
            addresses: ["coinbase"]
        }
        froms.push(from);
    } else {
        txn.vin.forEach(input => {
            const from = helperSvc.getSimpleIO(symobl, input.addr, input.value);
            froms.push(from);
        })
    }
    txn.vout.forEach(output => {
        const to = helperSvc.getSimpleIOAddresses(symobl, output.scriptPubKey.addresses, output.value);
        tos.push(to);
    })
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    let transaction = {
        type: type,
        hash: txn.txid,
        block: txn.blockheight,
        confirmations: txn.confirmations === 0 ? -1 : txn.confirmations,
        date: helperSvc.unixToUTC(txn.time),
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
    getTransaction,
    getBlocks
}