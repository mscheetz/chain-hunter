const axios = require('axios');
const helperSvc = require('../helperService.js');
const base = "https://api.neoscan.io/api/main_net";
const tokenTxnBase = "https://api.nel.group/api/mainnet";
const contractBase = "https://apiscan.nel.group/api/mainnet";//"http://151.106.3.178/api";
const enums = require('../../classes/enums');
const _ = require('lodash');
const neoAssets = [
    {
        name: "NEO Token",
        symbol: "NEO",
        hash: "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b"
    },
    {
        name: "Gas Utility Token",
        symbol: "GAS",
        hash: "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7"
    }
]

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Neo';
    chain.symbol = 'NEO';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let transaction = null;
    let contract = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    
    chain.address = address;
    chain.transaction = transaction;
    chain.contract = contract;

    if(chain.address || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v1/get_balance/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.balance.length > 0) {
            const datas = response.data;
            let qty = 0;
            datas.balance.forEach(bal => {
                if(bal.asset_symbol === "NEO") {
                    qty = bal.amount;
                }
            })
            const total = helperSvc.commaBigNumber(qty.toString());

            let address = {
                address: datas.address,
                quantity: total,
                hasTransactions: true
            };
            
            address.tokens = await tokenConvert(datas.balance);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        //console.log(error);
        return null;
    }
}

