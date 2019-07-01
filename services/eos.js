const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://eos.greymass.com/v1";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'EOS.IO';
    chain.symbol = 'EOS';
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
    let endpoint = "/chain/get_currency_balance";
    let url = base + endpoint;
    let data = '{"code":"eosio.token","account":"'+ addressToFind +'","symbol":"EOS"}';

    try{
        const response = await axios.post(url, data);
        if(response.data.length > 0) {
            const address = {
                address:  address,
                balance: parseFloat(response.data[0].replace(/\D/g, "")),
            };

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/history/get_actions";
    let url = base + endpoint;
    let data = '{"pos":"-1","offset":"-10","account_name":"'+ address +'"}';

    try{
        const response = await axios.post(url, data);
        if(response.data.err_no === 0 && response.data !== null) {
            const datas = response.data.list;
            const transactions = [];
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data));
                })
            }

            return transactions;
        } else {
            return [];
        }
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/history/get_transaction";
    let url = base + endpoint;
    let data = '{ "id": "'+ hash +'", "block_num_hint": "0" }';

    try{
        const response = await axios.post(url, data);

        if(typeof response.code === 'undefined' || response.code === 404) {
            return null;
        } else {
            const datas = response.data;
            let from = datas.trx.trx.actions.data.hasOwnProperty('payer')
                        ? datas.trx.trx.actions.data.payer : "eosio";
            let to = datas.trx.trx.actions.data.hasOwnProperty('receiver')
                        ? datas.trx.trx.actions.data.receiver : "eosio";
            let symbol = "EOS";
            let quantity = 0;

            if(datas.trx.trx.actions.data.hasOwnProperty('quant')) {
                quantity = datas.trx.trx.actions.data.quant;
                symbol = quantity.substring(quantity.indexOf(" ")).trim();
                quantity = quantity.replace(/\D/g,'');
            }

            let transaction = {
                hash: datas.id,
                block: datas.block_num,
                latestBlock: datas.last_irreversible_block,
                confirmations: (datas.last_irreversible_block - datas.block_num),
                quantity: quantity,
                symbol: symbol,
                date: datas.block_time,
                from: from,
                to: to
            };

            return transaction;
        }
    } catch(error) {
        return null;
    }
}

const buildTransaction = function(txn) {
    const transaction = {
    hash: txn.hash,
    block: txn.block_height,
    quantity: txn.outputs_value/100000000,
    symbol: "BCH",
    confirmations: txn.confirmations,
    date: helperSvc.unixToUTC(txn.created_at),
    from: txn.inputs[0].prev_addresses[0],
    to: txn.outputs[0].addresses[0]
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}