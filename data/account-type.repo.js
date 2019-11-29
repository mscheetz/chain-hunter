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
 * Get all account types
 */
const getAll = async() => {
    let sql = 'SELECT id, uuid, name, "searchLimit", "saveLimit", monthly, yearly FROM public."accountType" WHERE monthly >= 0 ORDER BY id';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get an account type by id
 * @param {number} id account type id
 */
const get = async(id) => {
    let sql = 'SELECT id, uuid, name, "searchLimit", "saveLimit", monthly, yearly FROM public."accountType" WHERE id = $1';

    try {
        const res = await pool.query(sql, [id]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get account type by uuid
 * @param {string} uuid account type uuid
 */
const getByUuid = async(uuid) => {
    let sql = 'SELECT id, uuid, name, "searchLimit", "saveLimit", monthly, yearly FROM public."accountType" WHERE uuid = $1';

    try {
        const res = await pool.query(sql, [uuid]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get account type by name
 * @param {string} name account type name
 */
const getByName = async(name) => {
    let sql = 'SELECT id, uuid, name, "searchLimit", "saveLimit", monthly, yearly FROM public."accountType" WHERE name = $1';

    try {
        const res = await pool.query(sql, [name]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add an account type
 * @param {string} uuid account type uuid
 * @param {string} name account type name
 * @param {number} searchLimit search limit
 * @param {number} saveLimit save limit
 * @param {number} monthly monthly cost
 * @param {number} yearly yearly cost
 */
const add = async(uuid, name, searchLimit, saveLimit, monthly, yearly) => {
    let sql = 'INSERT INTO public."accountType" ( uuid, name, "searchLimit", "saveLimit", monthly, yearly ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6 )';
    const data = [
        uuid,
        name,
        searchLimit,
        saveLimit,
        monthly,
        yearly
    ]

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update an account type
 * @param {string} uuid account type uuid
 * @param {string} name account type name
 * @param {number} searchLimit search limit
 * @param {number} saveLimit save limit
 * @param {number} monthly monthly cost
 * @param {number} yearly yearly cost
 */
const update = async(uuid, name, searchLimit, saveLimit, monthly, yearly) => {
    let sql = 'UPDATE public."accountType" set name = $2, "searchLimit" = $3, "saveLimit" = $4, monthly = $5, yearly = $6 ';
    sql += 'WHERE uuid = $1';
    const data = [
        uuid,
        name,
        searchLimit,
        saveLimit,
        monthly,
        yearly,
        uuid
    ]

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Delete an account type
 * @param {string} uuid account type uuid
 */
const remove = async(uuid) => {
    let sql = 'DELETE FROM public."accountType" where uuid = $1';

    try {
        const res = await pool.query(sql, [ uuid ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    get,
    getAll,
    getByName,
    getByUuid,
    add,
    update,
    remove
}