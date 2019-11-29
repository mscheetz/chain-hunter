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
 * Get a site discount code
 * @param {string} discountId discount id
 */
const get = async(discountId) => {
    let sql = `SELECT "discountId", "startDate", "endDate", "percentOff", "accountTypeId", "discountPrice" 
    FROM public."siteDiscount"
    WHERE "discountId" = $1`;

    try {
        const res = await pool.query(sql, [discountId]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all site discount codes
 */
const getAll = async() => {
    let sql = 'SELECT "discountId", "startDate", "endDate", "percentOff", "accountTypeId", "discountPrice" FROM public."siteDiscount"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all active discount codes
 * @param {number} currentDate current date ts
 */
const getActive = async(currentDate) => {
    let sql = 'SELECT "discountId", "startDate", "endDate", "percentOff", "accountTypeId", "discountPrice" FROM public."siteDiscount" ';
    sql += 'WHERE "startDate" <= $1 AND "endDate" >= $1'

    try {
        const res = await pool.query(sql, [currentDate]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add a discount code
 * @param {string} discountId discount id
 * @param {number} startDate start ts
 * @param {number} endDate end ts
 * @param {number} percentOff percent off
 * @param {number} accountTypeId account type
 * @param {number} discountPrice discount price
 */
const add = async(discountId, startDate, endDate, percentOff, accountTypeId, discountPrice) => {
    let sql = 'INSERT INTO public."siteDiscount" ( "discountId", "startDate", "endDate", "percentOff", "accountTypeId", "discountPrice" ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6 )';
    const data = [
        discountId,
        startDate,
        endDate,
        percentOff,
        accountTypeId,
        discountPrice
    ]

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * update a discount code
 * @param {string} discountId discount id
 * @param {number} startDate start ts
 * @param {number} endDate end ts
 * @param {number} percentOff percent off
 * @param {number} accountTypeId account type
 * @param {number} discountPrice discount price
 */
const update = async(discountId, startDate, endDate, percentOff, accountTypeId, discountPrice) => {
    let sql = 'UPDATE public."siteDiscount" set "startDate" = $2, "endDate" = $3, "percentOff" = $4, "accountTypeId" = $5, "discountPrice" = $6 ';
    sql += 'WHERE "discountId" = $1';
    const data = [
        discountId,
        startDate,
        endDate,
        percentOff,
        accountTypeId,
        discountPrice
    ]

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
    add,
    update
}