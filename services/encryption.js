const CryptoTS = require('crypto-ts');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const config = require('../config');
const helperSvc = require('./helperService');

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
	try {
		const match = await bcrypt.compare(plaintext, hash);
		return match;
	} catch(err) {
		console.log(err);
		return false;
	}
}

/**
 * Get a UUID
 */
const getUuid = function() {
	return uuidv4();
}

const validUuid = async(uuid) => {
	const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

	return uuidV4Regex.test(uuid);
}

/**
 * Get a JWT
 * 
 * @param {object} userId user id
 */
const getToken = async(userId) => {
	let token = jwt.sign({userId},
		config.CHAINHUNTER_TOKEN,
		{ expiresIn: '3d'}
	);

	return token
}

/**
 * Is the token valid
 * 
 * @param {string} token jwt token
 */
const isTokenValid = async(token) =>{
	const payload = await getTokenPayload(token);

	if(!payload) {
		return payload;
	}
	let unixNow = helperSvc.getUnixTsSeconds();
	
	if(payload.exp < unixNow) {
		return false;
	}
	return true;
}

/**
 * Get payload from a token
 * 
 * @param {string} token jwt token
 */
const getTokenPayload = async(token) => {
	let payload;
	try {
		payload = jwt.verify(token, config.CHAINHUNTER_TOKEN);
	} catch(err) {
		return false;
	}

	return payload;
}

/**
 * get user id from a jwt
 * 
 * @param {string} token jwt token
 */
const getUserIdFromToken = async(token) => {
	let userId = null;
	const payload = await getTokenPayload(token);
	if(!payload) {
		return userId;
	}

	return payload.userId;
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
	validUuid,
	getToken,
	getUserIdFromToken,
	getTokenPayload,
	isTokenValid,
	validateToken
}