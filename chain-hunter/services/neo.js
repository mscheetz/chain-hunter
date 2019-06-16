const axios = require('axios');
const helperSvc = requre('helper');
const base = "https://api.neoscan.io/api/main_net";

const getEmptyBlockchain = function() {
    const chain = {};
    chain.name = 'Neo';
    chain.symbol = 'NEO';
    chain.hasTokens = true;

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }

    return chain;
}

const getAddress = async(address) => {
    let endpoint = "/v1/get_balance/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.balance.length > 0) {
            let address = {};
            address.address = response.address;
            let qty = 0;
            response.balance.forEach(bal => {
                if(bal.asset_symbol === "NEO") {
                    qty = bal.amount;
                }
            })
            address.quantity = qty;
            address.tokens = tokenConvert(response.balance);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const tokenConvert = function(tokens) {
    let assets = [];

    tokens.forEach(token => {
        let quantity = helperSvc.exponentialToNumber(token.amount);
        quantity = quantity.toString();
        asset.quantity = helperSvc.commaBigNumber(quantity);
        asset.symbol = token.asset_symbol;

        assets.push(asset);
    });

    return assets;
}

const getTransactions = async(address) => {
    let endpoint = "/v1/get_address_abstracts/" + address +"/1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
            const datas = response.entries;
            const transactions = [];
            if(datas !== null && datas.length > 0) {
                datas.forEach(data => {
                    transactions.push({
                        hash: data.txid,
                        block: data.block_height,
                        quantity: parseInt(data.amount),
                        confirmations: data.block_height,
                        date: helperSvc.unixToUTC(data.time),
                        from: data.address_from,
                        to: data.address_to
                    });
                })
            }

            return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = function(hash) {
    let endpoint = "/v1/get_transaction/" + hash + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response !== null) {                
            let from = "";
            let to = ""
            response.vin.forEach(vin => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vin.address_hash;
            });
            response.vouts.forEach(vout => {
                if(to !== "") {
                    to += ", ";
                } 
                to += vout.address_hash;
            });
            const transaction = {
                hash: response.txid,
                block: response.block_height,
                quantity: response.size,
                confirmations: response.block_height,
                date: helperSvc.unixToUTC(response.time),
                from: from,
                to: to
            };

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