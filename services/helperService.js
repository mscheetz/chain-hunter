const fs = require('fs');

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
getPrecision = function(decimals) {
    return Math.pow(10, decimals);
}

/**
 * Check if an image exists
 * 
 * @param iconName name of icon
*/
iconExists = function(iconName) {
    const path = './dist/chain-hunter/assets/cryptoicons/' + iconName;

    try {
        return fs.existsSync(path);
    } catch(err) {
        return false;
    }
}

validChains = function(toCheck) {
    let chains = [];

    if(toCheck.substr(0, 2) === "0x") {
        chains.push("aion");
        chains.push("eth");
    } else if((toCheck.substr(0, 1) === "1" || toCheck.substr(0, 1) === "3" || toCheck.substr(0, 3) === "bc1")
                && (27 <= toCheck.length <= 34)) {
        chains.push("btc");
        chains.push("bch");
    } else if(toCheck.substr(0,7) === "bitcoin") {
        chains.push("btc");
    } else if(toCheck.substr(0,11) === "bitcoincash" 
                || toCheck.length === 42) {
        chains.push("bch");
    } else if(toCheck.substr(0, 6) === "cosmos") {
        chains.push("atom");
    } else if(toCheck.substr(0, 3) === "ak_") {
        chains.push("ae");
    } else if(toCheck.length === 12) {
        chains.push("eos");
    } else if(toCheck.substr(0, 4) === "xrb_" || toCheck.substr(0, 5) === "nano_") {
        chains.push("nano");
    } else if(toCheck.substr(0, 3) === "bnb") {
        chains.push("bnb");
}

module.exports = {
    commaBigNumber,
    bigNumberToDecimal,
    exponentialToNumber,
    getPrecision,
    unixToUTC,
    iconExists
}

