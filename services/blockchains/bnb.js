const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://dex.binance.org/api/v1";
const base2 = "https://explorer.binance.org/api/v1";
const enums = require('../../classes/enums');
const _ = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Binance Coin';
    chain.symbol = 'BNB';
    chain.hasTokens = true;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.EXCHANGE;
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
    let endpoint = "/account/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let qty = 0;
        const datas = response.data;
        datas.balances.forEach(balance => {
            if(balance.symbol === "BNB") {
                qty = +balance.free + +balance.frozen + +balance.locked;
            }
        })
        const total = helperSvc.commaBigNumber(qty.toString());

        const address = {
            address: datas.address,
            quantity: total,
            hasTransactions: true,
            tokens: await tokenConvert(datas.balances)
        };

        return address;
    } catch(error) {
        return null;
    }
}

const tokenConvert = async(tokens) =>{
    let assets = [];
    let defs = await tokenDefs();

    tokens.forEach(token => {
        let quantity = +token.free + +token.frozen + +token.locked;
        let def = defs.find(d => d.bnbSymbol === token.symbol);

        if(def !== undefined) {
            let asset = {
                quantity: helperSvc.commaBigNumber(quantity.toString()),
                symbol: def.symbol,
                name: def.name + " (" + def.bnbSymbol + ")"
            }
            const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            asset.hasIcon = iconStatus;

            assets.push(asset);
        }
    });

    return _.sortBy(assets, 'name');
}

const tokenDefs = async() => {
    let endpoint = "/tokens";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        let defs = [];
        datas.forEach(data => {
            let def = {
                name: data.name,
                bnbSymbol: data.symbol,
                symbol: data.original_symbol
            };

            defs.push(def);
        });

        return defs;
    } catch(error) {
        return [];
    }
}

