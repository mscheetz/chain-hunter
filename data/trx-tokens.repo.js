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
 * Get all trx tokens
 */
const getAll = async() => {
    let sql = 'SELECT * FROM public."trxTokens"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add many trx tokens
 * @param {collection} tokens collection of tokens
 */
const addMany = async(tokens) => {
    let response = false;
    for(let i = 0; i < tokens.length; i++) {
        response = await postTrxToken(tokens[i]);
    }

    return response;
}

/**
 * Add a trx token
 * @param {object} token trx token object
 */
const add = async(token) => {
    let sql = 'INSERT INTO public."trxTokens" ( id, name, symbol, "precision" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 )';
    const data = [ 
        token.id, 
        token.name, 
        token.symbol, 
        token.precision
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
    addMany,
    add
}
