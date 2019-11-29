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
 * get all symbol counts
 */
const getAll = async() => {
    let sql = 'SELECT * FROM public.symbolCount';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * add a symbol count
 * @param {object} symbolCount symbol count object
 */
const add = async(symbolCount) => {
    let sql = 'INSERT INTO public.symbolCount ( symbol, count ) ';
    sql += 'VALUES ( $1, $2 ) ';
    const data = [
        symbolCount.symbol, 
        symbolCount.count
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getAll,
    add
}