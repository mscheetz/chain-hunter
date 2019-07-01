const CryptoTS = require('crypto-ts');

const decryptHeader = function(message, token) {
	let bytes = CryptoTS.AES.decrypt(message, token);
	let timestamp = bytes.toString(CryptoTS.enc.Utf8).substr(0, 13);

	return parseInt(timestamp);
}

module.exports = {
	decryptHeader
}