const getContract = async(addressToFind) => {
    if(addressToFind.substr(0, 2) !== "0x"){
        addressToFind = "0x" + addressToFind;
    }
    let data = {
        jsonrpc: "2.0",
        method: "getContractInfo",
        params: [ addressToFind ],
        id: 1
    };
    let options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let url = contractBase;

    try{
        const response = await axios.post(url, JSON.stringify(data), options);
        if(typeof response.data.error === 'undefined') {
            const datas = response.data.result[0];
            const name = datas.assetName === "" ? datas.name : datas.assetName;
            let contract = {
                address: datas.hash.substr(2, datas.hash.length -2),
                quantity: null,
                symbol: datas.assetSymbol,
                //creator: datas.author,
                contractName: name,
                version: datas.version
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

const getContractOG = async(addressToFind) => {
    let endpoint = "/smartcontract/get/" + addressToFind;
    let url = contractBase + endpoint;

    try{
        const response = await axios.get(url);        
        const datas = response.data;

        let contract = {
            address: addressToFind,
            quantity: null,
            symbol: null,
            creator: datas.author,
            contractName: datas.name
        };
        const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        contract.hasIcon = iconStatus;

        return contract;
    } catch(error) {
        return null;
    }
}

const tokenConvert = async(tokens) => {
    let assets = [];

    tokens.forEach(token => {
        let quantity = helperSvc.exponentialToNumber(token.amount);
        quantity = quantity.toString();
        let asset = {
            name: token.asset,
            quantity: helperSvc.commaBigNumber(quantity),
            symbol: token.asset_symbol,
            hasIcon: false
        }

        const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        asset.hasIcon = iconStatus;

        if(asset.name === "") {
            asset.name = "Un-named token";
        }
        if(asset.symbol === "") {
            asset.symbol = "No symbol assigned";
        }

        assets.push(asset);
    });

    return _.sortBy(assets, 'name');
}

const getTokenTransaction = async(hash) => {
    if(hash.substr(0, 2) !== "0x"){
        hash = "0x" + hash;
    }
    let data = {
        jsonrpc: '2.0',
        method: 'getnep5transferbytxid',
        params: [ hash ],
        id: 1
    };
    let options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let url = tokenTxnBase;
    
    try{
        const response = await axios.post(url, JSON.stringify(data), options);
        if(typeof response.data.result !== 'undefined') {
            const datas = response.data.result[0];

            let symbol = await getSymbol(datas.asset);
            let froms = [];
            let tos = [];
            const from = helperSvc.getSimpleIO(symbol, datas.from, datas.value);
            froms.push(from);
            const to = helperSvc.getSimpleIO(symbol, datas.to, datas.value);
            tos.push(to);
            const fromData = helperSvc.cleanIO(froms);
            const toData = helperSvc.cleanIO(tos);
            
            const result = {
                froms: fromData,
                tos: toData,
            }

            return result;
        } else {
            return null;
        }
    } catch(error) {
        //console.log(error);
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/v1/get_last_transactions_by_address/" + address +"/1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
            const datas = response.data;
            const transactions = [];
            if(datas !== null && datas.length > 0) {
                for(let j = 0; j < datas.length; j++) {
                    const data = datas[j];
                    let froms = [];
                    let tos = [];
                    let fromData = [];
                    let toData = [];
                    let symbol = "NEO";
                    const type = getTransactionType(datas.type);

                    if(data.vouts.length === 0 && data.vin.length === 0) {
                        const tokenTxn = await getTokenTransaction(data.txid);
                        if(tokenTxn !== null) {
                            fromData = tokenTxn.froms;
                            toData = tokenTxn.tos;
                        }
                    } else {
                        for(let i = 0; i < data.vouts.length; i++) {
                            const output = data.vouts[i];
                            if(output.asset.length > 5) {
                                symbol = await getSymbol(output.asset);
                            }
                            const from = helperSvc.getSimpleIO(symbol, output.address_hash, output.value);
                            froms.push(from);

                        }
                        for(let i = 0; i < data.vin.length; i++) {
                            const input = data.vin[i];
                            if(input.asset.length > 5) {
                                symbol = await getSymbol(input.asset);
                            }
                            const to = helperSvc.getSimpleIO(symbol, input.address_hash, input.value);
                            tos.push(to);

                        }

                        fromData = helperSvc.cleanIO(froms);
                        toData = helperSvc.cleanIO(tos);
                    }
                    let transaction = {
                        type: type,
                        hash: data.txid,
                        block: data.block_height,
                        date: helperSvc.unixToUTC(data.time),
                        froms: fromData,
                        tos: toData
                    };

                    transaction = helperSvc.inoutCalculation(address, transaction);

                    transactions.push(transaction);
                }
            }

            return transactions;
    } catch(error) {
        //console.log(error);
        return [];
    }
}

const getSymbol = async(hash) => {
    if(hash.substr(0,2) === "0x") {
        hash = hash.replace("0x","");
    }
    let token = _.find(neoAssets, { 'hash': hash});

    if(typeof token !== 'undefined') {
        return token.symbol;
    }
    const contract = await getContract(hash);

    if(contract !== null) {
        let asset = {
            name: contract.contractName,
            symbol: contract.symbol,
            hash: contract.address
        };
        neoAssets.push(asset);
        return asset.symbol;
    }

    return null;
}

const getTransaction = async(hash) => {
    if(hash.substr(0, 2) === "0x") {
        hash = hash.replace("0x","");
    }
    let endpoint = "/v1/get_transaction/" + hash + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            let froms = [];
            let tos = [];
            let fromData = [];
            let toData = [];
            const type = getTransactionType(datas.type);
            if(datas.vouts.length === 0 && datas.vin.length === 0) {
                const tokenTxn = await getTokenTransaction(datas.txid);
                
                if(tokenTxn !== null) {
                    fromData = tokenTxn.froms;
                    toData = tokenTxn.tos;
                }
            } else {
                datas.vin.forEach(vin => {
                    const from = helperSvc.getSimpleIO(vin.asset, vin.address_hash, vin.value);
                    froms.push(from);
                });
                datas.vouts.forEach(vout => {
                    const to = helperSvc.getSimpleIO(vout.asset, vout.address_hash, vout.value);
                    tos.push(to);
                });
                
                fromData = helperSvc.cleanIO(froms);
                toData = helperSvc.cleanIO(tos);
            }
            const transaction = {
                type: type,
                hash: datas.txid,
                block: datas.block_height,
                confirmations: datas.block_height,
                date: helperSvc.unixToUTC(datas.time),
                froms: fromData,
                tos: toData
            };

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        //console.log(error);
        return null;
    }
}

const getTransactionType = function(type) {    
    return type === "ContractTransaction" 
            ? enums.transactionType.CONTRACT
            : type === "ClaimTransaction"
                ? enums.transactionType.CLAIM
                : enums.transactionType.TRANSFER;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}