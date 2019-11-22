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
 * Get all discount codes
 */
const getAll = async() => {
    let sql = `SELECT code, "percentOff", "validTil", "multiUse", redeemed, "accountTypeId", price, days, "totalUses", "usedUses" 
    FROM public."discountCodes"`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get discount code by code
 * @param {string} code discount code
 */
const get = async(code) => {
    let sql = `SELECT code, "percentOff", "validTil", "multiUse", redeemed, "accountTypeId", price, days, "totalUses", "usedUses" 
    FROM public."discountCodes"
    WHERE code = $1`;

    try {
        const res = await pool.query(sql, [code]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add a discount code
 * @param {object} discount discount code object
 */
const add = async(discount) => {
    let sql = `INSERT INTO public."discountCodes" ( code, "percentOff", "validTil", "multiUse", "accountTypeId", price, days ) 
    VALUES ( $1, $2, $3, $4, $5, $6, $7 ) `;

    const data = [
        discount.code, 
        discount.percentOff, 
        discount.validTil, 
        discount.multiUse,
        discount.accountTypeId,
        discount.price,
        discount.days
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Remove a discount code
 * @param {string} code discount code
 */
const remove = async(code) => {
    let sql = 'DELETE FROM public."discountCodes" WHERE code = $1';

    try {
        const res = await pool.query(sql, [ code ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Redeem a discount code
 * @param {string} code discount code
 */
const redeem = async(code) => {
    let sql = `UPDATE public."discountCodes" set redeemed = true 
    WHERE code = $1 `;

    try {
        const res = await pool.query(sql, [ code ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Consume a discount code
 * @param {string} code discount code
 */
const consume = async(code) => {
    let sql = `UPDATE public."discountCodes" set "usedUses" = "usedUses" + 1 
    WHERE code = $1 `;

    try {
        const res = await pool.query(sql, [ code ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    get,
    getAll,
    add,
    remove,
    redeem,
    consume
}