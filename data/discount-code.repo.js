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
    FROM public."discountCode"`;

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
    FROM public."discountCode"
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
    let sql = `INSERT INTO public."discountCode" ( code, "percentOff", "validTil", "multiUse", redeemed, "accountTypeId", price, days, "totalUses", "usedUses" ) 
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) `;

    const data = [
        discount.code, 
        discount.percentOff, 
        discount.validTil, 
        discount.multiUse,
        discount.redeemed,
        discount.accountTypeId,
        discount.price,
        discount.days,
        discount.totalUses,
        discount.usedUses
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update a discount code
 * @param {object} discount discount code object
 */
const update = async(discount) => {
    let sql = `UPDATE public."discountCode" SET 
    "percentOff" = $2, 
    "validTil" = $3, 
    "multiUse" = $4, 
    redeemed = $5,
    "accountTypeId" = $6, 
    price = $7, 
    days = $8,
    "totalUses" = $9,
    "usedUses" = $10
    WHERE code = $1`;

    const data = [
        discount.code, 
        discount.percentOff, 
        discount.validTil, 
        discount.multiUse,
        discount.redeemed,
        discount.accountTypeId,
        discount.price,
        discount.days,
        discount.totalUses,
        discount.usedUses
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
    let sql = 'DELETE FROM public."discountCode" WHERE code = $1';

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
    let sql = `UPDATE public."discountCode" set redeemed = true 
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
    let sql = `UPDATE public."discountCode" set "usedUses" = "usedUses" + 1 
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