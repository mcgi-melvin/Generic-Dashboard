// config/database.js
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

let pool;

const initDatabase = async () => {
    const dbType = process.env.DB_TYPE || 'postgres';

    if (dbType === 'postgres') {
        pool = new Pool({
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
        });
        console.log('Connected to PostgreSQL');
    } else if (dbType === 'mysql') {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('Connected to MySQL');
    } else {
        throw new Error('Invalid DB_TYPE. Must be "postgres" or "mysql"');
    }

    return pool;
};


const query = async (text, params) => {
    const dbType = process.env.DB_TYPE || 'postgres';

    if (dbType === 'postgres') {
        return await pool.query(text, params);
    } else {
        // Convert PostgreSQL-style $1, $2 to MySQL-style ?
        const mysqlQuery = text.replace(/\$\d+/g, '?');
        const [rows] = await pool.execute(mysqlQuery, params);
        return {rows}
    }
};

module.exports = {
    initDatabase,
    query,
    pool
};