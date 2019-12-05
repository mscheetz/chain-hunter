const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.v.systems/api";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'V Systems';
    chain.symbol = 'VSYS';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let contract = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

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
    let endpoint = "/addressDetail?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.data !== "undefined" && response.data.data !== null) {
            const datas = response.data.data;
            const quantity = datas.regularRaw;
            const balance = helperSvc.commaBigNumber(quantity.toString());
            let address = {
                address: datas.Address,
                quantity: balance,
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

const getContract = async(address) => {
    let endpoint = "/getTokenDetail";
    let url = base + endpoint;
    let data = {
        tokenId: address
    };

    try{        
        const response = await axios.post(url, data);
        if(typeof response.data.data === "undefined" || response.data.data === null || response.data.data.List.length === 0) {
            return null;
        }
        const datas = response.data.data;
        const quantity = datas.TotalSupply;
        const commad = helperSvc.commaBigNumber(quantity);

        let contract = {
            address: datas.ContractId,
            quantity: commad,
            symbol: datas.Description,
            creator: datas.CreatorAddress,
            contractName: datas.Name
        };

        const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        contract.hasIcon = iconStatus;

        return contract;
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/addressTrans";
    let url = base + endpoint;
    let data = {
        address: address,
        pageNumber: 1,
        pageSize: 10,
        type: "all"
    };

    try{        
        const response = await axios.post(url, data);
        if(typeof response.data.data === "undefined" || response.data.data === null || response.data.data.List.length === 0) {
            return null;
        }
        const latestBlock = await getLatestBlock();
        const datas = response.data.data.List;
        let transactions = [];
        for(let i = 0; i < datas.length; i++) {
            let transaction = await buildTransaction(datas[i], latestBlock);

            transaction = helperSvc.inoutCalculation(address, transaction);

            transactions.push(transaction);
        }

        return transactions;
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/transactionDetail";
    let url = base + endpoint;
    let data = {
        id: hash
    };

    try{
        const response = await axios.post(url, data);
        if(typeof response.data.data !== "undefined" && response.data.data !== null) {
            const datas = response.data.data;
            const latestBlock = await getLatestBlock();
            
            const transaction = await buildTransaction(datas, latestBlock);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/blocks";
    let url = base + endpoint;
    let data = {
        pageNumber: 1,
        pageSize: 1
    };

    try{
        const response = await axios.post(url, data);
        if(typeof response.data.data !== "undefined" && response.data.data !== null && response.data.data.list.length > 0) {
            const datas = response.data.data.list;
            
            return datas.BlockId;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const buildTransaction = async(txn, latestBlock) => {
    let froms = [];
    let tos = [];    
    let fromAddress = txn.SenderAddress;
    let toAddress = txn.Recipient;
    let type = "";
    let quantityString = txn.Amount.substr(0, txn.Amount.indexOf(' ')).trim();
    let symbol = txn.Amount.substr(txn.Amount.indexOf(' ')).trim();
    if(txn.TypeName === 'minting') {
        type = enums.transactionType.STAKING;
        fromAddress = "Minting";
    } else if (txn.TypeName === 'payment') {
        type = enums.transactionType.PAYMENT;
    } else if (txn.TypeName === 'execute contract') {
        type = enums.transactionType.TRANSFER;
        const contract = await getContract(txn.ExplainParmList[0]);
        symbol = contract.symbol;
        quantityString = txn.ExplainParmList[1];
        fromAddress = txn.ExplainParmList[2];
        toAddress = txn.ExplainParmList[3];
    } else {
        type = helperSvc.firstCharUpperCase(txn>TypeName);
    }
    const quantity = parseFloat(quantityString);

    let from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
    froms.push(from);
    let to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const confirmations = latestBlock - txn.Height;

    let transaction = {
        type: type,
        hash: txn.Id,
        block: txn.Height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.TimeStamp),
        froms: fromData,
        tos: toData
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