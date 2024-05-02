const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    connectionLimit: 10, // Adjust this value as needed
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'last_project'
});

// Export the pool to be used in other files
module.exports = pool;