const getBlock = async(blockNumber) => {
    let endpoint = `/block/${blockNumber}`;
    let url = base2 + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data !== 'undefined' && response.data !== null) {
            const datas = response.data;
            const latestBlock = await getLatestBlock();
            
            let block = buildBlock(datas, latestBlock);

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = `/blocks?page=1&rows=20`;
    let url = base2 + endpoint;

    try{
        const response = await axios.get(url);

        if(typeof response.data !== 'undefined' && response.data !== null && response.data.blockArray.length > 0) {
            const datas = response.data.blockArray;
            const latestBlock = datas[0].blockHeight;
            
            let blocks = [];
            for(let data of datas) {
                let block = buildBlock(data, latestBlock);

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

const getLatestBlock = async() => {
    let endpoint = `/blocks?page=1&rows=1`;
    let url = base2 + endpoint;

    try{
        const response = await axios.get(url);

        let latestBlock = 0;
        if(typeof response.data !== 'undefined' && response.data !== null && response.data.blockArray.length > 0) {
            const datas = response.data.blockArray[0];
            
            latestBlock = datas.blockHeight;
        }
        return latestBlock;
    } catch(error) {
        return 0;
    }
}

const buildBlock = function(datas, latestBlock) {
    const ts = datas.timeStamp/1000;
    const confirmations = latestBlock > 0 ? latestBlock - datas.blockHeight : -1;

    let block = {
        blockNumber: datas.blockHeight,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(ts),
        hash: datas.blockHash,
        size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
        transactionCount: datas.txNum,
        validator: datas.blockFeeList[0].address,
        hasTransactions: true
    };

    return block;
}

const getTransactions = async(address) => {
    let endpoint = "", url = "", block = false;
    if(helperSvc.hasLetters(address)) {
        endpoint = `/txs?page=1&rows=10&address=${address}`;
        url = base2 + endpoint;
    } else {
        endpoint = `/transactions-in-block/${address}`;
        url = base + endpoint;
        block = true;
    }

    try{
        const response = await axios.get(url);
        const datas = block ? response.data.tx : response.data.txArray;        
        const transactions = [];
        const latestBlock = await getLatestBlock();

        if(datas !== null && datas.length > 0) {
            for(let i = 0; i < datas.length; i++) {
                const data = datas[i];
                
                let froms = [];
                let tos = [];
                let symbol = (typeof data.txQuoteAsset !== "undefined") ? data.txQuoteAsset : null;// data.txAsset;
                let quantity = data.value;
                const detail = JSON.parse(data.data);
                if(symbol === null) {
                    symbol = detail.orderData.symbol;
                    symbol = symbol.indexOf("BNB") >= 0 
                                ? "BNB"
                                : symbol.indexOf("BTC") >= 0
                                    ? "BTC"
                                    : symbol;
                    if(detail.orderData.symbol.startsWith(symbol) && quantity === null) {
                        quantity = +detail.orderData.quantity;
                    }
                }
                if(quantity === null) {
                    quantity = +detail.orderData.quantity * +detail.orderData.price;
                }
                let type = getTransactionType(data.txType);
                const from = helperSvc.getSimpleIO(symbol, data.fromAddr, quantity);
                froms.push(from);
                if(type === enums.transactionType.TRANSFER) {
                    const to = helperSvc.getSimpleIO(symbol, data.toAddr, quantity);
                    tos.push(to);
                }

                const fromData = helperSvc.cleanIO(froms);
                const toData = helperSvc.cleanIO(tos);
                const ts = helperSvc.hasLetters(data.timeStamp)
                            ? data.timeStamp
                            : helperSvc.unixToUTC(data.timeStamp/1000)
                const confirmations = latestBlock > 0 ? latestBlock - data.blockHeight : -1;

                let transaction = {
                    type: type,
                    hash: data.txHash,
                    block: data.blockHeight,
                    confirmations: confirmations,
                    date: ts,
                    froms: fromData,
                    tos: toData
                };
                if(type !== enums.transactionType.TRANSFER) {
                    transaction.symbol = symbol;
                    transaction.quantity = quantity;
                }

                if(transaction.type === enums.transactionType.TRANSFER && !block) {
                    transaction = helperSvc.inoutCalculation(address, transaction);
                } 

                transactions.push(transaction);
            }
        }
        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransactionType = function(transactionType){
    let type = enums.transactionType.TRANSFER;
    if(transactionType === "NEW_ORDER") {
        type = enums.transactionType.NEW_ORDER;
    } else if (transactionType === "CANCEL_ORDER") {
        type = enums.transactionType.CANCEL_ORDER;
    }

    return type;
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash + "?format=json";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const latestBlock = await getLatestBlock();
        const datas = response.data;
        let transaction = null;
        if(datas !== null) {
            let froms = [];
            let tos = [];
            let timestamp = "";
            let type = enums.transactionType.TRANSFER;
            const trxDetail = await getTrxDetail(datas.height, hash, latestBlock);
            
            if(trxDetail !== null) {
                return trxDetail;
            }
            datas.tx.value.msg[0].value.inputs.forEach(input => {
                for(let i = 0; i < input.coins.length; i++){
                    const coin = input.coins[i];
                    const quantity = parseFloat(coin.amount)/100000000;
                    const from = helperSvc.getSimpleIO(coin.denom, input.address, quantity);
                    froms.push(from);
                }
            });
            datas.tx.value.msg[0].value.outputs.forEach(output => {
                for(let i = 0; i < output.coins.length; i++){
                    const coin = output.coins[i];
                    const quantity = parseFloat(coin.amount)/100000000;
                    const to = helperSvc.getSimpleIO(coin.denom, output.address, quantity);
                    tos.push(to);
                }
            });
            const fromData = helperSvc.cleanIO(froms);
            const toData = helperSvc.cleanIO(tos);
            const confirmations = latestBlock > 0 ? latestBlock - data.blockHeight : -1;

            transaction = {
                type: type,
                hash: datas.hash,
                block: parseInt(datas.height),
                confirmations: confirmations,
                date: timestamp,
                froms: fromData,
                tos: toData
            }
        }

        return transaction;
    } catch(error) {
        return null;
    }
}

const getTrxDetail = async(block, hash, latestBlock) => {
    let endpoint = "/transactions-in-block/" + block;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.blockHeight !== "undefined") {
            const datas = response.data.tx;
            let transaction = null;
            datas.forEach(txn => {
                if(txn.txHash === hash){
                    transaction = txn;
                }
            });
            if(transaction !== null) {
                let froms = [];
                let tos = [];
                let symbol = transaction.txAsset;
                const type = getTransactionType(transaction.txType);
                if(type !== enums.transactionType.TRANSFER) {
                    symbol = "BNB";
                }
                const from = helperSvc.getSimpleIO(symbol, transaction.fromAddr, transaction.value);
                froms.push(from);
                if(transaction.toAddr !== null) {
                    const to = helperSvc.getSimpleIO(symbol, transaction.toAddr, transaction.value);
                    tos.push(to);
                }
                const fromData = helperSvc.cleanIO(froms);
                const toData = helperSvc.cleanIO(tos);
                const confirmations = latestBlock > 0 ? latestBlock - data.blockHeight : -1;

                let txn = {
                    type: type,
                    hash: transaction.txHash,
                    block: transaction.blockHeight,
                    confirmations: confirmations,
                    date: transaction.timeStamp,
                    froms: fromData,
                    tos: toData
                }
                
                return txn;
            }

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}


module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getBlocks
}