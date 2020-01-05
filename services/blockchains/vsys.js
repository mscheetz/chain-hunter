const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://explorer.v.systems/api";
const enums = require('../../classes/enums');
const _ = require('lodash');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'V Systems';
    chain.symbol = 'VSYS';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
    let contract = null;
    let transaction = null;

    const searchType = type === enums.searchType.nothing 
            ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
            : type;

    if(searchType & enums.searchType.address) {
        address = await getAddress(toFind);
    }
    if(searchType & enums.searchType.block) {
        block = await getBlock(toFind);
    }
    if(searchType & enums.searchType.contract) {
        contract = await getContract(toFind);
    }
    if(contract === null && searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.contract = contract;
    chain.transaction = transaction;

    if(chain.address || chain.block || chain.contract || chain.transaction) {
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

const getTokens = async(address) => {
    let endpoint = `/getAddressTokenList/${address}`;
    let url = base + endpoint;

    try{        
        const response = await axios.get(url);
        if(typeof response.data.data === "undefined" || response.data.data === null || response.data.data.length === 0) {
            return [];
        }
        const datas = response.data.data;
        let tokens = [];
        datas.forEach(data => {
            tokens.push(buildToken(data));
        })

        return tokens;
    } catch(error) {
        return [];
    }
}

const buildToken = function(data) {
    const total = helperSvc.commaBigNumber(data.Balance);
    const cleanedTotal = helperSvc.decimalCleanup(total);
    let asset = {
        quantity: cleanedTotal,
        symbol: data.Token.Description,
        name: data.Token.Name,
        id: data.Token.Id
    };
    const icon = 'color/' + asset.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    asset.hasIcon = iconStatus;

    return asset;
}

const getBlock = async(blockNumber) => {
    let endpoint = "/blocks/" + blockNumber;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data.data !== "undefined" && response.data.data !== null && response.data.data.Height > 0) {
            const datas = response.data.data;
            const latestBlock = await getLatestBlock();
            
            let block = buildBlock(datas, latestBlock);

            if(datas.list.length > 0) {
                const latestBlock = await getLatestBlock();
                let values = [];
                let transactions = [];
                for(let i = 0; i < datas.list.length; i++){
                    const txn = datas.list[i];
                    if(txn.Amount.indexOf("VSYS") > 0) {
                        const quantityString = txn.Amount.substr(0, txn.Amount.indexOf(' ')).trim();
                        const quantity = parseFloat(quantityString);
                        values.push(quantity);
                    }
                    const transaction = await buildTransaction(datas.list[i], latestBlock);
                    transactions.push(transaction);
                }
                let summed = 0;
                if(values.length > 0) {
                    summed = values.reduce((a, b) => a + b, 0);

                }
                block.volume = summed;
                block.transactions = transactions;
            }
            
            return block;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlocks = async() => {
    let endpoint = "/blocks";
    let url = base + endpoint;
    let data = {
        pageNumber: 1,
        pageSize: 20
    };

    try{
        const response = await axios.post(url, data);
        let blocks = [];
        if(typeof response.data.data !== "undefined" && response.data.data !== null && response.data.data.Height > 0) {
            const datas = response.data.data.list;
            const latestBlock = datas[0].Height;
            
            for(let data of datas) {
                const block = buildBlock(data, latestBlock);

                blocks.push(block);
            }
            
        }
        return block;
    } catch(error) {
        return [];
    }
}

const buildBlock = function(data, latestBlock) {                
    let ts = data.TimeStamp.toString().substr(0,10);
    let size = data.Size.replace("B","");

    let block = {
        blockNumber: data.Height,
        validator: data.Generator,
        transactionCount: data.Txs,
        confirmations: latestBlock - data.Height,
        date: helperSvc.unixToUTC(ts),
        size: `${helperSvc.commaBigNumber(size)} bytes`,
        hash: data.Signature,
        hasTransactions: true
    };

    return block;
}

const getContract = async(address) => {
    let endpoint = "/getTokenDetail";
    let url = base + endpoint;
    let data = {
        tokenId: address
    };

    try{
        const response = await axios.post(url, data);
        if(typeof response.data.data === "undefined" || response.data.data === null) {
            return null;
        }
        const datas = response.data.data;
        const quantity = datas.TotalSupply/1000000000;
        const commad = helperSvc.commaBigNumber(quantity.toString());

        let contract = {
            address: datas.Id,
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

const getTokenTransactions = async(address, contract, symbol) => {
    let endpoint = "/getAddressTokenTransactions";
    let url = base + endpoint;
    let data = {
        address: address,
        tokenId: contract,
        current: 1,
        size: 10
    };

    try{        
        const response = await axios.post(url, data);
        if(typeof response.data.data === "undefined" || response.data.data === null || response.data.data.List.length === 0) {
            return [];
        }
        const latestBlock = await getLatestBlock();
        const datas = response.data.data.List;
        let transactions = [];
        for(let i = 0; i < datas.length; i++) {
            let transaction = await buildTransaction(datas[i], latestBlock, symbol);

            transaction = helperSvc.inoutCalculation(address, transaction);

            transactions.push(transaction);
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransactions = async(address) => {
    let transactions = await getAddressTransactions(address);
    const tokens = await getTokens(address);
    let tokensTxns = [];    
    if(tokens.length > 0) {
        for(let i = 0; i < tokens.length; i++){
            const tokenTxns = await getTokenTransactions(address, tokens[i].id, tokens[i].symbol);
            if(tokenTxns.length > 0){
                tokenTxns.forEach(t => {
                    tokensTxns.push(t);
                });
            }
        }
    }
    if(tokensTxns.length > 0){
        tokensTxns.forEach(t => {
            transactions.push(t);
        });
    }
    transactions = _.orderBy(transactions, "ts", "desc");
    const sliceSize = transactions.length < 10 ? transactions.length : 10;

    return transactions.slice(0, sliceSize);
}

const getAddressTransactions = async(address) => {
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
            return [];
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
        return [];
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

            return datas[0].BlockId;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const buildTransaction = async(txn, latestBlock, symbol = "") => {
    let froms = [];
    let tos = [];    
    let fromAddress = (typeof txn.SenderAddress === 'undefined') ? "" : txn.SenderAddress;
    let toAddress = txn.Recipient;
    let type = "";
    let quantityString = "";
    let ts = 0;
    let height = (typeof txn.Height === 'undefined') ? 0 : txn.Height;
    if(symbol === "")  {
        symbol = txn.Amount.substr(txn.Amount.indexOf(' ')).trim();
    }
    if(typeof txn.TypeName === 'undefined') {
        type = enums.transactionType.TRANSFER;
        fromAddress = txn.Sender;
        toAddress = txn.Recipient;
        quantityString = (txn.Amount / 1000000000).toString();
        ts = txn.Timestamp;
    } else {
        quantityString = txn.Amount.substr(0, txn.Amount.indexOf(' ')).trim();
        ts = txn.TimeStamp;
        if(txn.TypeName === 'minting') {
            type = enums.transactionType.STAKING;
            fromAddress = "Minting";
        } else if (txn.TypeName === 'payment') {
            type = enums.transactionType.PAYMENT;
        } else if (txn.TypeName === 'execute contract') {
            type = enums.transactionType.CONTRACT;
            if(typeof txn.ExplainParmList !== 'undefined' && txn.ExplainParmList !== null) {
                const contract = await getContract(txn.ExplainParmList[0]);
                symbol = contract.symbol;
                quantityString = txn.ExplainParmList[1];
                fromAddress = txn.ExplainParmList[2];
                toAddress = txn.ExplainParmList[3];
            }
        } else {
            type = helperSvc.firstCharUpperCase(txn.TypeName);
        }
    }
    const quantity = parseFloat(quantityString);

    let from = helperSvc.getSimpleIO(symbol, fromAddress, quantity);
    froms.push(from);
    let to = helperSvc.getSimpleIO(symbol, toAddress, quantity);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    const confirmations = latestBlock - height;
    ts = ts / 1000000000;
    
    let transaction = {
        type: type,
        hash: txn.Id,
        block: height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(ts),        
        froms: fromData,
        tos: toData,
        success: txn.Status === "Success" ? "success" : "fail",
        ts: ts
    };

    return transaction;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction,
    getContract,
    getTokens,
    getBlock,
    getBlocks
}