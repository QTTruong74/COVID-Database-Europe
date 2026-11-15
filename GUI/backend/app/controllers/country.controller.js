const Country = require("../models/country.model.js");

// Retrieve all Countries from the database.
exports.findAll = (req, res) => {
  Country.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving countries."
      });
    else res.send(data);
  });
};

// Find a single Country by code
exports.findOne = (req, res) => {
  const code = req.params.id;

  Country.findByCode(code, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Country with code ${code}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Country with code " + code
        });
      }
    } else res.send(data);
  });
};
