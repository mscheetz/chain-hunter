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

const getAssets = async() => {
    let sql = 'SELECT * FROM assets';
    db.query(sql, (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const postAsset = async(asset) => {
    let sql = 'INSERT INTO assets ( "assetName", symbol, status, "hasTokens", "hasContracts", "assetId" ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6 ) ';
    pool.query(sql, [asset.assetName, asset.symbol, asset.status, asset.hasTokens, asset.hasContracts, asset.assetId], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getCountryCounts = async() => {
    let sql = 'SELECT * FROM countryCount';
    pool.query(sql, (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const postCountryCount = async(countryCount) => {
    let sql = 'INSERT INTO countryCount ( country, symbol, count ) ';
    sql += 'VALUES ( $1, $2, $3 ) ';
    pool.query(sql, [countryCount.country, countryCount.symbol, countryCount.count], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getDiscountCodes = async() => {
    let sql = 'SELECT * FROM discountCode';
    pool.query(sql, (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getDiscountCodeById = async(id) => {
    let sql = 'SELECT * FROM discountCode WHERE code = $1';
    pool.query(sql, [id], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const postDiscountCode = async(discount) => {
    let sql = 'INSERT INTO discountCode ( code, "percentOff", "validTil", "usedOn" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 ) ';
    pool.query(sql, [discount.code, discount.percentOff, discount.validTil, discount.usedOn], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const updateDiscountCode = async(discount) => {
    let sql = 'UPDATE discountCode set "usedOn" = $1 ';
    sql += 'WHERE code = $2 ';
    pool.query(sql, [discount.usedOn, discount.code], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getSymbolCounts = async() => {
    let sql = 'SELECT * FROM symbolCount';
    pool.query(sql, (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const postSymbolCount = async(symbolCount) => {
    let sql = 'INSERT INTO symbolCount ( symbol, count ) ';
    sql += 'VALUES ( $1, $2 ) ';
    pool.query(sql, [symbolCount.symbol, symbolCount.count], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getUsers = async() => {
    let sql = 'SELECT * from users';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log('error executing the query');
    }
}

const getUserByEmail = async(email) => {
    let sql = 'SELECT * FROM users WHERE email = $1';
    try {
        const res = await pool.query(sql, [email]);
        await pool.end();

        return res.rows[0];
    } catch(err) {
        console.log('error executing the query');
    }
}

const getUserByUserId = async(userId) => {
    let sql = 'SELECT * FROM users WHERE "userId" = $1';
    pool.query(sql, [userId], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const postUser = async(user) => {
    let sql = 'INSERT INTO users ( email, created, "userId", "accountType" ) ';
    sql += 'VALUES ( $1, $2, $3, $4 )';
    pool.query(sql, [user.email, user.created, user.userId, user.accountType], (error, results) => {
        if(error) {
            throw error;
        }

        return results.rows;
    })
}

const getSearchResults = async() => {
    let sql = 'SELECT * FROM public."searchResults"';

    try {
        const res = await pool.query(sql);
        await pool.end();

        return res.rows;
    } catch(err) {
        console.log('error executing the query');
    }
}

const postSearchResult = async(searchResult) => {
    let sql = 'INSERT INTO public."searchResults" ( country, region, city, metro, timezone, chain, "searchType", "searchAt" ) ';
    sql += 'VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )';
    pool.query(sql, 
        [ 
            searchResult.country, 
            searchResult.region, 
            searchResult.city, 
            searchResult.metro,
            searchResult.timezone, 
            searchResult.chain, 
            searchResult.searchType, 
            searchResult.searchAt
        ], (error, results) => {
        if(error) {
            console.log('error executing the query', sql);
            console.log('error', error);
        }

        return true;
    })
}

const getTrxTokens = async() => {
    let sql = 'SELECT * FROM public."trxTokens"';

    try {
        const res = await pool.query(sql);
        //await pool.end();

        return res.rows;
    } catch(err) {
        console.log('error executing the query');
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
    pool.query(sql, 
        [ 
            token.id, 
            token.name, 
            token.symbol, 
            token.precision
        ], (error, results) => {
            if(error) {
                console.log('error executing the query', sql);
                console.log('error', error);
            }
    
            return true;
        })
}

module.exports = {
    getAssets,
    postAsset,
    getCountryCounts,
    postCountryCount,
    getDiscountCodes,
    getDiscountCodeById,
    postDiscountCode,
    updateDiscountCode,
    getSymbolCounts,
    postSymbolCount,
    getUserByEmail,
    getUserByUserId,
    getUsers,
    postUser,
    getSearchResults,
    postSearchResult,
    getTrxTokens,
    postTrxTokens
}