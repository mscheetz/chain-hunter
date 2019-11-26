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

/**
 * Get email subscription for an address
 * @param {string} address email address
 */
const get = async(address) => {
    let sql = 'SELECT "emailAddress", "createdAt" FROM public."emailSubscription" WHERE "emailAddress" = $1';

    try {
        const res = await pool.query(sql, [address]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all email subscriptions
 */
const getAll = async() => {
    let sql = 'SELECT "emailAddress", "createdAt" FROM public."emailSubscription" ORDER BY "emailAddress"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add an email subscription
 * @param {string} emailAdress email address
 * @param {number} createdAt search limit
 */
const add = async(emailAdress, createdAt) => {
    let sql = 'INSERT INTO public."emailSubscription" ( "emailAddress", "createdAt" ) ';
    sql += 'VALUES ( $1, $2 )';
    const data = [
        emailAdress,
        createdAt
    ]

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Remove an email subscription
 * @param {string} emailAdress email address
 */
const remove = async(emailAdress) => {
    let sql = 'DELETE FROM public."emailSubscription" WHERE "emailAddress" = $1';
    const data = [
        emailAdress
    ]

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    get,
    getAll,
    add,
    remove
}