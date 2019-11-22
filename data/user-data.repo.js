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
 * Add user data
 * @param {object} userData user data object
 */
const add = async(userData) => {
    let sql = 'INSERT INTO public."userData" ( id, "userId", hash, symbol, type, added ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6 )';
    const data = [
        userData.id,
        userData.userId, 
        userData.hash, 
        userData.symbol, 
        userData.type, 
        userData.added
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all saved data for a user
 * @param {string} userId user id
 */
const get = async(userId) => {
    let sql = 'SELECT * FROM public."userData" where "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Remove a saved user data
 * @param {string} id user data id
 */
const remove = async(id) => {
    let sql = 'DELETE FROM public."userData" where id = $1';

    try {
        const res = await pool.query(sql, [ id ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update the state of saved user data
 * @param {string} id user data id
 * @param {boolean} activeState active state
 */
const updateState = async(id, activeState) => {
    let sql = 'UPDATE public."userData" set active = $2 where id = $1';
    const data = [
        id,
        activeState
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
    add,
    remove,
    updateState
}