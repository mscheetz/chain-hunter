const axios = require('axios');
const _ = require('lodash');
const helperSvc = require('./helperService.js');
const ethplorerBase = "https://ethplorer.io";
const ethplorerApiBase = "https://ethplorer.io/service/service.php?data=";
const enums = require('../classes/enums');
const delay = time => new Promise(res=>setTimeout(res,time));

const getEmptyBlockchain = async() => {
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

const getBlockchain = async(toFind) => {
    let chain = await getEmptyBlockchain();

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
            //chain.source = ethplorerBase + "/address/" + addressToFind;
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
                address.transactions = await createTransactions(datas);
                chain.address = address;
            }
        } else if(_.has(datas, 'tx')) {
            //chain.source = ethplorerBase + "/tx/" + addressToFind;
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
    if(qty.toLowerCase().indexOf("e+") >= 0) {
        qty = helperSvc.exponentialToNumber(qty);
    }
    
    qty = helperSvc.commaBigNumber(qty.toString());

    const transaction = {
        hash: datas.hash,
        block: datas.blockNumber,
        quantity: qty,
        symbol: "ETH",
        confirmations: datas.confirmations,
        date: helperSvc.unixToUTC(datas.timestamp),
        from: datas.from,
        to: datas.to
    };

    return transaction;
}

const createTokenTransaction = function(datas) {
    let qty = datas.operations[0].value.toString();
    if(qty.toLowerCase().indexOf("e+") >= 0) {
        qty = helperSvc.exponentialToNumber(qty);
    }
    qty = parseFloat(qty)/100000000;
    qty = helperSvc.commaBigNumber(qty.toString());

    const transaction = {
        hash: datas.tx.hash,
        block: datas.tx.blockNumber,
        quantity: qty,
        symbol: datas.token.symbol,
        confirmations: datas.tx.confirmations,
        date: helperSvc.unixToUTC(datas.tx.timeStamp),
        from: datas.tx.from,
        to: datas.tx.to
    };

    return transaction;
}

const createTransactions = async(datas) => {
    let transactions = [];
    let lastestBlock = 0;    

    for(let i = 0; i < datas.transfers.length; i++){
        const xfer = datas.transfers[i];
        const hash = xfer.transactionHash;
        const block = xfer.blockNumber;     
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
        qty = parseFloat(qty)/100000000;
        qty = helperSvc.commaBigNumber(qty.toString());

        let txn = {
            hash: hash,
            block: block,
            quantity: qty,
            symbol: xfer.isEth ? "ETH" : null,
            confirmations: confirmations,
            date: helperSvc.unixToUTC(xfer.timestamp),
            from: xfer.from,
            to: xfer.to            
        };

        if(txn.symbol === null) {
            const token = datas.tokens[xfer.contract];
            txn.symbol = token.symbol;
        }

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
