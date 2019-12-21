const axios = require('axios');
const helperSvc = require('../helper.service.js');
const base = "https://blockchain.info";
const baseBTC = "https://chain.api.btc.com"
const enums = require('../../classes/enums');
const _  = require('lodash');
const bitcore = require('bitcore-lib');
const bech32 = require('bech32');// require('bech32-buffer');

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Bitcoin';
    chain.symbol = 'BTC';
    chain.hasTokens = false;
    chain.hasContracts = false;
    chain.contract = null;
    chain.type = enums.blockchainType.PAYMENT;
    chain.icon = "white/"+ chain.symbol.toLowerCase()  +".png";

    return chain;
}

const getBlockchain = async(chain, toFind, type) => {
    //const chain = await getEmptyBlockchain(blockchain);
    let address = null;
    let block = null;
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
    if(searchType & enums.searchType.transaction) {
        transaction = await getTransaction(toFind);
    }
    
    chain.address = address;
    chain.block = block;
    chain.transaction = transaction;
    
    if(chain.address || chain.block || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".png";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/v3/address/" + addressToFind;
    let url = baseBTC + endpoint;

    try{
        const response = await axios.get(url);
        
        if(response.data !== null && response.data.err_no === 0) {
            const datas = response.data.data;
            const quantity = datas.balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: addressToFind,
                quantity: total,
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

const getAddressBlockchain = async(addressToFind) => {
    let endpoint = "/rawaddr/" + addressToFind + "?limit=10";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);

        if(response.data !== null) {
            const datas = response.data;
            const quantity = datas.final_balance/100000000;
            const total = helperSvc.commaBigNumber(quantity.toString());

            let address = {
                address: datas.address,
                quantity: total,
                hasTransactions: true
            };
            const latestblock = await getLatestBlock();
            const txns = datas.txs.slice(0, 10);
            address.transactions = getTransactionsBlockchain(txns, latestblock, datas.address);

            return address;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getBlock = async(blockNumber) => {
    let endpoint = `/v3/block/${blockNumber}`;
    let url = baseBTC + endpoint;

    try{
        const response = await axios.get(url);

        if(response.data !== null && response.data.err_no === 0) {
            const datas = response.data.data;
            
            let validator = (typeof datas.extras !== 'undefined' && typeof datas.extras.pool_name !== 'undefined')
                ? datas.extras.pool_name
                : null;

            let block = {
                blockNumber: blockNumber,
                validator: validator,
                transactionCount: datas.tx_count,
                date: helperSvc.unixToUTC(datas.timestamp),
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                hash: datas.hash,
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

const getBlockBlockchain = async(blockNumber) => {
    let endpoint = `/block-height/${blockNumber}?format=json`;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(typeof response.data !== "undefined" && response.data !== null && response.data.blocks !== null && response.data.blocks.length > 0) {
            const datas = response.data.blocks[0];
            
            let ts = datas.time;
            let block = {
                blockNumber: blockNumber,
                //validator: datas.Generator,
                transactionCount: datas.n_tx,
                date: helperSvc.unixToUTC(datas.time),
                size: `${helperSvc.commaBigNumber(datas.size.toString())} bytes`,
                hash: datas.hash,
                hasTransactions: true
            };

            if(datas.tx.length > 0) {
                const latestblock = await getLatestBlock();
                const confirmations = latestblock - blockNumber;
                let values = [];
                let i = 0;
                let transactions = []
                
                datas.tx.forEach(txn => {
                    if(txn.out.length > 0) {
                        let txnValues = txn.out.map(o => o.value);
                        values = _.concat(values, txnValues);
                    }
                    if(i < 100) {
                        let transaction = buildTransaction(txn, latestblock);
                        transaction.confirmations = confirmations;
                        transaction.block = blockNumber;
                        transactions.push(transaction);
                    }
                    i++;
                });
                let quantity = 0;
                if(values.length > 0) {
                    const summed = values.reduce((a, b) => a + b, 0);
                    quantity = summed/100000000;
                }
                block.volume = quantity;
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

const getTransactions = async(address) => {
    let method = "";
    let isBlock = false;
    if(helperSvc.hasLetters(address)) {
        method = "address";
    } else {
        method = "block";
        isBlock = true;
    }
    let endpoint = `/v3/${method}/${address}/tx`;
    let url = baseBTC + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.data !== null && response.data.err_no === 0) {
            const datas = response.data.data.list;

            for(let data of datas) {
                let transaction = buildTransactionBTC(data);

                if(!isBlock) {
                    transaction = helperSvc.inoutCalculation(address, transaction);
                }
                
                transactions.push(transaction);
            }
        }
        return transactions;
    } catch(err) {
        return [];
    }
}

const getTransactionsBlockchain = function(txns, latestblock, address) {
    let transactions = [];
    txns.forEach(txn => {
        let transaction = buildTransaction(txn, latestblock);
        transaction = helperSvc.inoutCalculation(address, transaction);
        
        transactions.push(transaction);
    });

    return transactions;            
}

const getTransactionBTC = async(hash) => {
    let endpoint = `/v3/tx/${hash}?verbose=3`;
    let url = baseBTC + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data !== null) {
            const data = response.data;

            const transaction = buildTransactionBTC(data);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/v3/tx/" + hash;
    let url = baseBTC + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data !== null && response.data.err_no === 0) {
            const data = response.data.data;

            const transaction = buildTransactionBTC(data);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactionBlockchain = async(hash) => {
    let endpoint = "/rawtx/" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url, { timeout: 5000 });
        if(response.data !== null) {
            const data = response.data;

            const latestblock = await getLatestBlock();
            const transaction = buildTransaction(data, latestblock);
            
            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getLatestBlock = async() => {
    let endpoint = "/latestblock";
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.data !== null) {
            const data = response.data;

            return data.height;
        } else {
            return 0;
        }
    } catch(error) {
        return 0;
    }
}

const buildTransactionBTC = function(txn) {
    try{
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;
    const symbol = "BTC";
    let i = 0;
    for(let input of txn.inputs) {
        let from;
        if(typeof input.prev_addresses !== 'undefined') {
            let addresses = input.prev_addresses;
            let validatedAddresses = [];
            if(addresses.length > 0) {
                for(let addr of addresses) {
                    let validAddress = false;
                    if(addr.substr(0, 1) === "1" || addr.substr(0, 1) === "3" || addr.substr(0, 3) === 'bc1'){
                        validAddress = true;
                    }
                    if(!validAddress) {
                        addr = `Unknown ${input.prev_type} {${i}}`;
                        i++;
                    }
                    validatedAddresses.push(addr);
                }
            } else {
                if(input.prev_tx_hash === "0000000000000000000000000000000000000000000000000000000000000000") {
                    validatedAddresses.push('coinbase');                    
                } else {
                    validatedAddresses.push(input.prev_type);
                }
            }
            const quantity = input.prev_value/100000000;
            from = helperSvc.getSimpleIOAddresses(symbol, validatedAddresses, quantity);
        } else {
            type = enums.transactionType.MINING;
            from = {
                addresses: ["coinbase"]
            }
        }
        froms.push(from);
    }
    for(let output of txn.outputs) {
        if(typeof output.addresses !== 'undefined') {
            let addresses = output.addresses;
            let validatedAddresses = [];
            if(addresses.length > 0) {
                for(let addr of addresses) {
                    let validAddress = false;
                    if(addr.substr(0, 1) === "1" || addr.substr(0, 1) === "3" || addr.substr(0, 3) === 'bc1'){
                        validAddress = true;
                    }
                    if(!validAddress) {
                        addr = `Unknown ${output.type} {${i}}`;
                        i++;
                    }
                    validatedAddresses.push(addr);
                }
            } else {
                validatedAddresses.push(output.type);
            }
            const quantity = output.value/100000000;
            const to = helperSvc.getSimpleIOAddresses(symbol, validatedAddresses, quantity);
            tos.push(to);
        }
    }

    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);
        
    const transaction = {
        type: type,
        hash: txn.hash,
        block: txn.block_height,
        confirmations: txn.confirmations,
        date: helperSvc.unixToUTC(txn.block_time),
        froms: fromDatas,
        tos: toDatas
    };

    return transaction;
}catch(err) {console.log(err)}
}

const buildTransaction = function(txn, latestblock) {
    let froms = [];
    let tos = [];
    let type = enums.transactionType.TRANSFER;
    txn.inputs.forEach(input => {
        //console.log(input);
        let from = null;
        if(typeof input.prev_out === "undefined") {
            type = enums.transactionType.MINING;
            from = {
                addresses: ["coinbase"]
            }
        } else {
            if(typeof input.prev_out.addr !== 'undefined') {
                from = helperSvc.getIO("BTC", input, true);
            } else {
                try {
                    const quantity = input.prev_out.value/100000000;

                    const address = getBtcAddress(input.prev_out.script);

                    from = helperSvc.getSimpleIO("BTC", address, quantity);
                    console.log(`input address: ${address}`);
                } catch(err) {console.log(err)}
                // try {
                // let fromAddress = bech32.decode(input.prev_out.script);
                // console.log(fromAddress);
                // } catch(err) {console.log(err)}
            }
        }
        froms.push(from);
    });
    txn.out.forEach(output => {
        let to = null;
        if(typeof output.addr !== 'undefined') {
            to = helperSvc.getIO("BTC", output, false);
        } else {
            const quantity = output.value/100000000;

            const address = getBtcAddress(output.script);

            to = helperSvc.getSimpleIO("BTC", address, quantity);
            console.log(`output address: ${address}`);
        }
        tos.push(to);
    });
//console.log('froms', froms);
    const fromDatas = helperSvc.cleanIO(froms);
    const toDatas = helperSvc.cleanIO(tos);
    
    const confirmations = latestblock > 0 ? latestblock - txn.block_height : null;
    
    const transaction = {
        type: type,
        hash: txn.hash,
        block: txn.block_height,
        confirmations: confirmations,
        date: helperSvc.unixToUTC(txn.time),
        froms: fromDatas,
        tos: toDatas
    };

    return transaction;
}

const getBtcAddress = function(script) {    
    // const value = Buffer.from(script);
    // const hash = bitcore.crypto.Hash.sha256(value);
    // const bn = bitcore.crypto.BN.fromBuffer(hash);

    // const address = new bitcore.PrivateKey(bn).toAddress();

    // const toEncode = bech32.toWords(script);
    // const address = bech32.encode('bc', toEncode);

    // const data = new Uint8Array(script.substr(4));
    // const address = bech32.encode('bc', data);

    // let binary = stringToBinary(script);
    // if(script.substr(0,4) === '0014'){
    //     script = script.substr(4);
    // }
    // binary = `00000${binary}`;
    // console.log('script', script);
    // console.log('binary', binary);
    // const binaryArray = binaryToArray(binary);
    // console.log('binaryArray',binaryArray);
    // let address = "bc1";
    
    // const addressNext = binaryMapped(binary);

    // address += addressNext;

    const encoded = bech32.encode('bc', script.substr(4));
console.log(script, encoded);
const address = "";
    return address;
}

const stringToBinary = function(input){
    var characters = input.split('');
  
    return characters.map(function(char) {
      const binary = char.charCodeAt(0).toString(2)
      const pad = Math.max(8 - binary.length, 0);
      // Just to make sure it is 8 bits long.
      return '0'.repeat(pad) + binary;
    }).join('');
}

const binaryToArray = function(binary) {
    let array = [];
    while(binary.length > 0) {
        let bin = binary.substr(0,5).toString();
        array.push(bin);
        binary = binary.substr(5);
    }

    return array;
}

const binaryMapped = function(binary) {
    let letters = "";
    while(binary.length > 0) {
        let bin = binary.substr(0,5);
        //console.log(`bin ${bin}`)
        // console.log('binaryMap',binaryMap);
        const map = binaryMap.filter(b => b.b.toString() === bin);
        // console.log('map',map);
        if(map.length > 0){
        letters += map[0].c;
        binary = binary.substr(5);
        } else {
            binary = "";
        }
    }

    return letters;
}

const binaryMap = [
    {id: 0, b: '00000', c: 'q'},
    {id: 1, b: '00001', c: 'p'},
    {id: 2, b: '00010', c: 'z'},
    {id: 3, b: '00011', c: 'r'},
    {id: 4, b: '00100', c: 'y'},
    {id: 5, b: '00101', c: '9'},
    {id: 6, b: '00110', c: 'x'},
    {id: 7, b: '00111', c: '8'},
    {id: 8, b: '01000', c: 'g'},
    {id: 9, b: '01001', c: 'f'},
    {id: 10, b: '01010', c: '2'},
    {id: 11, b: '01011', c: 't'},
    {id: 12, b: '01100', c: 'v'},
    {id: 13, b: '01101', c: 'd'},
    {id: 14, b: '01110', c: 'w'},
    {id: 15, b: '01111', c: '0'},
    {id: 16, b: '10000', c: 's'},
    {id: 17, b: '10001', c: '3'},
    {id: 18, b: '10010', c: 'j'},
    {id: 19, b: '10011', c: 'n'},
    {id: 20, b: '10100', c: '5'},
    {id: 21, b: '10101', c: '4'},
    {id: 22, b: '10110', c: 'k'},
    {id: 23, b: '10111', c: 'h'},
    {id: 24, b: '11000', c: 'c'},
    {id: 25, b: '11001', c: 'e'},
    {id: 26, b: '11010', c: '6'},
    {id: 27, b: '11011', c: 'm'},
    {id: 28, b: '11100', c: 'u'},
    {id: 29, b: '11101', c: 'a'},
    {id: 30, b: '11110', c: '7'},
    {id: 31, b: '11111', c: 'l'}
]


module.exports = {
    getEmptyBlockchain,
    getBlockchain,
    getAddress,
    getTransactions,
    getTransaction
}