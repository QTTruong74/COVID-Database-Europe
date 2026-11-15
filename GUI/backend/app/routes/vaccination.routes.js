module.exports = app => {
  const vaccination = require("../controllers/vaccination.controller.js");

  var router = require("express").Router();

  // Get all countries
  router.get("/countries", vaccination.getCountries);

  // Get all years
  router.get("/years", vaccination.getYears);

  // Get vaccination data by country and year
  router.get("/", vaccination.getByCountryAndYear);

  // Get vaccine distribution by type
  router.get("/vaccine-distribution", vaccination.getVaccineDistribution);

  app.use('/api/vaccination-country-age', router);
};
