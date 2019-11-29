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
 * Get all Payment types
 */
const getAll = async() => {
    let sql = `SELECT id, name FROM public."paymentType"`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get payment type by id
 * @param {string} id payment type id
 */
const get = async(id) => {
    let sql = `SELECT id, name FROM public."paymentType" WHERE id = $1`;

    try {
        const res = await pool.query(sql, [id]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    get,
    getAll
}