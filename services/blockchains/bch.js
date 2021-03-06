const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://bch-chain.api.btc.com/v3";
const convertBase = "https://bch.btc.com/tools"
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Bitcoin Cash';
    chain.symbol = 'BCH';
    chain.hasTokens = false;
    chain.hasContracts = false;
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
        if(toFind.substr(0, 1) === "q" || toFind.substr(0, 1) === "p" || toFind.substr(0, 11) === "bitcoincash") {
            toFind = await addressConvert(toFind);
        }
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

const addressConvert = async(address) => {
    let endpoint = "/bch-addr-convert?address=" + address;
    let url = convertBase + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0) {
            return response.data.data.base58;
        } else {
            return null;
        }
    } catch(err) {
        return null;
    }
}

const getAddress = async(addressToFind) => {
    let endpoint = "/address/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.data;
            const quantity = datas.balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            const address = {
                address: datas.address,
                quantity: total,
                transactionCount: datas.tx_count,
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
    let endpoint = `/block/${blockNumber}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data.data !== 'undefined' && response.data.data !== null && response.data.err_no === 0) {
            const datas = response.data.data;
            
            let block = buildBlock(datas);

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let today = new Date();
    let day = today.getDate().toString();
    let month = (today.getMonth() + 1).toString();
    day = day.length < 2 ? `0${day}` : day;
    month = month.length < 2 ? `0${month}` : month;
    let blockDate = `${today.getFullYear()}${month}${day}`;
    let endpoint = `/block/date/${blockDate}`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(response.data !== null && response.data.err_no === 0 && response.data.data.length > 0) {
            const datas = response.data.data;
            
            let blocks = [];
            let i = 0;
            for(let data of datas) {
                i++;
                if(i === 20){
                    break;
                }
                const block = buildBlock(data);

                blocks.push(block);
            }
            return blocks;
        } else {
            return null;
        }

    } catch(error) {
        return null;
    }
}

const buildBlock = function(datas) {
    let validator = (typeof datas.extras !== 'undefined' && typeof datas.extras.pool_name !== 'undefined')
        ? datas.extras.pool_name
        : null;

    let block = {
        blockNumber: datas.height,
        confirmations: datas.confirmations,
        date: helperSvc.unixToUTC(datas.timestamp),
        hash: datas.hash,
        hasTransactions: true,
        size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
        transactionCount: datas.tx_count,
        validator: validator,
        validatorIsAddress: false
    };

    return block;
}

const getTransactions = async(address) => {
    let endpoint = "", block = false;

    if(helperSvc.hasLetters(address)) {
        endpoint = `/address/${address}/tx`;
    } else {
        block = true;
        endpoint = `/block/${address}/tx`;
    }
    
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const datas = response.data.data.list.splice(0, 10);
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data);
                    if(!block) {
                        transaction = helperSvc.inoutCalculation(address, transaction);
                    }

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
    let endpoint = `/tx/${hash}?verbose=3`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.err_no === 0 && response.data.data !== null) {
            const data = response.data.data;
            const transaction = buildTransaction(data);

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
    const symbol = "BCH";
    let type = enums.transactionType.TRANSFER;
    txn.inputs.forEach(input => {
        let from = null;
        if(txn.is_coinbase){
            type = enums.transactionType.MINING;
            from = {
                addresses: ["coinbase"]
            }
        } else {
            const quantity = input.prev_value/100000000;
            from = helperSvc.getSimpleIOAddresses(symbol, input.prev_addresses, quantity);
        }
        froms.push(from);
    });
    txn.outputs.forEach(output => {
        const quantity = output.value/100000000;
        const to = helperSvc.getSimpleIOAddresses(symbol, output.addresses, quantity);
        tos.push(to);
    })

    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);

    const transaction = {
        type: type,
        hash: txn.hash,
        block: txn.block_height,
        confirmations: txn.confirmations === 0 ? -1 : txn.confirmations,
        date: helperSvc.unixToUTC(txn.created_at),
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
    getTransaction,
    getBlocks
}