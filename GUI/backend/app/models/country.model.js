const sql = require("./db.js");
const tables = require("../config/table.config.js");

// constructor
const Country = function(country) {
  this.country_code = country.country_code;
  this.country_name = country.country_name;
  this.is_eu = country.is_eu;
};

// Retrieve all countries (return fields matching your table)
Country.getAll = result => {
  const query = `SELECT country_code, country_name, is_eu FROM ${tables.COUNTRY}`;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("countries: ", res);
    result(null, res);
  });
};

// Find a single country by code
Country.findByCode = (code, result) => {
  sql.query(`SELECT country_code, country_name, is_eu FROM ${tables.COUNTRY} WHERE country_code = ?`, [code], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found country: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found
    result({ kind: "not_found" }, null);
  });
};

module.exports = Country;
