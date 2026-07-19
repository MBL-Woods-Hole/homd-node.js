//db.js
//import mysql from 'mysql2';
import mysql from 'mysql2/promise'; // Use the promise-based API for modern async/await

// 
// // Create the connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10, // Adjust based on your needs/server limits
//   queueLimit: 0,
// });
// 
// // Function to get a connection from the pool
// // export const getConnection = () => {
// //   return pool.getConnection();
// // };
// export default pool



// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 50, // default (10) Adjust based on your needs/server limits
  // Keep a maximum of 5 open connections when traffic drops
  maxIdle: 5,
  // Close any idle connections above maxIdle after 60 seconds
  idleTimeout: 60000,
  waitForConnections: true,
  queueLimit: 0,  // '0' means unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  acquireTimeout: 30000,
  connectTimeout: 30000
});

// Get the Promise-wrapped pool for async/await usage
//const promisePool = pool.promise();
// export const getConnection = () => {
//   return pool.getConnection();
// };
// Export the pool instance to be used everywhere
export default pool;