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
 * Get all blockchains
 */
const getAll = async() => {
    let sql = 'SELECT * FROM public.blockchain';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get blockchain by symbol
 * @param {string} symbol symbol
 */
const get = async(symbol) => {
    let sql = 'SELECT * FROM public.blockchain WHERE symbol = $1';

    try {
        const res = await pool.query(sql, [ symbol.toUpperCase() ]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get active blockchains
 */
const getActive = async() => {
    let sql = 'SELECT * FROM public.blockchain WHERE status = 1';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get Future blockchains
 */
const getFuture = async() => {
    let sql = 'SELECT * FROM public.blockchain WHERE status = 0';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update a blockchain
 * @param {object} chain blockchain object
 */
const update = async(chain) => {
    let sql = 'UPDATE public.blockchain SET name = $2, symbol = $3, status = $4, "hasTokens" = $5, "hasContracts" = $6, type = $7 ';
    sql += 'WHERE id = $1';
    const data = [
        chain.id, 
        chain.name, 
        chain.symbol, 
        chain.status, 
        chain.hasTokens, 
        chain.hasContracts, 
        chain.type
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add a blockchain
 * @param {object} chain blockchain object
 */
const add = async(chain) => {
    let sql = 'INSERT INTO public.blockchain ( name, symbol, status, "hasTokens", "hasContracts", id, type ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7 )';
    const data = [
        chain.name, 
        chain.symbol, 
        chain.status, 
        chain.hasTokens, 
        chain.hasContracts, 
        chain.id, 
        chain.type
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
    getActive,
    getAll,
    getFuture,
    update,
    add
}