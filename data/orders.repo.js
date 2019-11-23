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
 * Get an order by order id
 * @param {string} orderId order id
 */
const get = async(orderId) => {
    let sql = `SELECT "orderId", "userId", "accountTypeId", created, price, "paymentTypeId", "paymentTypeDetail", "validTil", processed, "discountCode" 
    FROM public."orders" 
    WHERE "orderId" = $1`;

    try {
        const res = await pool.query(sql, [ orderId ]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get all orders for a user
 * @param {string} userId user id
 */
const getByUser = async(userId) => {
    let sql = `SELECT "orderId", "userId", "accountTypeId", created, price, "paymentTypeId", "paymentTypeDetail", "validTil", processed, "discountCode" 
    FROM public."orders" 
    WHERE "userId" = $1`;

    try {
        const res = await pool.query(sql, [ userId ]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add an order
 * @param {object} order order object
 */
const add = async(order) => {
    let sql = `insert into public."orders" ( "orderId", "userId", "accountTypeId", created, price, "paymentTypeId", "validTil", "discountCode" ) 
    values ( $1, $2, $3, $4, $5, $6, $7, $8 )`;

    const data = [
        order.orderId, 
        order.userId,
        order.accountTypeId,
        order.created,
        order.price,
        order.orderType,
        order.validTil,
        order.discountCode
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Process an order
 * @param {string} orderId order id
 * @param {string} detailId payment type detail id
 * @param {number} processedTS processed timestamp
 */
const processOrder = async(orderId, detailId, processedTS) => {
    let sql = `UPDATE public."orders" 
    SET "paymentTypeDetail" = $2, processed = $3 
    WHERE "orderId" = $1`;
    const data = [
        orderId,
        detailId,
        processedTS
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Delete an order
 * @param {string} orderId order id
 */
const remove = async(orderId) => {
    let sql = `DELETE FROM public."orders" 
    WHERE "orderId" = $1`;
    const data = [
        orderId
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getByUser,
    get,
    add,
    processOrder,
    remove
}