const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://dex.binance.org/api/v1";
const base2 = "https://explorer.binance.org/api/v1";
const enums = require('../../classes/enums');
const _ = require('lodash');

const getEmptyBlockchain = async(chain) => {
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

const getBlockchain = async(chain, toFind) => {
    //const chain = await getEmptyBlockchain(blockchain);
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

const getTransactions = async(address) => {
    let endpoint = "/txs?page=1&rows=10&address=" + address;
    let url = base2 + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.txArray;
        const transactions = [];
        if(datas !== null && datas.length > 0) {
            for(let i = 0; i < datas.length; i++) {
                const data = datas[i];
                
                let froms = [];
                let tos = [];
                const symbol = (typeof data.txQuoteAsset !== "undefined") ? data.txQuoteAsset : data.txAsset;
                const quantity = data.value;
                let type = getTransactionType(data.txType);
                const from = helperSvc.getSimpleIO(symbol, data.fromAddr, quantity);
                froms.push(from);
                if(type === enums.transactionType.TRANSFER) {
                    const to = helperSvc.getSimpleIO(symbol, data.toAddr, quantity);
                    tos.push(to);
                }

                const fromData = helperSvc.cleanIO(froms);
                const toData = helperSvc.cleanIO(tos);

                let transaction = {
                    type: type,
                    hash: data.txHash,
                    block: data.blockHeight,
                    confirmations: -1,
                    date: helperSvc.unixToUTC(data.timeStamp/1000),
                    froms: fromData,
                    tos: toData
                };
                if(type !== enums.transactionType.TRANSFER) {
                    transaction.symbol = symbol;
                    transaction.quantity = quantity;
                }

                if(transaction.type === enums.transactionType.TRANSFER) {
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
        const datas = response.data;
        let transaction = null;
        if(datas !== null) {
            let froms = [];
            let tos = [];
            let timestamp = "";
            let type = enums.transactionType.TRANSFER;
            const trxDetail = await getTrxDetail(datas.height, hash);
            
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
            transaction = {
                type: type,
                hash: datas.hash,
                block: parseInt(datas.height),
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

const getTrxDetail = async(block, hash) => {
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
                let txn = {
                    type: type,
                    hash: transaction.txHash,
                    block: transaction.blockHeight,
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
    getTransaction
}