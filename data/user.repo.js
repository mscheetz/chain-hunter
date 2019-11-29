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
 * Get all users
 */
const getAll = async() => {
    let sql = 'SELECT * from public."user"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get user by email address
 * @param {string} email email address
 */
const getByEmail = async(email) => {
    let sql = 'SELECT * FROM public."user" WHERE email = $1';

    try {
        const res = await pool.query(sql, [email]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get user by username
 * @param {string} username username
 */
const getByUsername = async(username) => {
    let sql = 'SELECT * FROM public."user" WHERE "username" = $1';

    try {
        const res = await pool.query(sql, [username]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get user by user id
 * @param {string} userId user id
 */
const get = async(userId) => {
    let sql = 'SELECT * FROM public."user" WHERE "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add a user
 * @param {object} user user object
 */
const add = async(user) => {
    let sql = 'INSERT INTO public."user" ( email, created, "userId", "accountTypeId", username, "expirationDate", hash, validated ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )';
    const data = [
        user.email,
        user.created, 
        user.userId, 
        user.accountTypeId, 
        user.username, 
        user.expirationDate, 
        user.hash, 
        user.validated
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update a user
 * @param {object} user user object
 */
const update = async(user) => {
    let sql = 'UPDATE public."user" SET email = $1, "accountTypeId" = $2, username = $3, "expirationDate" = $4 ';
    sql += 'WHERE "userId" = $5'
    const data = [
        user.email, 
        user.created, 
        user.userId, 
        user.accountType, 
        user.username, 
        user.expirationDate
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update a user's user name
 * @param {string} userId user id
 * @param {string} username user name
 */
const updateUsername = async(userId, username) => {
    let sql = 'UPDATE public."user" SET username = $2 ';
    sql += 'WHERE "userId" = $1'
    const data = [
        userId, 
        username
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update user account type
 * @param {string} userId user id
 * @param {string} accountTypeId account type id
 * @param {number} expirationDate account type expiration date
 */
const updateAccount = async(userId, accountTypeId, expirationDate = null) => {
    let sql = 'UPDATE public."user" SET "accountTypeId" = $2, "expirationDate" = $3 ';
    sql += 'WHERE "userId" = $1'
    const data = [
        userId, 
        accountTypeId,
        expirationDate
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Validate a user account
 * @param {string} userId user id
 * @param {number} validationTS validate date
 */
const validate = async(userId, validationTS) => {
    let sql = 'UPDATE public."user" SET validated = $2 ';
    sql += 'WHERE "userId" = $1'
    const data = [
        userId, 
        validationTS
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Update a user's password
 * @param {string} userId user id
 * @param {string} oldHash old password hash
 * @param {string} newHash new password hash
 */
const updatePassword = async(userId, oldHash, newHash) => {
    let sql = 'UPDATE public."user" SET hash = $3 ';
    sql += 'WHERE "userId" = $1 AND hash = $2'
    const data = [
        userId, 
        oldHash, 
        newHash
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Set a user's password
 * @param {string} userId user id
 * @param {string} hash password hash
 */
const setPassword = async(userId, hash) => {
    let sql = 'UPDATE public."user" SET hash = $2 ';
    sql += 'WHERE "userId" = $1'
    const data = [
        userId, 
        hash
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Get a user and account details
 * @param {string} userId user id
 */
const getUserAndAccount = async(userId) => {
    let sql = 'SELECT a.*, b."searchLimit", b."saveLimit", b."name" as "accountType", c."savedHunts" ';
	sql += 'FROM public."user" a ';
	sql += 'LEFT JOIN public."accountType" b ';
    sql += 'on a."accountTypeId" = b.id ';
	sql += 'LEFT JOIN  (SELECT "userId", Count("userId") as "savedHunts" FROM public."userData" where active = true group by "userId") c ';
	sql += 'on a."userId" = c."userId" ';
    sql += 'WHERE a."userId" = $1';

    try {
        const res = await pool.query(sql, [ userId ]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    get,
    getAll,
    getUserAndAccount,
    getByEmail,
    getByUsername,
    add,
    updateUsername,
    updateAccount,
    updatePassword,
    setPassword,
    validate
}