const VaccinationCountryAge = require("../models/vaccination.model.js");

exports.getCountries = (req, res) => {
  VaccinationCountryAge.getCountries((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving countries."
      });
    else res.send(data);
  });
};

exports.getYears = (req, res) => {
  VaccinationCountryAge.getYears((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving years."
      });
    else res.send(data);
  });
};

exports.getByCountryAndYear = (req, res) => {
  const country = req.query.country;
  const year = req.query.year;

  if (!country || !year) {
    res.status(400).send({
      message: "Country and year parameters are required"
    });
    return;
  }

  VaccinationCountryAge.getByCountryAndYear(country, year, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data."
      });
    else res.send(data);
  });
};

// Get vaccine distribution by type
exports.getVaccineDistribution = (req, res) => {
  const country = req.query.country;
  const year = req.query.year;

  if (!country || !year) {
    res.status(400).send({
      message: "Country and year parameters are required"
    });
    return;
  }

  VaccinationCountryAge.getVaccineDistribution(country, year, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving vaccine distribution."
      });
    else res.send(data);
  });
};
