const axios = require('axios');
const helperSvc = require('../helper.service');
const base = "https://apilist.tronscan.org/api";
const enums = require('../../classes/enums');
const db = require('../../data/data.repo');
const _ = require('lodash');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tron';
    chain.symbol = 'TRX';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.GAMING;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let transaction = null;
    let contract = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
    
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/account?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        if(Object.keys(datas).length === 0 && datas.constructor === Object) {
            return null;
        } else {
            const quantity = helperSvc.bigNumberToDecimal(datas.balance.toString(), 6);
            const totalCommad = helperSvc.commaBigNumber(quantity.toString());
            const total = helperSvc.decimalCleanup(totalCommad);

            const address = {
                address: datas.address,
                quantity: total,
                hasTransactions: true
            };
            return address;
        }
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "/contract?contract=" + address;
    let url = this.base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data && response.data.address !== "") {
            const datas = response.address;
            const quantity = datas.balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let contract = {
                address: datas.address,
                quantity: total,
                symbol: "TRX"
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

const getAddressTokens = async(address) => {
    let endpoint = "/account?address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data) {
            const datas = response.data;
            let tokens = [];
            tokens["10"] = datas.tokenBalances;
            tokens["20"] = datas.trc20token_balances;
            
            return tokens;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/transaction?sort=-timestamp&count=true&limit=10&start=0&address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.data.data.length > 0) {
            const datas = response.data.data;
            let tokens = [];
            for(let i = 0; i < datas.length; i++) {
                const data = datas[i];
                const tokenId = data.contractData.asset_name;
                let token = tokens.find(t => { return t.id === tokenId;})
                if(token === undefined) {
                    token = await getTrx10Token(tokenId);
                    tokens.push(token);
                }
                let transaction = buildTransaction(data, token);

                transaction = helperSvc.inoutCalculation(address, transaction);

                transactions.push(transaction);
            }
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/transaction-info?hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.hash) {
            const datas = response.data;
            let token = {};
            if(datas.contractData.hasOwnProperty('asset_name')) {
                token = await getTrx10Token(datas.contractData.asset_name);
            } else {
                token = {
                    id: 0,
                    symbol: "TRX",
                    name: "Tronix",
                    precision: 6
                };
            }
            const transaction = buildTransaction(response.data, token);

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
    try {
        const addyTokens = await getAddressTokens(address);
        addyTokens["20"].forEach(token => {
            const asset = createAsset(token);
            if(asset !== null) {
                tokens.push(asset);
            }
        });
        const trx10Tokens = await db.getTrxTokens();
        addyTokens["10"].forEach(token => {
            const trx10Token = trx10Tokens.find(t => t.id === token.name)
            if(trx10Token !== undefined) {
                const asset = createAsset(token, trx10Token);
                tokens.push(asset);
            }
        });
    } catch(err) {
        //console.log('err', err);
    }
    return tokens.length > 0 
            ? _.sortBy(tokens, 'name')
            : tokens;
}

const createAsset = function(token, trx10Token = null) {
    let symbol = "";
    let name = "";
    let balance = 0;
    let decimals = 6;
    if(trx10Token !== null) {
        symbol = trx10Token.symbol;
        name = trx10Token.name;
        balance = token.balance.toString();
        decimals = trx10Token.precision > 0 ? trx10Token.precision : 6;
    } else {
        symbol = token.symbol;
        name = token.name;
        balance = token.balance;        
        decimals = token.decimals > 0 ? token.decimals : 6;
    }
    balance = helperSvc.bigNumberToDecimal(balance, decimals);
    const totalCommad = helperSvc.commaBigNumber(balance.toString());
    const total = helperSvc.decimalCleanup(totalCommad);

    let asset = {
        symbol: symbol,
        name: name,
        quantity: total
    };
    
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const getTrx10Token = async(id) => {
    let endpoint = "/token?id=" + id + "&showAll=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.data.length > 0) {
            const datas = response.data.data[0];
            const token = {
                id: datas.tokenID,
                symbol: datas.abbr,
                name: datas.name,
                precision: datas.precision
            };

            return token;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTrx10Tokens = async(page) => {
    const limit = 2000;
    let endpoint = "/token?sort=-name&limit="+ limit +"&start="+ page;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.data;

        let tokens = [];

        if(datas.length > 0) {
            datas.forEach(data => {
                let token = {
                    id: data.tokenID,
                    name: data.name,
                    symbol: data.abbr,
                    icon: data.imgUrl,
                    owner: data.ownerAddress,
                    precision: data.precision
                };
                tokens.push(token);
            });
        }

        return tokens;
    } catch(error) {
        return [];
    }

}

const buildTransaction = function(txn, token) {
    let quantity = txn.contractData.amount;
    if(token.precision > 0) {
        quantity = quantity / Math.pow(10, token.precision);
    }
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(token.symbol, txn.ownerAddress, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(token.symbol, txn.toAddress, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: txn.hash,
        block: txn.block,
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        froms: fromData,
        tos: toData
    };

    return transaction;
}

const buildTrxTokens = async() => {
    let getTokens = true;
    let i = 0;
    let trxTokens = await db.getTrxTokens();
    while(getTokens) {
        console.log("getting token page: '" + i + "'.");
        const tokens = await getTrx10Tokens(i);
        console.log(trxTokens.length + ' trx tokens in db.');
        if(tokens.length > 0) {
            console.log("db id 1: '" + trxTokens[0].id + "' api id 1: '" + tokens[0].id + "'");
            console.log(tokens.length + ' trx tokens found.');
            const newTokens = tokens.filter(({ id: id1 }) => !trxTokens.some(({ id: id2}) => parseInt(id2) === id1));
            if(newTokens.length > 0) {
                console.log(newTokens.length + ' new tokens found.');
                // console.log('trxTokens', trxTokens);
                // console.log('tokens', tokens);
                await db.postTrxTokens(newTokens);
                trxTokens = trxTokens.concat(newTokens);
            }
        } else {
            getTokens = false;
        }
        i++;
    }

    return [];
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction,
    buildTrxTokens
}