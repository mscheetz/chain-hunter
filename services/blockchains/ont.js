const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.ont.io/v2";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));
const tokenTypes = [ 'native', 'oep4', 'oep5', 'oep8'];
const _ = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ontology';
    chain.symbol = 'ONT';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.ENTERPRISE;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let transaction = null;
    let contract = null;

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
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;
    chain.contract = contract;

    if(chain.address || chain.block || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/addresses/" + addressToFind + "/native/balances";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;
            let allZeros = 0;
            let quantity = 0;
            datas.forEach(token => {
                if(token.balance === '0') {
                    allZeros++;
                }
                if(token.asset_name === "ont") {
                    quantity = token.balance;
                }
            })
            if(allZeros === datas.length) {
                return null;
            }
            const total = helperSvc.commaBigNumber(quantity.toString());

            const address = {
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
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;

            let block = {
                blockNumber: blockNumber,
                //validator: datas.nextconsensus,
                transactionCount: datas.tx_count,
                date: helperSvc.unixToUTC(datas.block_time),
                size: `${helperSvc.commaBigNumber(datas.block_size.toString())} bytes`,
                hash: datas.block_hash,
                hasTransactions: true
            };

            let transactions = [];
            if(datas.txs.length > 0){
                let values = [];
                for(let txn of datas.txs) {
                    const transaction = await getTransaction(txn.tx_hash);

                    if(transaction.tos.length > 0) {
                        const tos = transaction.tos.filter(t => t.symbol === 'ONT');
                        if(tos.length > 0) {
                            let txnValues = tos.map(t => +t.quantity.replace(/,/g, ""));
                            values = _.concat(values, txnValues);
                        }
                    }

                    transactions.push(transaction);
                }
                if(block.transactionCount === transactions.length) {
                    let quantity = 0;
                    if(values.length > 0) {
                        quantity = values.reduce((a, b) => a + b, 0);
                    }
                    block.volume = quantity;
                }
            }
            block.transactions = transactions;

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "/contracts/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;
            let symbol = datas.ont_sum === "0" ? "ONG" : "ONT";
            let quantity = datas.ont_sum === "0" ? parseFloat(datas.ong_sum) : parseFloat(datas.ont_sum);
            const total = helperSvc.commaBigNumber(quantity.toString());

            let contract = {
                address: datas.contract_hash,
                quantity: total,
                symbol: symbol,
                creator: datas.creator,
                contractName: datas.name
            };
            const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            contract.hasIcon = iconStatus;

            return contract;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressTokens = async(address, tokenIndex) => {
    let endpoint = "/addresses/" + address + "/"+ tokenTypes[tokenIndex] +"/balances";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;
            let allZeros = 0;
            let assets = [];
            datas.forEach(token => {
                if(token.balance === '0') {
                    allZeros++;
                } else if(token.asset_name !== "ont") {
                    const quantity = token.balance;
                    const total = helperSvc.commaBigNumber(quantity.toString());
                    const name = token.asset_name === "waitboundong" 
                                    ? "Wait Bound ONG"
                                    : token.asset_name === "unboundong"
                                        ? "Unbound ONG"
                                        : token.asset_name.toUpperCase();
                    const symbol = token.asset_name === "waitboundong" 
                                    ? "ONG"
                                    : token.asset_name === "unboundong"
                                        ? "ONG"
                                        : token.asset_name.toUpperCase();

                    const asset = {
                        quantity: total,
                        symbol: symbol,
                        name: name
                    };
                    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
                    const iconStatus = helperSvc.iconExists(icon);
                    asset.hasIcon = iconStatus;

                    assets.push(asset);
                }
            })
            if(allZeros === datas.length) {
                return [];
            }

            return assets;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/addresses/"+ address +"/transactions?page_size=10&page_number=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);        
        if(response.data.code === 0) {
            const datas = response.data.result;
            const transactions = [];
            const latestBlock = await getLatestBlock();
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data, latestBlock);

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
    let endpoint = "/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0) {
            let transaction = null;
            if(response.data.Action === "getsmartcodeeventbyhash") {
                transaction = {

                }
            } else {
                const datas = response.data.result;            
                const latestBlock = await getLatestBlock();
                transaction = buildTransactionII(datas, latestBlock);
            }

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    let tokens = [];
    for(let i = 0; i < 4; i++) {
        let assets = await getAddressTokens(address, i);

        assets.forEach(asset => {
            tokens.push(asset);
        });
    }

    return tokens;
}

const getLatestBlock = async() => {
    let endpoint = "/blocks?page_size=1&page_number=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.result.records[0].block_height.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const ts = txn.tx_time.toString().substr(0, 10);

    let froms = [];
    let tos = [];
    const fee = txn.fee;
    txn.transfers.forEach(xfer => {
        let valid = false;
        if(xfer.asset_name === "ong" && xfer.amount !== fee){
            valid = true;
        } else if (xfer.asset_name !== "ong") {
            valid = true;
        }
        if(valid) {
            const from = helperSvc.getSimpleIO(xfer.asset_name.toUpperCase(), xfer.from_address, xfer.amount);
            froms.push(from);
            const to = helperSvc.getSimpleIO(xfer.asset_name.toUpperCase(), xfer.to_address, xfer.amount);
            tos.push(to);
        }
    });
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        date: helperSvc.unixToUTC(parseInt(ts)),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const ts = txn.tx_time.toString().substr(0, 10);

    let froms = [];
    let tos = [];
    txn.detail.transfers.forEach(xfer => {
        const from = helperSvc.getSimpleIO(xfer.asset_name.toUpperCase(), xfer.from_address, xfer.amount);
        froms.push(from);
        const to = helperSvc.getSimpleIO(xfer.asset_name.toUpperCase(), xfer.to_address, xfer.amount);
        tos.push(to);
    });
    
    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        date: helperSvc.unixToUTC(parseInt(ts)),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction
}