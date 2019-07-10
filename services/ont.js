const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://explorer.ont.io/v2";
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Ontology';
    chain.symbol = 'ONT';
    chain.hasTokens = false;
    chain.hasContracts = false;
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
        await delay(1000);
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
    }
    await delay(1000);
    //const contract = await getContract(toFind);
    //chain.contract = contract;
    if(chain.address || chain.transaction /*|| chain.contract*/) {
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
            let quantity = 0;
            datas.forEach(token => {
                if(token.asset_name === "ont") {
                    quantity = token.balance;
                }
            })
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
    let endpoint = "/getContractDetailsByContractAddress?searchParam=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return null;
        } else {
            const datas = response.data.content[0];
            const contract = {
                address: datas.contractAddr,
                quantity: datas.balance,
                creator: datas.contractCreatorAddr,
                contractName: datas.contractName
            };

            return contract;
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
            const latestBlock = 0;//await getLatestBlock();
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
        if(response.data.code !== 0) {
            return null;
        } else {
            const data = response.data.result;
            const latestBlock = 0;//await getLatestBlock();
            const transaction = buildTransactionII(data, latestBlock);

            return transaction;
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
    let endpoint = "/getBlockList?page=0&size=1";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        
        return response.data.content[0].blockNumber.toString();
    } catch(error) {
        return 0;
    }
}

const buildTransaction = function(txn, latestBlock) {
    const ts = txn.time.toString().substr(0, 10);

    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";
    txn.transfers.forEach(xfer => {
        if(xfer.amount > 1) {
            quantity = xfer.amount;
            symbol = xfer.asset_name.toUpperCase();
            from = xfer.from_address;
            to = xfer.to_address;
        }
    });

    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        //latestBlock: latestBlock,
        //confirmations: latestBlock - txn.blockNumber,
        quantity: quantity,
        symbol: symbol,
        date: helperSvc.unixToUTC(parseInt(ts)),
        from: from,
        to: to,
    };

    return transaction;
}

const buildTransactionII = function(txn, latestBlock) {
    const ts = txn.time.toString().substr(0, 10);

    let quantity = 0;
    let symbol = "";
    let from = "";
    let to = "";
    txn.detail.transfers.forEach(xfer => {
        if(xfer.amount > 1 && xfer.description !== "gasconsume") {
            quantity = xfer.amount;
            symbol = xfer.asset_name.toUpperCase();
            from = xfer.from_address;
            to = xfer.to_address;
        }
    });

    const transaction = {
        hash: txn.tx_hash,
        block: txn.block_height,
        //latestBlock: latestBlock,
        //confirmations: latestBlock - txn.blockNumber,
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