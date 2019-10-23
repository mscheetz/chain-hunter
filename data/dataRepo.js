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

const getBlockchains = async() => {
    let sql = 'SELECT * FROM public.blockchain';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getBlockchainBySymbol = async(symbol) => {
    let sql = 'SELECT * FROM public.blockchain WHERE symbol = $1';

    try {
        const res = await pool.query(sql, [ symbol.toUpperCase() ]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}


const getActiveBlockchains = async() => {
    let sql = 'SELECT * FROM public.blockchain WHERE status = 1';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getFutureBlockchains = async() => {
    let sql = 'SELECT * FROM public.blockchain WHERE status = 0';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const updateBlockchain = async(chain) => {
    let sql = 'UPDATE public.blockchain SET name = $2, symbol = $3, status = $4, "hasTokens" = $5, "hasContracts" = $6, type = $7 ';
    sql += 'WHERE id = $1';
    const data = [
        chain.id, 
        chain.name, 
        chain.symbol, 
        chain.status, 
        chain.hasTokens, 
        chain.hasContracts, 
        chain.type
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const postBlockchain = async(chain) => {
    let sql = 'INSERT INTO public.blockchain ( name, symbol, status, "hasTokens", "hasContracts", id, type ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7 )';
    const data = [
        chain.name, 
        chain.symbol, 
        chain.status, 
        chain.hasTokens, 
        chain.hasContracts, 
        chain.id, 
        chain.type
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const getCountryCounts = async() => {
    let sql = 'SELECT * FROM public."countryCount"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const postCountryCount = async(countryCount) => {
    let sql = 'INSERT INTO public."countryCount" ( country, symbol, count ) ';
    sql += 'VALUES ( $1, $2, $3 ) ';
    const data = [
        countryCount.country, 
        countryCount.symbol, 
        countryCount.count
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const getDiscountCodes = async() => {
    let sql = 'SELECT * FROM public."discountCode"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getDiscountCodeById = async(id) => {
    let sql = 'SELECT * FROM public."discountCode" WHERE code = $1';

    try {
        const res = await pool.query(sql, [id]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const postDiscountCode = async(discount) => {
    let sql = 'INSERT INTO public."discountCode" ( code, "percentOff", "validTil", "usedOn" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 ) ';
    const data = [
        discount.code, 
        discount.percentOff, 
        discount.validTil, 
        discount.usedOn
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const updateDiscountCode = async(discount) => {
    let sql = 'UPDATE public."discountCode" set "usedOn" = $1 ';
    sql += 'WHERE code = $2 ';
    const data = [
        discount.usedOn, 
        discount.code
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const getSymbolCounts = async() => {
    let sql = 'SELECT * FROM public.symbolCount';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const postSymbolCount = async(symbolCount) => {
    let sql = 'INSERT INTO public.symbolCount ( symbol, count ) ';
    sql += 'VALUES ( $1, $2 ) ';
    const data = [
        symbolCount.symbol, 
        symbolCount.count
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const getUsers = async() => {
    let sql = 'SELECT * from public.user';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getUserByEmail = async(email) => {
    let sql = 'SELECT * FROM public.user WHERE email = $1';

    try {
        const res = await pool.query(sql, [email]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

const getUser = async(username) => {
    let sql = 'SELECT * FROM public.user WHERE "username" = $1';

    try {
        const res = await pool.query(sql, [username]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

const getUserByUserId = async(userId) => {
    let sql = 'SELECT * FROM public.user WHERE "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows[0];
    } catch(err) {
        console.log(err);
    }
}

const postUser = async(user) => {
    let sql = 'INSERT INTO public.user ( email, created, "userId", "accountType", username, "expirationDate", hash, validated ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )';
    const data = [
        user.email, 
        user.created, 
        user.userId, 
        user.accountType, 
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

const updateUser = async(user) => {
    let sql = 'UPDATE public.user SET email = $1, "accountType" = $2, username = $3, "expirationDate" = $4 ';
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

const validateUser = async(userId, validationTS) => {
    let sql = 'UPDATE public.user SET validated = $2 ';
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

const updateUserPassword = async(userId, oldHash, newHash) => {
    let sql = 'UPDATE public.user SET hash = $3 ';
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

const setUserPassword = async(userId, hash) => {
    let sql = 'UPDATE public.user SET hash = $2 ';
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

const getSearchResults = async() => {
    let sql = 'SELECT * FROM public."searchResults"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const postSearchResult = async(searchResult) => {
    let sql = 'INSERT INTO public."searchResults" ( country, region, city, metro, timezone, chain, "searchType", "searchAt" ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )';
    const data = [ 
        searchResult.country, 
        searchResult.region, 
        searchResult.city, 
        searchResult.metro,
        searchResult.timezone, 
        searchResult.chain, 
        searchResult.searchType, 
        searchResult.searchAt
    ];

    try {
        const res = await pool.query(sql, data);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const getTrxTokens = async() => {
    let sql = 'SELECT * FROM public."trxTokens"';

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const postTrxTokens = async(tokens) => {
    let response = false;
    for(let i = 0; i < tokens.length; i++) {
        response = await postTrxToken(tokens[i]);
    }

    return response;
}

const postTrxToken = async(token) => {
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

const postUserData = async(userData) => {
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

const getUserData = async(userId) => {
    let sql = 'SELECT * FROM public."userData" where "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const deleteUserData = async(id) => {
    let sql = 'DELETE FROM public."userData" where id = $1';

    try {
        const res = await pool.query(sql, [ id ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

const postPasswordReset = async(userId, token, TS) => {
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

const getPasswordReset = async(userId) => {
    let sql = 'SELECT * FROM public."passwordReset" where "userId" = $1';

    try {
        const res = await pool.query(sql, [userId]);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const deletePasswordReset = async(userId) => {
    let sql = 'DELETE FROM public."passwordReset" where "userId" = $1';

    try {
        const res = await pool.query(sql, [ userId ]);

        return res.rowCount;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getBlockchains,
    getBlockchainBySymbol,
    getActiveBlockchains,
    getFutureBlockchains,
    updateBlockchain,
    postBlockchain,
    getCountryCounts,
    postCountryCount,
    getDiscountCodes,
    getDiscountCodeById,
    postDiscountCode,
    updateDiscountCode,
    getSymbolCounts,
    postSymbolCount,
    getUser,
    getUserByEmail,
    getUserByUserId,
    getUsers,
    postUser,
    updateUser,
    validateUser,
    updateUserPassword,
    setUserPassword,
    getSearchResults,
    postSearchResult,
    getTrxTokens,
    postTrxTokens,
    postUserData,
    getUserData,
    deleteUserData,
    postPasswordReset,
    getPasswordReset,
    deletePasswordReset
}