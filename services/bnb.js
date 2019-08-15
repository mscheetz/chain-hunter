const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://dex.binance.org/api/v1";
const base2 = "https://explorer.binance.org/api/v1";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Binance Coin';
    chain.symbol = 'BNB';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
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
            hasTransactions: true
            //tokens: tokenConvert(datas.balances)
        };

        return address;
    } catch(error) {
        return null;
    }
}

const tokenConvert = function(tokens) {
    let assets = [];

    tokens.forEach(token => {
        let asset = new Asset();
        let quantity = +token.free + +token.frozen + +token.locked;
        asset.quantity = helperSvc.commaBigNumber(quantity.toString());
        asset.symbol = token.symbol;

        assets.push(asset);
    });

    return assets;
}

const getTransactions = async(address) => {
    let endpoint = "/txs?page=1&rows=10&address=" + address;
    let url = base2 + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data.txArray;
        const transactions = [];
        if(datas !== null && datas.length > 0) {
            datas.forEach(data => {     
                const total = helperSvc.commaBigNumber(data.value.toString());           
                transactions.push({
                    hash: data.txHash,
                    block: data.blockHeight,
                    symbol: data.txAsset,
                    quantity: total,
                    confirmations: -1,
                    date: helperSvc.unixToUTC(data.timeStamp),
                    from: data.fromAddr,
                    to: data.toAddr
                });
            })
        }
        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/tx/" + hash + "?format=json";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const datas = response.data;
        let transaction = null;
        if(datas !== null) {
            let from = [];
            let to = [];
            let quantity = 0;
            let symbol = "";
            datas.tx.value.msg[0].value.inputs.forEach(input => {
                if(input.address && from.indexOf(input.address) <= -1) {
                    from.push(input.address);
                }
                quantity += +input.coins[0].amount;
                if(symbol === ""){
                    symbol = input.coins[0].denom;
                }
            });
            datas.tx.value.msg[0].value.outputs.forEach(output => {
                if(output.address && to.indexOf(output.address) <= -1) {
                    to.push(output.address);
                }
            });
            const newQuantity = quantity/100000000;
            const total = helperSvc.commaBigNumber(newQuantity.toString());
            transaction = {
                hash: datas.hash,
                block: parseInt(datas.height),
                symbol: symbol,
                quantity: total,
                from: from.join(", "),
                to: to.join(", ")
            }
        }

        return transaction;
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