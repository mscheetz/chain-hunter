const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://ravencoin.network/api";
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Raven Coin';
    chain.symbol = 'RVN';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
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
    let endpoint = "/addr/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const quantity = response.data.balance;
        const total = helperSvc.commaBigNumber(quantity.toString());

        if(response.data) {
            const address = {
                address: response.data.addrStr,
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

const getBlockHash = async(blockNumber) => {
    let endpoint = "/block-index/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data === 'string') {
            return null;
        }

        return response.data.blockHash;
    } catch (err) {
        return null;
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
        const response = await axios.get(url);
        const datas = response.data;

        let block = {
            blockNumber: blockNumber,
            validator: datas.minedBy,
            transactionCount: datas.tx.length,
            date: helperSvc.unixToUTC(datas.time),
            size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
            hash: hash,
            hasTransactions: true
        };

        return block;
    } catch(error) {
        return null;
    }
}

const getBlockTransactions = async(blockNumber) => {
    const hash = await getBlockHash(blockNumber);

    if(hash === null) {
        return null;
    }
    let endpoint = `/txs?block=${hash}&pageNum=0`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.txs;
        
        let transactions = [];
        if(datas.length > 0) {
            datas.forEach(txn => {
                const transaction = buildTransaction(txn);

                transactions.push(transaction);
            })
        }

        return transactions;
    } catch(err) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/txs?address=" + address +"&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data !== null) {
            const datas = response.data.txs.splice(0, 10);
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data);

                    transaction = helperSvc.inoutCalculation(address, transaction);

                    transactions.push(transaction);
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
        if(response.data) {
            const transaction = buildTransaction(response.data);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    if(txn != null) {
        let froms = [];
        let tos = [];
        const symbol = "RVN";
        txn.vin.forEach(vin => {
            let fromAddress = "";
            if(typeof vin.coinbase !== 'undefined') {
                fromAddress = "coinbase";
            } else {
                fromAddress = vin.addr;
            }
            const from = helperSvc.getSimpleIO(symbol, fromAddress, vin.value);
            froms.push(from);
        });
        txn.vout.forEach(out => {
            if(out.scriptPubKey && out.scriptPubKey.addresses ) {
                const to = helperSvc.getSimpleIOAddresses(symbol, out.scriptPubKey.addresses, out.value);
                tos.push(to);
            }
        });

        const fromData = helperSvc.cleanIO(froms);
        const toData = helperSvc.cleanIO(tos);

        let transaction = {
            type: enums.transactionType.TRANSFER,
            hash: txn.txid,
            block: txn.blockheight,
            confirmations: txn.confirmations,
            date: helperSvc.unixToUTC(txn.blocktime),
            froms: fromData,
            tos: toData
        }
        return transaction;
    }

    return null;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getBlockTransactions,
    getTransactions,
    getTransaction
}