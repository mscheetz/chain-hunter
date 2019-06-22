const axios = require('axios');
const helperSvc = require('./helperService.js');
const base = "https://apilist.tronscan.org/api";

const getEmptyBlockchain = async() => {
    const chain = {};
    chain.name = 'Tron';
    chain.symbol = 'TRX';
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
    if(address === null) {
        const transaction = await getTransaction(toFind);
        chain.transaction = transaction;
        if(transaction === null) {
            const contract = await getContract(toFind);
            chain.contract = contract;
        }
    }
    if(chain.address || chain.transaction) {
        chain.icon = "color/"+ chain.symbol.toLowerCase()  +".svg";
    }

    return chain;
}

const getAddress = async(addressToFind) => {
    let endpoint = "/account?address=" + addressToFind;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.address) {
            const datas = response.address;
            const address = {
                address: datas.address,
                quantity: datas.balance/100000000
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
    let endpoint = "/contract?contract=" + address;
    let url = this.base + endpoint;

    try{
        const response = await axios.get(url);
        if(response && response.data.address !== "") {
            const datas = response.address;
            const contract = {
                address: datas.address,
                quantity: datas.balance/100000000
            };
            return contract;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getAddressTokens = async(address) => {
    let endpoint = "/account?address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.address) {
            const datas = response.address;
            let tokens = [];
            tokens["10"] = datas.tokenBalances;
            tokens["20"] = datas.trc20token_balances;
            
            return tokens;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTransactions = async(address) => {
    let endpoint = "/transaction?sort=-timestamp&count=true&limit=10&start=0&address=" + address;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        let transactions = [];
        if(response.length > 0) {
            response.forEach(data => {
                transactions.push(buildTransaction(data));
            })
        }

        return transactions;
    } catch(error) {
        return [];
    }
}

const getTransaction = async(hash) => {
    let endpoint = "/transaction-info?hash=" + hash;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.hash) {
            const transaction = buildTransaction(response);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }
}

const getTokens = async(address) => {
    const addyTokens = await getAddressTokens(address);
    let tokens = [];
    addyTokens["20"].forEach(token => {
        const asset = createAsset(token);
        if(asset !== null) {
            tokens.push(asset);
        }
    });
    let trx10Complete = false;
    let trx10s = [];
    let page = 1;
    while(!trx10Complete) {
        const limit = 200;
        let trx10s = await getTrx10Tokens(limit, page);
        trx10s.data.forEach(token => {
            trx10s[token.tokenID.toString()] = token.abbr;
        })

        if((page * limit) >= trx10s.totalAll) {
            trx10Complete = true;  
        } else {
            page++;
        }
    }
    addyTokens["10"].forEach(token => {
        const asset = createAsset(token, trx10s);
        tokens.push(asset);
    });

    return tokens;
}

const createAsset = async(token, trx10s = []) => {
    let asset = null;
    if((typeof token.symbol !== 'undefined') && token.symbol !== null && token.symbol !== "" && token.name !== "_"){
        let symbol = token.symbol;
        if(trx10s.length > 0) {
            symbol = trx10s[token.name];
        }
        if(typeof symbol !== 'undefined') {
            asset = {
                symbol: symbol,
                quantity: token.balance.toString()
            };
        }
    }
    return asset;
}

const getTrx10Tokens = async(limit, page) => {
    let start = page == 1 ? 0 : ((page - 1) * limit) + 1;
    let endpoint = "/token?sort=-name&limit="+ limit +"&start="+ start;
    let url = base + endpoint;

    try{
        const response = await axios.get(url);
        if(response.hash) {
            const transaction = buildTransaction(response);

            return transaction;
        } else {
            return null;
        }
    } catch(error) {
        return null;
    }

}

const buildTransaction = function(txn) {
    const transaction = {
        hash: txn.hash,
        block: txn.block,
        quantity: txn.contractData.amount,
        confirmations: -1,
        date: helperSvc.unixToUTC(txn.timestamp),
        from: txn.ownerAddress,
        to: txn.toAddress
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