const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "nodejs", // Your database name
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed");
    return;
  }
  console.log("Connected to Mysql Database");
});

module.exports = db;
