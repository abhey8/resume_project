// db.js
const mysql = require("mysql2");

console.log("Using DATABASE_URL:", process.env.DATABASE_URL);

const db = mysql.createConnection(process.env.DATABASE_URL);

// connect and test
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message || err);
    return;
  }
  console.log("MySQL connected");

  // Test query
  db.query("SELECT 1", (err, result) => {
    if (err) {
      console.error("Test query error:", err.message || err);
    } else {
      console.log("Test query result:", result);
    }
  });
});

module.exports = db;
