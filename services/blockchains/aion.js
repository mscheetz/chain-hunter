const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://mainnet-api.theoan.com/aion/dashboard"
const enums = require('../../classes/enums');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'AION';
    chain.symbol = 'AION';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);

    let block = null;
    let address = null;
    let transaction = null;
    let contract = null;
    
    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if((searchType & enums.searchType.transaction) && address === null) {
        transaction = await getTransaction(toFind);
    }
    if((searchType & enums.searchType.contract) && transaction === null) {
        contract = await getContract(toFind);
    }
    chain.block = block
    chain.address = address;
    chain.transaction = transaction;
    chain.contract = contract;
    
    if(chain.block || chain.address || chain.transaction || chain.contract) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getBlock = async(blockNumber) => {
    let endpoint = `/block?blockNumber=${blockNumber}`;
    let url = base.replace("dashboard", "v2/dashboard") + endpoint;

    try{
        const response = await axios.get(url);
        
        if(typeof response.data !== "undefined" && response.data !== null && response.data.content !== null && response.data.content.length > 0) {
            const datas = response.data.content[0];
            let ts = datas.blockTimestamp;

            let block = {
                blockNumber: blockNumber,
                validator: hashCleanup(datas.minerAddress),
                transactionCount: datas.numTransactions,
                date: helperSvc.unixToUTC(ts),
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                hash: hashCleanup(datas.blockHash),
                hasTransactions: true
            };

            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddress = async(addressToFind) => {
    let endpoint = "/getAccountDetails?accountAddress=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if((typeof response.data.content === "undefined") || response.data.content === null || response.data.content.length === 0){
            return null;
        } else {
            const datas = response.data.content[0];
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);
            const address = {
                address: addressToFind,
                quantity: cleanedTotal,
                hasTransactions: true
            };

            return address;
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
            const total = helperSvc.commaBigNumber(datas.balance.toString());
            const cleanedTotal = helperSvc.decimalCleanup(total);
            let contractAddress = datas.contractAddr;
            contractAddress = hashCleanup(contractAddress);
            let creator = datas.contractCreatorAddr;
            creator = hashCleanup(creator);
            let contract = {
                address: contractAddress,
                quantity: cleanedTotal,
                symbol: "AION",
                creator: creator,
                contractName: datas.contractName
            };
            const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
            const iconStatus = helperSvc.iconExists(icon);
            contract.hasIcon = iconStatus;

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
    let endpoint = "", url = "";
    let divide = false;
    if(helperSvc.hasLetters(address)) {
        endpoint = "/getTransactionsByAddress?accountAddress="+ address +"&page=0&size=10";
        url = base + endpoint;
    } else {
        endpoint = `/transactions?blockNumber=${address}`;
        url = base.replace("dashboard", "v2/dashboard") + endpoint;
        divide = true;
    }

    try{
        const response = await axios.get(url);
        if(response.data.content !== null && response.data.content.length > 0) {
            const datas = response.data.content;
            const transactions = [];
            const latestBlock = await getLatestBlock();
            if(datas.length > 0) {
                datas.forEach(data => {
                    let transaction = buildTransaction(data, latestBlock, divide);
                    if(!divide) {
                        transaction = helperSvc.inoutCalculation(address, transaction);
                    }

                    transactions.push(transaction);
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
    let endpoint = "/getTransactionDetailsByTransactionHash?searchParam=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.content === "undefined") {
            return null;
        } else {
            const data = response.data.content[0];
            const latestBlock = await getLatestBlock();
            const transaction = buildTransaction(data, latestBlock);

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
        const datas = response.data.content[0];
        const contr = datas.tokens.find(t => t.contractAddr === contract);
        const decimals = contr.tokenDecimal;
        const qty = datas.balance.length > decimals 
                    ? helperSvc.bigNumberToDecimal(datas.balance, decimals)
                    : datas.balance;
        const total = helperSvc.commaBigNumber(qty.toString());
        const cleanedTotal = helperSvc.decimalCleanup(total);
        let asset = {
            quantity: cleanedTotal,
            symbol: datas.tokenSymbol,
            name: datas.tokenName
        };
        const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        asset.hasIcon = iconStatus;

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

const buildTransaction = function(txn, latestBlock, divide = false) {
    let symbol = "AION";
    let fromAddy = txn.fromAddr;
    let toAddy = txn.toAddr;
    let quantity = parseFloat(txn.value);
    if(divide) {
        quantity = quantity/1000000000000000000;
    }
    let froms = [];
    let tos = [];
    if((typeof txn.tokenTransfers !== 'undefined') && txn.tokenTransfers.length > 0) {
        symbol = txn.tokenTransfers[0].tokenSymbol;
        fromAddy = txn.tokenTransfers[0].from;
        toAddy = txn.tokenTransfers[0].to;
        quantity = parseFloat(txn.tokenTransfers[0].value)/1000000000000000000;
    }
    fromAddy = hashCleanup(fromAddy);
    toAddy = hashCleanup(toAddy);
    let hash = txn.transactionHash;
    hash = hashCleanup(hash);

    const from = helperSvc.getSimpleIO(symbol, fromAddy, quantity);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, toAddy, quantity);
    tos.push(to);

    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);

    const ts = txn.transactionTimestamp.toString().substr(0, 10);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: hash,
        block: txn.blockNumber,
        latestBlock: latestBlock,
        confirmations: latestBlock - txn.blockNumber,
        date: helperSvc.unixToUTC(parseInt(ts)),
        froms: fromDatas,
        tos: toDatas
    };

    return transaction;
}

const hashCleanup = function(hash) {
    if(hash.substr(0, 2) !== "0x") {
        hash = "0x" + hash;
    }

    return hash;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTokens,
    getTransactions,
    getTransaction
}