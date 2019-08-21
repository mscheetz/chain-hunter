const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://apilist.tronscan.org/api";
const enums = require('../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tron';
    chain.symbol = 'TRX';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.GAMING;
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
            const quantity = datas.balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

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

            const contract = {
                address: datas.address,
                quantity: total,
                symbol: "TRX"
            };
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
        if(response.data.address) {
            const datas = response.address;
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
                transactions.push(buildTransaction(data, token));
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
    const addyTokens = await getAddressTokens(address);
    let tokens = [];
    addyTokens["20"].forEach(token => {
        const asset = createAsset(token);
        if(asset !== null) {
            tokens.push(asset);
        }
    });
    let trx10Complete = false;
    let trx10s = [];
    let page = 1;
    while(!trx10Complete) {
        const limit = 200;
        let trx10s = await getTrx10Tokens(limit, page);
        trx10s.data.forEach(token => {
            trx10s[token.tokenID.toString()] = token.abbr;
        })

        if((page * limit) >= trx10s.totalAll) {
            trx10Complete = true;  
        } else {
            page++;
        }
    }
    addyTokens["10"].forEach(token => {
        const asset = createAsset(token, trx10s);
        tokens.push(asset);
    });

    return tokens;
}

const createAsset = async(token, trx10s = []) => {
    let asset = null;
    if((typeof token.symbol !== 'undefined') && token.symbol !== null && token.symbol !== "" && token.name !== "_"){
        let symbol = token.symbol;
        if(trx10s.length > 0) {
            symbol = trx10s[token.name];
        }
        if(typeof symbol !== 'undefined') {            
            const total = helperSvc.commaBigNumber(token.balance.toString());

            asset = {
                symbol: symbol,
                quantity: total
            };
        }
    }
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

const getTrx10Tokens = async(limit, page) => {
    let start = page == 1 ? 0 : ((page - 1) * limit) + 1;
    let endpoint = "/token?sort=-name&limit="+ limit +"&start="+ start;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.hash) {
            const transaction = buildTransaction(response);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }

}

const buildTransaction = function(txn, token) {
    let quantity = txn.contractData.amount;
    if(token.precision > 0) {
        quantity = quantity / Math.pow(10, token.precision);
    }
    const total = helperSvc.commaBigNumber(quantity.toString());
    const transaction = {
        hash: txn.hash,
        block: txn.block,
        quantity: total,
        symbol: token.symbol,
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        from: txn.ownerAddress,
        to: txn.toAddress
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