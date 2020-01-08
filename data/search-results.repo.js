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
 * Get all search results
 */
const getAll = async() => {
    let sql = `SELECT country, region, city, metro, timezone, chain, "searchType", "searchAt" 
    FROM public."searchResults"`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getLastSearch = async() => {
    let sql = `SELECT country, region, city, metro, timezone, chain, "searchType", "searchAt"
	FROM public."searchResults"
	order by "searchAt" desc
	limit 5;`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

const getTopSearchChainByCountry = async() => {
    let sql = `SELECT country, chain as value, count
    FROM (
       SELECT country, chain, count,
              RANK() OVER (PARTITION BY country 
                           ORDER BY count DESC) AS rn
       FROM (
          SELECT country, chain, COUNT(chain) AS count
          FROM public."searchResults"
          GROUP BY country, chain ) t
    ) s
    WHERE s.rn = 1`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}
const getTopSearchTypeByCountry = async() => {
    let sql = `SELECT country, "searchType" as value, count
    FROM (
       SELECT country, "searchType", count,
              RANK() OVER (PARTITION BY country 
                           ORDER BY count DESC) AS rn
       FROM (
          SELECT country, "searchType", COUNT("searchType") AS count
          FROM public."searchResults"
          GROUP BY country, "searchType" ) t
    ) s
    WHERE s.rn = 1`;

    try {
        const res = await pool.query(sql);

        return res.rows;
    } catch(err) {
        console.log(err);
    }
}

/**
 * Add search result
 * @param {object} searchResult search result object
 */
const add = async(searchResult) => {
    let sql = `INSERT INTO public."searchResults" ( country, region, city, metro, timezone, chain, "searchType", "searchAt" ) 
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )`;

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

module.exports = {
    getAll,
    getLastSearch,
    getTopSearchChainByCountry,
    getTopSearchTypeByCountry,
    add
}