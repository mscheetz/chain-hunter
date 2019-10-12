const CryptoTS = require('crypto-ts');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

const decryptHeader = function(message, token) {
	let bytes = CryptoTS.AES.decrypt(message, token);
	let timestamp = bytes.toString(CryptoTS.enc.Utf8).substr(0, 13);

	return parseInt(timestamp);
}

/**
 * Hash a password
 * 
 * @param {string} plaintext password to hash
 */
const hashPassword = async(plaintext) => {
	const saltRounds = 10;
	let newHash = "";

	await bcrypt.hash(plaintext, saltRounds)
		.subscribe(hash => {
			return hash;
		}, err => {
			return null;
		});
}

/**
 * Compare a password to hash value
 * 
 * @param {string} plaintext 	plaintext to compare
 * @param {string} hash 	hash of password
 */
const checkPassword = async(plaintext, hash) => {
	const match = await bcrypt.compare(plaintext, hash);

	return match;
}

/**
 * Get a UUID
 */
const getUuid = function() {
	return uuidv4();
}

module.exports = {
	decryptHeader,
	hashPassword,
	checkPassword,
	getUuid
}