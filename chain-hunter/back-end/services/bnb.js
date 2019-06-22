const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://dex.binance.org/api/v1";
const base2 = "https://explorer.binance.org/api/v1";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Binance Coin';
    chain.symbol = 'BNB';
    chain.hasTokens = false;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

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
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/account/" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let qty = 0;
        response.balances.forEach(balance => {
            if(balance.symbol === "BNB") {
                qty = +balance.free + +balance.frozen + +balance.locked;
            }
        })

        const address = {
            address: response.address,
            quantity: qty,
            tokens: tokenConvert(response.balances)
        };

        return addressToFind;
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
        const datas = response.txArray;
        const transactions = [];
        if(datas !== null && datas.length > 0) {
            datas.forEach(data => {                
                transactions.push({
                    hash: bnbTransaction.txHash,
                    block: bnbTransaction.blockHeight,
                    quantity: bnbTransaction.value,
                    confirmations: bnbTransaction.confirmBlocks,
                    date: helperSvc.unixToUTC(bnbTransaction.timeStamp),
                    from: bnbTransaction.fromAddr,
                    to: bnbTransaction.toAddr
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
        let transaction = null;
        if(response !== null) {
            let from = "";
            let to = ""
            response.tx.value.inputs.forEach(input => {
                if(from !== "") {
                    from += ", ";
                } 
                from += input.address;
            });
            response.tx.value.outputs.forEach(output => {
                if(to !== "") {
                    to += ", ";
                } 
                to += output.address;
            });
            transaction = {
                hash: response.hash,
                block: parseInt(response.height),
                quantity: response.tx.value.inputs[0].coins[0].amount,
                from: from,
                to: to
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