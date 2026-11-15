module.exports = app => {
  const covidCases = require("../controllers/covidcases.controller.js");

  var router = require("express").Router();

  // Retrieve all COVID cases data
  router.get("/", covidCases.findAll);

  // Retrieve all available years
  router.get("/years", covidCases.getAllYears);

  // Retrieve COVID cases for a specific year
  router.get("/year/:year", covidCases.findByYear);

  // Get mortality analysis for specific country and year
  router.get("/mortality/:country/:year", covidCases.getMortalityAnalysis);

  // Get historical mortality rates for a country
  router.get("/mortality-history/:country", covidCases.getHistoricalMortality);

  app.use('/api/covid-cases', router);
};
