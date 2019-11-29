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
 * Add a password reset request
 * @param {string} userId user id
 * @param {string} token token
 * @param {number} TS time stamp
 */
const add = async(userId, token, TS) => {
    let sql = 'INSERT INTO public."passwordReset" ( "userId", token, "goodTil" ) ';
    sql += 'VALUES ( $1, $2, $3 )';
    const data = [
        userId, 
        token, 
        TS
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get password reset request by user id
 * @param {string} userId user id
 */
const getByUserId = async(userId) => {
    let sql = 'SELECT * FROM public."passwordReset" where "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * get password reset request by token
 * @param {string} token token
 */
const getByToken = async(token) => {
    let sql = 'SELECT * FROM public."passwordReset" where token = $1';

    try {
        const res = await pool.query(sql, [token]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Remvoe password reset requests by user id
 * @param {string} userId user id
 */
const remove = async(userId) => {
    let sql = 'DELETE FROM public."passwordReset" where "userId" = $1';

    try {
        const res = await pool.query(sql, [ userId ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    add,
    getByToken,
    getByUserId,
    remove
}