const CryptoTS = require('crypto-ts');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const config = require('../config');

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

	return await bcrypt.hash(plaintext, saltRounds);
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

/**
 * Get a JWT
 * 
 * @param {object} user user object
 */
const getToken = async(user) => {
	let token = jwt.sign({
		email: user.email,
		id: user.id
	},
		config.CHAINHUNTER_TOKEN,
		{ expiresIn: '3d'}
	);

	return token
}

/**
 * Validate a JWT
 * 
 * @param {Request} req http request
 * @param {Response} res http response
 * @param {next} next next
 */
const validateToken = async(req, res, next) => {
	let token = req.headers['x-access-token'];
	if(token && token.startsWith("Bearer ")) {
		token = token.slice(7, token.length);
		jwt.verify(token, config.CHAINHUNTER_TOKEN, (err, decoded) => {
			if(err) {
				let message = "Invalid token";

				res.status(401).json(message);
			} else {
				next();
			}
		});
	} else {
		let message = "Token missing";
		
		res.status(400).json(message);
	}
}

module.exports = {
	decryptHeader,
	hashPassword,
	checkPassword,
	getUuid,
	getToken,
	validateToken
}