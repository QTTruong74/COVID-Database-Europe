const CovidCases = require("../models/covidcases.model.js");

// Retrieve COVID cases for a specific year
exports.findByYear = (req, res) => {
  const year = req.params.year;

  CovidCases.getByYear(year, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving COVID cases."
      });
    else res.send(data);
  });
};

// Retrieve all available years
exports.getAllYears = (req, res) => {
  CovidCases.getAllYears((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving years."
      });
    else res.send(data);
  });
};

// Retrieve all COVID cases data
exports.findAll = (req, res) => {
  CovidCases.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving COVID cases."
      });
    else res.send(data);
  });
};

// Get mortality analysis for specific country and year
exports.getMortalityAnalysis = (req, res) => {
  const country = req.params.country;
  const year = req.params.year;

  if (!country || !year) {
    res.status(400).send({
      message: "Country and year parameters are required"
    });
    return;
  }

  CovidCases.getMortalityAnalysis(country, year, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving mortality data."
      });
    else res.send(data);
  });
};

// Get historical mortality rates
exports.getHistoricalMortality = (req, res) => {
  const country = req.params.country;

  if (!country) {
    res.status(400).send({
      message: "Country parameter is required"
    });
    return;
  }

  CovidCases.getHistoricalMortality(country, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving historical mortality data."
      });
    else res.send(data);
  });
};
