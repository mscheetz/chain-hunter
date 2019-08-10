const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    user: config.PGUSER,
    host: config.PGHOST,
    database: config.PGDATABASE,
    password: config.PGPASSWORD,
    port: config.PGPORT,
    ssl: true
});

const getAssets = async() => {
    let sql = 'SELECT * FROM assets';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const postAsset = async(asset) => {
    let sql = 'INSERT INTO assets ( "assetName", symbol, status, "hasTokens", "hasContracts", "assetId" ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6 )';

    try {
        const res = await pool.query(sql, [asset.assetName, asset.symbol, asset.status, asset.hasTokens, asset.hasContracts, asset.assetId]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getCountryCounts = async() => {
    let sql = 'SELECT * FROM countryCount';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const postCountryCount = async(countryCount) => {
    let sql = 'INSERT INTO countryCount ( country, symbol, count ) ';
    sql += 'VALUES ( $1, $2, $3 )';

    try {
        const res = await pool.query(sql, [countryCount.country, countryCount.symbol, countryCount.count]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getDiscountCodes = async() => {
    let sql = 'SELECT * FROM discountCode';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getDiscountCodeById = async(id) => {
    let sql = 'SELECT * FROM discountCode WHERE code = $1';

    try {
        const res = await pool.query(sql, [id]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const postDiscountCode = async(discount) => {
    let sql = 'INSERT INTO discountCode ( code, "percentOff", "validTil", "usedOn" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 )';

    try {
        const res = await pool.query(sql, [discount.code, discount.percentOff, discount.validTil, discount.usedOn]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const updateDiscountCode = async(discount) => {
    let sql = 'UPDATE discountCode set "usedOn" = $1 ';
    sql += 'WHERE code = $2';

    try {
        const res = await pool.query(sql, [discount.usedOn, discount.code]);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getSymbolCounts = async() => {
    let sql = 'SELECT * FROM symbolCount';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const postSymbolCount = async(symbolCount) => {
    let sql = 'INSERT INTO symbolCount ( symbol, count ) ';
    sql += 'VALUES ( $1, $2 ) ';

    try {
        const res = await pool.query(sql, [symbolCount.symbol, symbolCount.count]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getUsers = async() => {
    let sql = 'SELECT * from users';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getUserByEmail = async(email) => {
    let sql = 'SELECT * FROM users WHERE email = $1';

    try {
        const res = await pool.query(sql, [email]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const getUserByUserId = async(userId) => {
    let sql = 'SELECT * FROM users WHERE "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

const postUser = async(user) => {
    let sql = 'INSERT INTO users ( email, created, "userId", "accountType" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 )';

    try {
        const res = await pool.query(sql, [user.email, user.created, user.userId, user.accountType]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log("Error executing the query: '" + sql +"'");
    }
}

module.exports = {
    getAssets,
    postAsset,
    getCountryCounts,
    postCountryCount,
    getDiscountCodes,
    getDiscountCodeById,
    postDiscountCode,
    updateDiscountCode,
    getSymbolCounts,
    postSymbolCount,
    getUserByEmail,
    getUserByUserId,
    getUsers,
    postUser
}