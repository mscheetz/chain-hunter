const fs = require('fs');
const enums = require('../classes/enums');
const _ = require('lodash');

/**
 * Convert unix timestamp to a date
 * @param {number} ts timestamp
 */
const getDatefromTs = function(ts) {
    const months = ['Jan', 'Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = new Date(ts*1000);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();

    return `${day} ${month}, ${year}`;
}

/**
 * Get current unix timestamp, in milliseconds
 */
const getUnixTS = function() {
    return Date.now();
}

/**
 * Get current unix timestamp, in seconds
 */
const getUnixTsSeconds = function() {
    const ts = Date.now();

    return parseInt(ts / 1000);
}

/**
 * Get future unix timestamp
 * 
 * @param {number} d days
 * @param {number} h hours
 * @param {number} m minutes
 * @param {number} s seconds
 * @param {boolean} ms use milliseconds
 */
const getUnixTsPlus = function({d = 0, h = 0, m = 0, s = 0, ms = false} = {}) {
    const ts = getUnixTsSeconds();

    let seconds = s;
    if(m > 0) {
        let minSeconds = m*60;
        seconds += minSeconds;
    }
    if(h > 0) {
        let hrSeconds = h*60*60;
        seconds += hrSeconds;
    }
    if(d > 0) {
        let dSeconds = d*24*60*60;
        seconds += dSeconds;
    }
    if(ms === true) {
        seconds = seconds*1000;
    }
    return ts + seconds;
}

/**
 * validate an email address
 * 
 * @param email email to validate
 */
const validateEmail = function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Validate if a variable is a string
 * @param {*} toValidate variable to validate
 */
const validateString = function(toValidate) {
    if(typeof toValidate === 'string' || toValidate instanceof String) {
        return true;
    } else {
        return false;
    }
}

/**
 * Upper Case the 1st letter of a string
 * @param {string} string string to modify
 */
const firstCharUpperCase = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Rounding for currency
 * @param {number} value value to round
 */
const currencyRound = function(value) {
    return Math.round(value * 1e2) / 1e2;
}

/**
 * Get month by number
 * @param {number} number month number
 */
const getMonth = function(number) {
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return months[+number - 1];
}

/**
 * convert unix time to utc time
 * 
 * @param timestamp Unix timestamp
 */
const unixToUTC = function(timestamp) {
    let dateTime = new Date(timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let day = dateTime.getDate();
    let year = dateTime.getFullYear();
    let month = months[dateTime.getMonth()];
    let hour = dateTime.getHours() == 0 ? "00" : dateTime.getHours();
    let min = dateTime.getMinutes() == 0 ? "00" : dateTime.getMinutes();
    let sec = dateTime.getSeconds() == 0 ? "00" : dateTime.getSeconds();
    if(hour < 10) {
        hour = `0${hour}`;
    }
    if(min < 10) {
        min = `0${min}`;
    }
    if(sec < 10) {
        sec = `0${sec}`;
    }
    let time = day + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
    
    return time;
}

/**
 * Add time to a date
 * 
 * @param {number} d 
 * @param {number} h 
 * @param {number} m 
 * @param {number} s 
 */
const getTimePlus = function(d = 0, h = 0, m = 0, s = 0) {
    let date = new Date();
    if(d !== 0) {
        date = date.addDays(d);
    }
    if(h !== 0) {
        date = date.addHours(h);
    }
    if(m !== 0) {
        date = date.addMinutes(m);
    }
    if(s !== 0) {
        date = date.addSeconds(s);
    }

    return date;
}
Date.prototype.addDays = function(d) {
    this.setTime(this.getTime() + (d*24*60*60*1000));
    return this;
}
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}
Date.prototype.addMinutes = function(m) {
    this.setTime(this.getTime() + (m*60*1000));
    return this;
}
Date.prototype.addSeconds = function(s) {
    this.setTime(this.getTime() + (s*1000));
    return this;
}

/**
 * Generate a random password
 */
const generatePassword = function() {
    var length = 16,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*~<>?-_=+",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

/**
 * Get a big number with N 0s
 * @param {*} zeros Number of zeros
 */
const getBigNumber = function(zeros) {
    return Math.pow(10,parseInt(zeros));
}

/**
 * Convert an exponential value to a number
 * 
 * @param x value to convert
 */
const exponentialToNumber = function(x) {
    if (Math.abs(x) < 1.0) {
        let e = parseInt(x.toString().toLowerCase().split('e-')[1]);
        if (e) {
            x *= Math.pow(10,e-1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        let e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10,e);
            x += (new Array(e+1)).join('0');
        }
    }
    return x;
}

/**
 * String of big number to decimals
 * 
 * @param {*} value value to convert to decimal
 * @param {*} decimals places to place behind decimal
 */
const bigNumberToDecimal = function(value, decimals) {
    const deci = ".";
    let result = "";
    if(value.length > decimals) {
        const sub = value.length - decimals;
        result = value.substr(0, sub);
        result += deci + value.substr(sub);
    } else {
        const sub = decimals - value.length;
        result = "0" + deci;
        for(let i = 0; i < sub; i++) {
            result += "0";
        }
        result += value;
    }
    return result;
}

/**
 * Remove trailing 0s at end of a decimal
 * 
 * @param {*} value value to scrub
 */
const decimalCleanup = function(value) {
    let val = value.toString();
    if(val.indexOf(".") > -1) {
        var chars = val.split('');
        var startPosition = chars.length - 1;
        for(var i = startPosition; i >= 0; i--) {
            if(chars[i] === "0") {
                chars.splice(i, 1);
            } else if(chars[i] === "."){
                chars.splice(i, 1);
                break;
            } else {
                break;
            }
        }
        val = chars.join('');
        if(val === "0.") {
            val = "0";
        }
    }

    return val;
}

/**
 * Comma up a big number
 * 
 * @param value value to comma up
 */
const commaBigNumber = function(value) {
    let decimals = value.indexOf(".") >= 0 ? value.substr(value.indexOf(".")) : "";
    value = value.substr(0, value.length - decimals.length);
    let updatedValue = "";
    let charArray = Array.from(value);
    let pos = 0;

    for(let i = charArray.length - 1; i >= 0; i--) {
        pos++;
        updatedValue = charArray[i] + updatedValue;
        if(pos % 3 === 0) {
        updatedValue = "," + updatedValue;
        }
    }

    if(updatedValue.substr(0,1) === ",") {
        updatedValue = updatedValue.substr(1);
    }

    return updatedValue + decimals;
}

/**
 * Get precision
 * 
 * @param decimals decimal places
 */
const getPrecision = function(decimals) {
    return Math.pow(10, decimals);
}

/**
 * Check if an image exists
 * 
 * @param iconName name of icon
*/
const iconExists = function(iconName) {
    const path = './dist/chain-hunter/assets/cryptoicons/' + iconName;

    try {
        return fs.existsSync(path);
    } catch(err) {
        return false;
    }
}

/**
 * Get IO from a simple chain
 * @param {*} symbol symbol of chain
 * @param {*} address address of io
 * @param {*} quantity quantity of io
 */
const getSimpleIO = function(symbol, address, quantity) {
    let addresses = [];
    addresses.push(address);
    let icon = "";

    const data = {
        addresses: addresses,
        quantity: quantity,
        symbol: symbol,
        icon: icon
    }

    return data;
}

/**
 * Get IO from a simple chain with address array
 * @param {*} symbol symbol of chain
 * @param {*} addresses address of io
 * @param {*} quantity quantity of io
 */
const getSimpleIOAddresses = function(symbol, addresses, quantity) {
    let icon = "";

    const data = {
        addresses: addresses,
        quantity: quantity,
        symbol: symbol,
        icon: icon
    }

    return data;
}

/**
 * Get IO from a detailed chain
 * @param {string} symbol symbol of chain
 * @param {any} io in/out to parse
 * @param {boolean} isInput is input or output
 * @param {number} divisor number to divide quantity by
 */
const getIO = function(symbol, io, isInput = true, divisor = 100000000) {
    let quantity = 0;
    let addresses = [];
    let icon = "";
    if(isInput) {
        quantity = io.prev_out.value;
        addresses.push(io.prev_out.addr);
    } else {
        quantity = io.value;
        addresses.push(io.addr);
    }
    const newQuantity = quantity/divisor;

    const data = {
        addresses: addresses,
        quantity: newQuantity,
        symbol: symbol,
        icon: icon
    }

    return data;
}

/**
 * Clean up IOs
 * @param {any[]} ios array of ios
 */
const cleanIO = function(ios) {
    let addyMap = [];
    ios.forEach(io => {
        let data = null;
        if(typeof io.quantity !== 'undefined') {
            data = {
                symbol: io.symbol,
                quantity: io.quantity
            }
            if(typeof io.icon !== 'undefined') {
                data.icon = io.icon;
            }            
        }
        for(let i = 0; i < io.addresses.length; i++) {
            let thisAddress = io.addresses[i];
            
            let datas = [];
            if(!(thisAddress in addyMap)) {
                addyMap[thisAddress] = datas;
            }
            datas = addyMap[thisAddress];
            if(data !== null) {
                datas.push(data);
            }
            addyMap[thisAddress] = datas;
        }
    })
    let ioDatas = [];
    
    Object.keys(addyMap).forEach(function(address){
        if(addyMap[address].length === 0) {
            let addys = [];
            addys.push(address);
            let data = {
                addresses: addys
            };
            ioDatas.push(data);
        } else {
            let symbols = addyMap[address].map(a => a.symbol);
            symbols = _.uniq(symbols);
            
            for(let i = 0; i < symbols.length; i++) {
                let quants = addyMap[address].filter(a => a.symbol === symbols[i]);
                let quantity = 0;
                let icon = "";
                let iconExists = false;
                for(let j = 0; j < quants.length; j++) {
                    if(typeof quants[j].icon !== 'undefined') {
                        icon = quants[j].icon;
                        iconExists = true;
                    }
                    let thisQuantity = 0;
                    if(_.isString(quants[j].quantity)) {
                        const thisQuant = quants[j].quantity.indexOf(',') >= 0 
                            ? quants[j].quantity.replace(/,/g, "") 
                            : quants[j].quantity;
                        //thisQuantity = parseFloat(thisQuant);
                        thisQuantity = thisQuant;// (typeof thisQuant === 'string') ? +thisQuant : thisQuant;
                        
                        if(thisQuantity.toString().indexOf('e') >= 0) {
                            thisQuantity = exponentialToNumber(thisQuantity);
                        }
                    } else {
                        thisQuantity = quants[j].quantity;
                    }
                    
                    if(quantity === 0) {
                        quantity = thisQuantity;
                    } else {
                        quantity = +quantity + +thisQuantity;
                    }
                    //quantity += +thisQuantity;
                }
                const cleaned = decimalCleanup(quantity);
                const totalQuantity = commaBigNumber(cleaned);
                let addys = [];
                addys.push(address);
                let data = {
                    addresses: addys,
                    symbol: symbols[i],
                    quantity: totalQuantity
                };
                if(iconExists) {
                    data.icon = icon;
                }
                ioDatas.push(data);
            }
        }
    });

    return ioDatas;
}

/**
 * Clean up IOs with types
 * @param {any[]} ios array of ios
 */
const cleanIOTypes = function(ios) {
    let addyMap = [];
    ios.forEach(io => {
        let data = null;
        if(typeof io.quantity !== 'undefined') {
            data = {
                symbol: io.symbol,
                quantity: io.quantity
            }
            if(typeof io.icon !== 'undefined') {
                data.icon = io.icon;
            }
            if(typeof io.type !== 'undefined') {
                data.type = io.type;
            }      
        }
        for(let i = 0; i < io.addresses.length; i++) {
            let thisAddress = io.addresses[i];
            
            let datas = [];
            if(!(thisAddress in addyMap)) {
                addyMap[thisAddress] = datas;
            }
            datas = addyMap[thisAddress];
            if(data !== null) {
                datas.push(data);
            }
            addyMap[thisAddress] = datas;
        }
    })
    let ioDatas = [];
    
    Object.keys(addyMap).forEach(function(address){
        if(addyMap[address].length === 0) {
            let addys = [];
            addys.push(address);
            let data = {
                addresses: addys
            };
            ioDatas.push(data);
        } else {
            let symbols = addyMap[address].map(a => a.symbol);
            let types = addyMap[address].map(a => a.type);
            symbols = _.uniq(symbols);
            types = _.uniq(types);
            
            for(let i = 0; i < symbols.length; i++) {
                for(let j = 0; j < types.length; j++) {
                    let quants = addyMap[address].filter(a => a.symbol === symbols[i] && a.type === types[j]);
                    let quantity = 0;
                    let icon = "";
                    let iconExists = false;
                    for(let j = 0; j < quants.length; j++) {
                        if(typeof quants[j].icon !== 'undefined') {
                            icon = quants[j].icon;
                            iconExists = true;
                        }
                        let thisQuantity = 0;
                        if(_.isString(quants[j].quantity)) {
                            const thisQuant = quants[j].quantity.replace(/,/g, "");
                            thisQuantity = parseFloat(thisQuant);
                            if(thisQuantity.toString().indexOf('e') >= 0) {
                                thisQuantity = exponentialToNumber(thisQuantity);
                            }
                        } else {
                            thisQuantity = quants[j].quantity;
                        }
                        if(quantity === 0) {
                            quantity = thisQuantity;
                        } else {
                            quantity = +quantity + +thisQuantity;
                        }
                        //quantity += +thisQuantity;
                    }
                    const totalQuantity = commaBigNumber(quantity.toString());
                    let addys = [];
                    addys.push(address);
                    let data = {
                        addresses: addys,
                        symbol: symbols[i],
                        type: types[j],
                        quantity: totalQuantity
                    };
                    if(iconExists) {
                        data.icon = icon;
                    }
                    ioDatas.push(data);
                }
            }
        }
    });

    return ioDatas;
}

/**
 * InOut calculation for address transaction
 * 
 * @param {*} address address searching for
 * @param {*} transaction transaction data
 */
const inoutCalculation = function(address, transaction) {
    let inout = "";
    let quantity = "";
    let symbol = "";
    transaction.froms.forEach(from => {
        for(let i = 0; i < from.addresses.length; i++) {
            if(from.addresses[i] === address) {
                quantity = from.quantity;
                symbol = from.symbol;
                inout = "Sender";
                break;
            }
        }
    });
    if(inout === "") {
        inout = "Receiver";
        transaction.tos.forEach(to => {
            for(let i = 0; i < to.addresses.length; i++) {
                if(to.addresses[i] === address) {
                    quantity = to.quantity;
                    symbol = to.symbol;
                    break;
                }
            }
        });
    }
    transaction.inout = inout;
    if(inout === "Receiver") {
        transaction.ios = transaction.froms;
    } else {            
        transaction.ios = transaction.tos;
    }
    
    transaction.froms = [];
    transaction.tos = [];
    transaction.quantity = quantity;
    transaction.symbol = symbol;

    return transaction;
}

/**
 * Check if a string has letters
 * 
 * @param {string} toValidate value to validate
 */
const hasLetters = function(toValidate) {
    const letters = /[a-z]/i;
    if(toValidate.match(letters)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Type of search to perform
 * @param {*} chain chain to search
 * @param {*} toFind search string
 */
const searchType = function(chain, toFind) {
    if(!hasLetters(toFind)) {        
        return enums.searchType.block;
    }
    if((chain === "aion" || chain === "etc" || chain === "eth" || chain === "tomo" || chain === "vet") 
        && toFind.substr(0, 2) !== "0x") {
        return enums.searchType.nothing;
    }
    if(toFind.substr(0, 2) === "0x") {
        if(chain === "etc" || chain === "eth" || chain === "tomo") {
            if(toFind.length === 42) {
                return enums.searchType.address | enums.searchType.contract;
            } else {
                return enums.searchType.transaction;
            }
        } else if(chain === "aion") {
            if(toFind.length === 66) {
                return enums.searchType.address | enums.searchType.transaction | enums.searchType.contract;
            } else {
                return enums.searchType.transaction;
            }
        } else if (chain === "icx") {
            return enums.searchType.transaction;
        } else if (chain === "neo") {
            return enums.searchType.transaction | enums.searchType.contract;
        } else if (chain === "vet") {
            if(toFind.length === 42) {
                return enums.searchType.address;
            } else {
                return enums.searchType.transaction;
            }
        } else if(chain === "zil") {
            if(toFind.length === 66) {
                return enums.searchType.transaction;
            } else {
                return enums.searchType.nothing;
            }
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0,11) === "bitcoincash") {
        if(chain === "bch") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0,7) === "bitcoin") {
        if(chain === "btc") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 9) === "cosmosval") {
        if(chain === "atom") {
            return enums.searchType.contract;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 6) === "cosmos") {
        if(chain === "atom") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 3) === "ak_") {
        if(chain === "ae") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 3) === "th_" ) {
        if(chain === "ae") {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 4) === "xrb_" || toFind.substr(0, 5) === "nano_") {
        if(chain === "nano") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0, 3) === "bnb") {
        if(chain === "bnb") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if((toFind.substr(0, 1) === "1" || toFind.substr(0, 1) === "3" || toFind.substr(0, 3) === "bc1")
                && (toFind.length >= 27 && toFind.length <= 34)) {
        if(chain === "btc" || chain === "bch" || chain === "usdt" || chain == "ltc") {
            return enums.searchType.address;
        } else if(chain === "iost" || chain === "nano") {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.nothing;
        }
    }
    if((toFind.substr(0, 1) === "3" || toFind.substr(0, 1) === "L" || toFind.substr(0, 1) === "M")
        && toFind.length === 34) {
        if(chain === "ltc") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 2) === "hx" && toFind.length === 42 ) {
        if(chain === "icx") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 2) === "cx" && toFind.length === 42 ) {
        if(chain === "icx") {
            return enums.searchType.contract;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 8) === "Contract") {
        if(chain === "iost") {
            return enums.searchType.contract;
        } else {
            return enums.searchType.nothing;
        }
    }
    if((toFind.substr(0, 1) === "q" || toFind.substr(0, 1)) && toFind.length === 42){
        if(chain === "bch") {
            return enums.searchType.address;
        }
    }
    if(toFind.substr(0, 7) === "NULSd6H" && toFind.length === 37) {
        if(chain === "nuls") {
            return enums.searchType.address | enums.searchType.contract;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(chain === "btc" || chain === "bch" || chain === "usdt"){
        if((toFind.substr(0, 1) === "1" || toFind.substr(0, 1) === "3" || toFind.substr(0, 3) === "bc1")
            && (toFind.length >= 27 && toFind.length <= 34)) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "ltc") {
        if((toFind.substr(0, 1) === "3" || toFind.substr(0, 1) === "L" || toFind.substr(0, 1) === "M")
            && toFind.length === 34) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "atom") {
        if(toFind.substr(0, 9) === "cosmosval") {
            return enums.searchType.contract;
        } else if(toFind.substr(0, 6) === "cosmos") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "ae") {
        if(toFind.substr(0, 3) === "ak_") {
            return enums.searchType.address;
        } else if(toFind.substr(0, 3) === "th_" ) {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(chain === "nano") {
        if(toFind.substr(0, 4) === "xrb_" || toFind.substr(0, 5) === "nano_") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "nuls") {
        if(toFind.substr(0, 7) === "NULSd6H" && toFind.length === 37) {
            return enums.searchType.address | enums.searchType.contract;
        } else if(toFind.length === 64) {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(chain === "bnb") {
        if(toFind.substr(0, 3) === "bnb") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "dcr") {
        if(toFind.substr(0, 1) === "D") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "qtum") {
        if(toFind.length == 64) {
            return enums.searchType.transaction;
        } else if (toFind.length == 40) {
            return enums.searchType.contract;
        } else if (toFind.substr(0, 1) === "Q") {
            return enums.searchType.address;
        }
    }
    if(toFind.substr(0, 1) === "r") {
        if(chain === "xrp") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "xrp") {
        if(toFind.substr(0, 1) === "r") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 1) === "X") {
        if(chain === "dash" || chain === "xrp") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "dash" || chain === "xrp") {
        if(toFind.substr(0, 1) === "X") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "icx") {
        if(toFind.substr(0, 2) === "hx" && toFind.length === 42 ) {
            return enums.searchType.address;
        } if(toFind.substr(0, 2) === "cx" && toFind.length === 42 ) {
            return enums.searchType.contract;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 1) === "A" && toFind.length === 34 ) {
        if(chain === "neo" || chain === "ont") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "neo" || chain === "ont") {
        if(toFind.substr(0, 1) === "A" && toFind.length === 34 ) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 2) === "t1") {
        if(chain === "zel") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "zel") {
        if(toFind.substr(0, 2) === "t1") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 1) === "T") {
        if(chain === "trx") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "trx") {
        if(toFind.substr(0, 1) === "T") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 1) === "R") {
        if(chain === "rvn") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "rvn") {
        if(toFind.substr(0, 1) === "R") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "iost") {
        if(toFind.substr(0, 8) === "Contract") {
            return enums.searchType.contract;
        } else {
            return enums.searchType.address | enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 1) === "N" && toFind.length === 34 ) {
        if(chain === "nebl") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "nebl") {
        if(toFind.substr(0, 1) === "N" && toFind.length === 34 ) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 1) === "G" && toFind.length === 56) {
        if(chain === "xlm") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "xlm") {
        if(toFind.substr(0, 1) === "G" && toFind.length === 56) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if((toFind.substr(0, 2) === "KT" || toFind.substr(0, 2) === "tz" || toFind.substr(0, 3) === "dn1") && toFind.length === 36) {
        if(chain === "xtz") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(toFind.substr(0, 1) === "o" && toFind.length == 51) {
        if(chain === "xtz") {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.transaction | enums.searchType.contract;
        }
    }
    if(chain === "xtz") {
        if((toFind.substr(0, 2) === "KT" || toFind.substr(0, 2) === "tz" || toFind.substr(0, 3) === "dn1") && toFind.length === 36) {
            return enums.searchType.address;
        } else if (toFind.substr(0, 1) === "o" && toFind.length == 51) {
            return enums.searchType.transaction;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(chain === "lsk") {
        const len = toFind.length;
        if((20 <= len <= 25) && _.isNumber(toFind)) {
            return enums.searchType.transaction;
        } else if((20 <= len <= 22) && toFind.substr(len - 1) === "L") {
            return enums.searchType.address;
        }
    }
    if(chain === "zen") {
        if(toFind.length === 35) {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(toFind.substr(0, 3) === "zil") {
        if(chain === "zil") {
            return enums.searchType.address;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0,2) === "AR" && toFind.length === 35) {
        if(chain === "vsys") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
        }
    }
    if(chain === "vsys") {
        if(toFind.substr(0,2) === "AR" && toFind.length === 35) {
            return enums.searchType.address;
        } else if (toFind.length === 44) {
            return enums.searchType.transaction;
        } else if (toFind.length === 41) {
            return enums.searchType.contract;
        } else {
            return enums.searchType.none;
        }
    }

    return enums.searchType.address | enums.searchType.transaction | enums.searchType.contract;
}

/**
 * Convert a hexidecimal to a number
 * 
 * @param {string} hex hexidecimal value
 */
const hexToNumber = function(hex) {
    return parseInt(hex, 16);
}

/**
 * Convert a number to a hexidecimal
 * 
 * @param {number} toConvert number value
 */
const numberToHex = function(toConvert) {
    const numberVal = +toConvert;
    let hex = numberVal.toString(16);
        
    return `0x${hex}`;
}

module.exports = {
    validateEmail,
    validateString,
    firstCharUpperCase,
    currencyRound,
    getSimpleIO,
    getSimpleIOAddresses,
    getIO,
    cleanIO,
    cleanIOTypes,
    inoutCalculation,
    getDatefromTs,
    getMonth,
    getUnixTS,
    getUnixTsSeconds,
    getUnixTsPlus,
    commaBigNumber,
    bigNumberToDecimal,
    getBigNumber,
    exponentialToNumber,
    getPrecision,
    unixToUTC,
    decimalCleanup,
    iconExists,
    searchType,
    generatePassword,
    getTimePlus,
    hasLetters,
    hexToNumber,
    numberToHex
}
