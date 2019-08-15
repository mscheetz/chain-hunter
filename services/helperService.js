const fs = require('fs');
const enums = require('../classes/enums');

/**
 * conver unix time to utc time
 * 
 * @param timestamp Unix timestamp
 */
const unixToUTC = function(timestamp) {
    let dateTime = new Date(timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = dateTime.getFullYear();
    let month = months[dateTime.getMonth()];
    let hour = dateTime.getHours() == 0 ? "00" : dateTime.getHours();
    let min = dateTime.getMinutes() == 0 ? "00" : dateTime.getMinutes();
    let sec = dateTime.getSeconds() == 0 ? "00" : dateTime.getSeconds();
    let time = dateTime + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
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
 * Type of search to perform
 * @param {*} chain chain to search
 * @param {*} toFind search string
 */
const searchType = function(chain, toFind) {
    if((chain === "aion" || chain === "eth") && toFind.substr(0, 2) !== "0x") {
        return enums.searchType.nothing;
    }
    if(toFind.substr(0, 2) === "0x") {
        if(chain === "eth") {
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
            return enums.searchType.contract;
        } else {
            return enums.searchType.nothing;
        }
    }
    if(toFind.substr(0,7) === "bitcoincash") {
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
                && (27 <= toFind.length <= 34)) {
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
    if(chain === "btc" || chain === "bch" || chain === "usdt"){
        if((toFind.substr(0, 1) === "1" || toFind.substr(0, 1) === "3" || toFind.substr(0, 3) === "bc1")
                    && (27 <= toFind.length <= 34)) {
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
        if(toFind.substr(0, 6) === "cosmos") {
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
    if(chain === "bnb") {
        if(toFind.substr(0, 3) === "bnb") {
            return enums.searchType.address;
        } else {
            return enums.searchType.transaction;
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
            if(chain === "neo") {
                if(toFind.substr(0, 2) === "0x") {
                    return enums.searchType.contract;
                } else {
                    return enums.searchType.transaction;
                }
            } else {
                return enums.searchType.transaction | enums.searchType.contract;
            }
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

    return enums.searchType.address | enums.searchType.transaction | enums.searchType.contract;
}

module.exports = {
    commaBigNumber,
    bigNumberToDecimal,
    exponentialToNumber,
    getPrecision,
    unixToUTC,
    decimalCleanup,
    iconExists,
    searchType
}

