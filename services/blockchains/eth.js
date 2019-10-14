const axios = require('axios');
const _ = require('lodash');
const helperSvc = require('../helperService.js');
const ethplorerBase = "https://ethplorer.io";
const ethplorerApiBase = "https://ethplorer.io/service/service.php?data=";
const enums = require('../../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async(chain) => {
    const chain = {};
    chain.name = 'Ethereum';
    chain.symbol = 'ETH';
    chain.hasTokens = true;
    chain.hasContracts = true;
    chain.contract = null;
    chain.type = enums.blockchainType.PROTOCOL;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind) => {
    //const chain = await getEmptyBlockchain(blockchain);

    if(toFind.substr(0,2) === "0x") {
        chain.address = null;
        chain.transaction = null;
        chain.contract = null;

        const searchType = helperSvc.searchType(chain.symbol.toLowerCase(), toFind);

        if(searchType & enums.searchType.nothing) {
        } else {
            chain = await ethCheck(chain, toFind);
        }

        if(chain.address || chain.transaction || chain.contract) {
            chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
        }
    }
    
    return chain;
}

const ethCheck = async(chain, addressToFind) => {
    let endpoint = addressToFind +"&showTx=all";
    let url = ethplorerApiBase + endpoint;

    try {
        const response = await axios.get(url);
        const datas = response.data;
        if(_.has(datas, 'isContract')) {
            if(datas.isContract) {
                chain.contract = createContract(datas.token);
            } else {
                let quantity = helperSvc.commaBigNumber(datas.balance.toString());

                let address = {
                    address: addressToFind,
                    quantity: quantity,
                    hasTransactions: true
                }
                
                address.tokens = createTokens(datas);
                address.transactions = await createTransactions(datas, addressToFind);
                chain.address = address;
            }
        } else if(_.has(datas, 'tx')) {
            if(datas.operations.length > 0) {
                chain.transaction = createTokenTransaction(datas);
            } else {
                chain.transaction = createEthTransaction(datas.tx);                
            }
        }
        return chain;
    } catch (error) {
        return chain;
    }
}

const createContract = function(datas) {
    let quantity = datas.totalSupply.toString();

    if(quantity.toLowerCase().indexOf("e+") >= 0) {
        quantity = helperSvc.exponentialToNumber(quantity);
    }
    quantity = helperSvc.commaBigNumber(quantity);
    
    let contract = {
        address: datas.address,
        quantity: quantity,
        symbol: datas.symbol,
        creator: datas.owner,
        contractName: datas.name
    };
    const icon = 'color/' + contract.symbol.toLowerCase() + '.png';
    const iconStatus = helperSvc.iconExists(icon);
    contract.hasIcon = iconStatus;

    return contract;
}

const createTokens = function(datas) {
    let tokens = [];
    
    for(const [key, value] of Object.entries(datas.tokens)){
        let token = {
            name: value.name,
            symbol: value.symbol,
            hasIcon: false,
            quantity: 0
        };
        const balance = datas.balances.find(bal => {
            return bal.contract === key;
        });

        if(balance !== undefined) {
            let qty = balance.balance.toString();
            if(qty.toLowerCase().indexOf("e+") >= 0) {
                qty = helperSvc.exponentialToNumber(qty);
            }
            qty = helperSvc.bigNumberToDecimal(qty, value.decimals);
            qty = helperSvc.commaBigNumber(qty.toString());
            qty = helperSvc.decimalCleanup(qty);
            token.quantity = qty;
        }

        if(token.name === "") {
            token.name = "Un-named token";
        }
        if(token.symbol === "") {
            token.symbol = "No symbol assigned";
        }
        const icon = 'color/' + value.symbol.toLowerCase() + '.png';
        const iconStatus = helperSvc.iconExists(icon);
        token.hasIcon = iconStatus;

        tokens.push(token);
    }
    
    return _.sortBy(tokens, 'name');
}

const createEthTransaction = function(datas) {
    let qty = datas.value.toString();
    let froms = [];
    let tos = [];
    const symbol = "ETH";
    if(qty.toLowerCase().indexOf("e+") >= 0) {
        qty = helperSvc.exponentialToNumber(qty);
    }
    const from = helperSvc.getSimpleIO(symbol, datas.from, qty);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, datas.to, qty);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);
    
    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: datas.hash,
        block: datas.blockNumber,
        confirmations: datas.confirmations,
        date: helperSvc.unixToUTC(datas.timestamp),
        froms: fromData,
        tos: toData,
        success: datas.success ? 'success' : 'fail'
    };

    return transaction;
}

const createTokenTransaction = function(datas) {
    let froms = [];
    let tos = [];
    let qty = datas.operations[0].value.toString();
    if(qty.toLowerCase().indexOf("e+") >= 0) {
        qty = helperSvc.exponentialToNumber(qty);
    }
    const decimals = datas.operations[0].token.decimals;
    qty = helperSvc.bigNumberToDecimal(qty, decimals);
    const from = helperSvc.getSimpleIO(datas.token.symbol, datas.tx.from, qty);
    froms.push(from);
    const to = helperSvc.getSimpleIO(datas.token.symbol, datas.tx.to, qty);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const transaction = {
        type: enums.transactionType.TRANSFER,
        hash: datas.tx.hash,
        block: datas.tx.blockNumber,
        confirmations: datas.tx.confirmations,
        date: helperSvc.unixToUTC(datas.tx.timestamp),
        froms: fromData,
        tos: toData,
        success: datas.tx.success ? 'success' : 'fail'
    };

    return transaction;
}

const createTransactions = async(datas, address) => {
    let transactions = [];
    let lastestBlock = 0;    

    for(let i = 0; i < datas.transfers.length; i++){
        let froms = [];
        let tos = [];
        const xfer = datas.transfers[i];
        const hash = xfer.transactionHash;
        const block = xfer.blockNumber;
        let symbol = "ETH";
        let decimals = 0;
        if(!xfer.isEth){
            const token = datas.tokens[xfer.contract];
            symbol = token.symbol;
            decimals = token.decimals;
        }
        if(lastestBlock === 0){
            lastestBlock = await getLatestBlock(hash);
        }
        const confirmations = lastestBlock > 0 
                            ? lastestBlock - block
                            : 0;
        let qty = xfer.value.toString();
        if(qty.toLowerCase().indexOf("e+") >= 0) {
            qty = helperSvc.exponentialToNumber(qty);
        }
        if(symbol !== "ETH" ) {
            qty = helperSvc.bigNumberToDecimal(qty, decimals);
        }
        const from = helperSvc.getSimpleIO(symbol, xfer.from, qty);
        froms.push(from);
        const to = helperSvc.getSimpleIO(symbol, xfer.to, qty);
        tos.push(to);

        const fromData = helperSvc.cleanIO(froms);
        const toData = helperSvc.cleanIO(tos);

        let txn = {
            type: enums.transactionType.TRANSFER,
            hash: hash,
            block: block,
            confirmations: confirmations,
            date: helperSvc.unixToUTC(xfer.timestamp),
            froms: fromData,
            tos: toData
        };

        txn = helperSvc.inoutCalculation(address, txn);

        transactions.push(txn);
    }

    return transactions;
}

const getLatestBlock = async(hash) => {
    let endpoint = hash +"&showTx=all";
    let url = ethplorerApiBase + endpoint;

    try {
        const response = await axios.get(url);
        const datas = response.data;
        if(_.has(datas, 'tx')) {
            return datas.tx.blockNumber + datas.txn.confirmations;
        } else {
            return 0;
        }
        
    } catch (error) {
        return 0;
    }
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    ethCheck
}
