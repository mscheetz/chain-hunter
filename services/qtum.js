const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explorer.qtum.org/insight-api";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'QTUM';
    chain.symbol = 'QTUM';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PLATFORM;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();
    let address = null;
    let contract = null;
    let transaction = null;

    const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.contract = contract;
    chain.transaction = transaction;
    
    if(chain.address || chain.contract || chain.transaction) {
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

const getTokens = async(address) => {
    let endpoint = "/erc20/balances?balanceAddress=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null && response.data.length > 0) {
            const datas = response.data;
            
            const tokens = convertTokens(datas);
            return tokens;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const convertTokens = function(tokens){
    let assets = [];

    tokens.forEach(token => {
        const quantity = parseFloat(token.amount) / 100000000;
        const total = helperSvc.commaBigNumber(quantity.toString());
        let asset = {
            quantity: total,
            symbol: token.contract.symbol,
            name: token.contract.name
        }
        const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        asset.hasIcon = iconStatus;

        assets.push(asset);
    });
    return assets;
}

const getTransactions = async(address) => {
    let endpoint = "/txs?address=" + address + "&pageNum=0";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data.txs;
            let transactions = [];
            for(let i = 0; i < datas.length; i++) {
                const transaction = await buildTransaction(datas[i]);
                transactions.push(transaction);
            }
            
            return transactions;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getContract = async(addressToFind) => {
    let endpoint = "/qrc20/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const quantity = helperSvc.commaBigNumber(datas.total_supply.toString());
            
            let contract = {
                address: datas.contract_address,
                quantity: quantity,
                symbol: datas.symbol,
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

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            const transaction = await buildTransaction(datas);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = async(txn) => {
    let total = helperSvc.commaBigNumber(txn.valueOut.toString());
    let symbol = "QTUM";
    if(txn.isqrc20Transfer) {
        let contract = await getContract(txn.receipt[0].contractAddress);
        total = "Token Transfer";
        symbol = contract.symbol;
    }
    let from = [];
    let to = [];
    txn.vin.forEach(input => {
        if(from.indexOf(input.addr) <= -1) {
            from.push(input.addr);
        }
    })
    for(let i = 0; i < txn.vout.length; i++) {
        if(typeof txn.vout[i].scriptPubKey.addresses !== "undefined") {
            txn.vout[i].scriptPubKey.addresses.forEach(address => {
                if(address && (to.length === 0 || to.indexOf(address) <= -1)) {
                    to.push(address);
                }
            })
        }
    }

    let transaction = {
        hash: txn.txid,
        quantity: total,
        block: txn.blockheight,
        confirmations: txn.confirmations,
        symbol: symbol,
        date: helperSvc.unixToUTC(txn.time),
        from: from.join(", "),
        to: to.join(", ")
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getContract,
    getTransaction
}