const { Pool } = requre('pg');

const pool = new Pool();

module.exports = {
    query: (text, parms) =>  pool.query(text, parms),
}