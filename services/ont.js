const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explorer.ont.io/v2";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ontology';
    chain.symbol = 'ONT';
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
        if(transaction === null) {
            const contract = await getContract(toFind);
            chain.contract = contract;
        }
    }
    if(chain.address || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/addresses/" + addressToFind + "/native/balances";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;
            let allZeros = 0;
            let quantity = 0;
            datas.forEach(token => {
                if(token.balance === '0') {
                    allZeros++;
                }
                if(token.asset_name === "ont") {
                    quantity = token.balance;
                }
            })
            if(allZeros === datas.length) {
                return null;
            }
            const address = {
                address: addressToFind,
                quantity: quantity
            };

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getContract = async(address) => {
    let endpoint = "/contracts/" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0){
            const datas = response.data.result;
            let symbol = datas.ont_sum === "0" ? "ONG" : "ONT";
            let quantity = datas.ont_sum === "0" ? parseFloat(datas.ong_sum) : parseFloat(datas.ont_sum);

            const contract = {
                address: datas.contract_hash,
                quantity: quantity,
                symbol: symbol,
                creator: datas.creator,
                contractName: datas.name
            };

            return contract;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressTokenContracts = async(address) => {
    let endpoint = "/getAccountDetails?accountAddress=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return [];
        } else {
            const datas = response.data.content[0].tokens;
            let contracts = [];
            datas.forEach(data => {
                contracts.push(data.contractAddr);
            });

            return contracts;
        }
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let endpoint = "/addresses/"+ address +"/transactions?page_size=10&page_number=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);        
        if(response.data.code === 0) {
            const datas = response.data.result;
            const transactions = [];
            const latestBlock = await getLatestBlock();
            if(datas.length > 0) {
                datas.forEach(data => {
                    transactions.push(buildTransaction(data, latestBlock));
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
    let endpoint = "/transactions/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data.code === 0) {
            const datas = response.data.result;
            const latestBlock = await getLatestBlock();
            const transaction = buildTransactionII(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    const tokenContracts = await getAddressTokenContracts(address);
    let tokens = [];
    for (let i = 0; i < tokenContracts.length; i++) {
        const contract = tokenContracts[i];
        token = await getToken(address, contract);
        if(token !== null) {
            tokens.push(token);
        }
    }

    return tokens;
}

const getToken = async(address, contract) => {    
    let endpoint = "/getAccountDetails?accountAddress=" + address + "&tokenAddress=" + contract;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        const data = response.data.content[0];
        let asset = {
            quantity: helperSvc.commaBigNumber(data.balance.toString()),
            symbol: aionAddress.tokenSymbol
        };

        return asset;

    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/blocks?page_size=1&page_number=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.result.records[0].block_height.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const ts = txn.tx_time.toString().substr(0, 10);

    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";
    txn.transfers.forEach(xfer => {
        quantity = parseInt(xfer.amount);
        if(quantity > 0) {
            symbol = xfer.asset_name.toUpperCase();
            from = xfer.from_address;
            to = xfer.to_address;
        }
    });

    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        quantity: quantity,
        symbol: symbol,
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: from,
        to: to,
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const ts = txn.tx_time.toString().substr(0, 10);

    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";
    txn.detail.transfers.forEach(xfer => {
        const xferQty = parseInt(xfer.amount);
        if(xferQty > 0 && xfer.description !== "gasconsume" && from === "") {
            quantity = xferQty;
            symbol = xfer.asset_name.toUpperCase();
            from = xfer.from_address;
            to = xfer.to_address;
        }
    });
    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.block_height,
        quantity: quantity,
        symbol: symbol,
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: from,
        to: to,
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