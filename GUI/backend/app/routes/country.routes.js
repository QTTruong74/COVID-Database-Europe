module.exports = app => {
  const countries = require("../controllers/country.controller.js");

  var router = require("express").Router();

  // Retrieve all Countries
  router.get("/", countries.findAll);

  // Retrieve a single Country with code
  router.get("/:id", countries.findOne);

  app.use('/api/countries', router);
};
