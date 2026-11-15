require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

// Allow frontend dev servers on 8080 and 3000
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000"
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true); // allow curl/postman
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         return callback(null, true);
//       }
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true
//   })
// );
app.use(cors({ origin: true, credentials: true }));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// DB connection test endpoint
const db = require("./app/models/db.js");
app.get('/api/dbtest', (req, res) => {
  // Acquire a connection from the pool and run a simple query
  db.getConnection((err, connection) => {
    if (err) {
      console.error('DB connection error:', err.message || err);
      return res.status(500).json({ connected: false, error: err.message || String(err) });
    }
    connection.query('SELECT 1 AS ok', (qerr, results) => {
      connection.release();
      if (qerr) {
        console.error('DB query error:', qerr.message || qerr);
        return res.status(500).json({ connected: false, error: qerr.message || String(qerr) });
      }
      return res.json({ connected: true });
    });
  });
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "COVID-19 Europe analysis API" });
});
require("./app/routes/country.routes.js")(app);
require("./app/routes/covidcases.routes.js")(app);
require("./app/routes/vaccination.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
