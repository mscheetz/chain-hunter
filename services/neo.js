const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://api.neoscan.io/api/main_net";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Neo';
    chain.symbol = 'NEO';
    chain.hasTokens = false;
    chain.hasContracts = true;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".svg";

    return chain;
}

const getBlockchain = async(toFind) => {
    const chain = await getEmptyBlockchain();

    const address = await getAddress(toFind);
    chain.address = address;
    chain.transaction = null;
    chain.contract = null;
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
            const address = {
                address: datas.address,
                quantity: qty,
                tokens: tokenConvert(datas.balance)
            };

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const tokenConvert = async(tokens) => {
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
            const datas = response.data.entries;
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

const getTransaction = async(hash) => {
    let endpoint = "/v1/get_transaction/" + hash + "?verbose=3";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const datas = response.data;
            let quantity = 0;
            let symbol = "";
            let from = [];
            let to = [];
            datas.vin.forEach(vin => {
                const inQty = vin.value;
                const inQtyNo = helperSvc.exponentialToNumber(inQty.toString());
                quantity += parseFloat(inQtyNo);
                symbol = vin.asset;
                if(vin.address_hash && from.indexOf(vin.address_hash) <= -1) {
                    from.push(vin.address_hash);
                }
            });
            datas.vouts.forEach(vout => {
                if(vout.address_hash && to.indexOf(vout.address_hash) <= -1) {
                    to.push(vout.address_hash);
                }
            });
            const transaction = {
                hash: datas.txid,
                block: datas.block_height,
                quantity: quantity,
                symbol: symbol,
                confirmations: datas.block_height,
                date: helperSvc.unixToUTC(datas.time),
                from: from.join(", "),
                to: to.join(", ")
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