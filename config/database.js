//db.js
//import mysql from 'mysql2';
import mysql from 'mysql2/promise'; // Use the promise-based API for modern async/await
import 'dotenv/config';
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
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs/server limits
  queueLimit: 0,
});

// Get the Promise-wrapped pool for async/await usage
//const promisePool = pool.promise();
export const getConnection = () => {
  return pool.getConnection();
};
// Export the pool instance to be used everywhere
//export default pool;