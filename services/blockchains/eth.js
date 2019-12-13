const axios = require('axios');
const _ = require('lodash');
const helperSvc = require('../helper.service.js');
const ethplorerBase = "https://ethplorer.io";
const ethplorerApiBase = "https://ethplorer.io/service/service.php?data=";
const etherscanBase = "https://api.etherscan.io/api"
const enums = require('../../classes/enums');
const config = require('../../config');
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

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);

    //if(toFind.substr(0,2) === "0x") {
        chain.address = null;
        chain.block = null;
        chain.transaction = null;
        chain.contract = null;

        const searchType = type === enums.searchType.nothing 
        ? helperSvc.searchType(chain.symbol.toLowerCase(), toFind)
        : type;
        
        if(searchType & enums.searchType.nothing) {
        } else if (searchType & enums.searchType.block) {
            chain.block = await getBlock(toFind);
        } else {
            chain = await ethCheck(chain, toFind);
        }

        if(chain.address || chain.block || chain.transaction || chain.contract) {
            chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
        }
    //}
    
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

const getBlock = async(blockNumber) => {
    const blockHex = helperSvc.numberToHex(blockNumber);
    
    let endpoint = `?module=proxy&action=eth_getBlockByNumber&tag=${blockHex}&boolean=true&apikey=${config.ETHERSCAN_API_KEY}`;
    let url = etherscanBase + endpoint;

    try {
        const response = await axios.get(url);

        if(typeof response.data.result !== 'undefined') {
            const datas = response.data.result;

            const ts = helperSvc.hexToNumber(datas.timestamp);
            const size = helperSvc.hexToNumber(datas.size);

            let block = {
                blockNumber: blockNumber,
                validator: datas.miner,
                transactionCount: datas.transactions.length,
                date: helperSvc.unixToUTC(ts),
                size: `${helperSvc.commaBigNumber(size.toString())} bytes`,
                hash: datas.hash,
                hasTransactions: true
            };
            
            let transactions = [];
            if(datas.transactions.length > 0) {
                let values = [];
                const lastestBlock = await getLatestBlock();
                datas.transactions.forEach(tx => {
                    const transaction = buildTransaction(tx, ts, blockNumber, lastestBlock);

                    if(transaction.tos.length > 0) {
                        let txnValues = transaction.tos.map(t => +t.quantity);
                        values = _.concat(values, txnValues);
                    }
                    transactions.push(transaction);
                });
                if(block.transactionCount === transactions.length) {
                    let totalVolume = 0;
                    if(values.length > 0) {
                        const quantity = values.reduce((a, b) => a + b, 0);
                        totalVolume = helperSvc.commaBigNumber(quantity.toString());
                    }
                    block.volume = totalVolume;
                }
                block.transactions = transactions;
            }

            return block;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

const buildTransaction = function(tx, ts, block, lastestBlock) {
    const quantity = helperSvc.hexToNumber(tx.value);
    const qty = quantity/1000000000000000000;
    const symbol = "ETH";
    let froms = [];
    let tos = [];
    const from = helperSvc.getSimpleIO(symbol, tx.from, qty);
    froms.push(from);
    const to = helperSvc.getSimpleIO(symbol, tx.to, qty);
    tos.push(to);

    const fromData = helperSvc.cleanIO(froms);
    const toData = helperSvc.cleanIO(tos);

    const confirmations = lastestBlock - block;

    let txn = {
        type: enums.transactionType.TRANSFER,
        hash: tx.hash,
        block: block,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(ts),
        froms: fromData,
        tos: toData
    };

    return txn;
}

module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    ethCheck
}
