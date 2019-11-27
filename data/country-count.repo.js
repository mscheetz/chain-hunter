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
 * Get all country counts
 * @param {string} country name
 */
const get = async(country) => {
    let sql = `SELECT * FROM public."countryCount" WHERE country = $1`;

    try {
        const res = await pool.query(sql, [country]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all country counts
 */
const getAll = async() => {
    let sql = 'SELECT * FROM public."countryCount"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add a country count
 * @param {object} countryCount country count object
 */
const add = async(countryCount) => {
    let sql = 'INSERT INTO public."countryCount" ( country, symbol, count ) ';
    sql += 'VALUES ( $1, $2, $3 ) ';
    const data = [
        countryCount.country, 
        countryCount.symbol, 
        countryCount.count
    ];

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
    add
}