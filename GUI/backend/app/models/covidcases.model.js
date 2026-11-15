const sql = require("./db.js");
const tables = require("../config/table.config.js");

// Constructor
const CovidCases = function(covidCase) {
  this.Country = covidCase.country_name;
  this.Year = covidCase.year;
  this.Peak_Cases_per_Million = covidCase.peak_cases_per_million;
  this.Peak_Deaths_per_Million = covidCase.peak_deaths_per_million;
  this.Avg_Cases_per_Million = covidCase.avg_cases_per_million;
  this.Avg_Deaths_per_Million = covidCase.avg_deaths_per_million;
  this.Total_Cases_per_Million = covidCase.total_cases_per_million;
  this.Total_Deaths_per_Million = covidCase.total_deaths_per_million;
};

// Get cases by year
CovidCases.getByYear = (year, result) => {
  const query = `SELECT 
    country_name AS Country,
    year AS Year,
    peak_cases_per_million AS Peak_Cases_per_Million,
    peak_deaths_per_million AS Peak_Deaths_per_Million,
    avg_cases_per_million AS Avg_Cases_per_Million,
    avg_deaths_per_million AS Avg_Deaths_per_Million,
    total_cases_per_million AS Total_Cases_per_Million,
    total_deaths_per_million AS Total_Deaths_per_Million
    FROM ${tables.COVID_YEAR_VIEW} 
    WHERE year = ? 
    ORDER BY country_name`;
  
  sql.query(query, [year], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("covid cases: ", res);
    result(null, res);
  });
};

// Get all available years
CovidCases.getAllYears = result => {
  const query = `SELECT DISTINCT year AS Year FROM ${tables.COVID_YEAR_VIEW} ORDER BY year`;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("years: ", res);
    result(null, res);
  });
};

// Get all cases data
CovidCases.getAll = result => {
  const query = `SELECT 
    country_name AS Country,
    year AS Year,
    peak_cases_per_million AS Peak_Cases_per_Million,
    peak_deaths_per_million AS Peak_Deaths_per_Million,
    avg_cases_per_million AS Avg_Cases_per_Million,
    avg_deaths_per_million AS Avg_Deaths_per_Million,
    total_cases_per_million AS Total_Cases_per_Million,
    total_deaths_per_million AS Total_Deaths_per_Million
    FROM ${tables.COVID_YEAR_VIEW} 
    ORDER BY country_name, year`;
  
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("all covid cases: ", res);
    result(null, res);
  });
};

// Get mortality analysis for specific country and year
CovidCases.getMortalityAnalysis = (country, year, result) => {
  const query = `SELECT 
    country_name AS Country,
    year AS Year,
    total_cases_per_million AS Total_Cases,
    total_deaths_per_million AS Total_Deaths,
    CASE 
      WHEN total_cases_per_million > 0 
      THEN (total_deaths_per_million / total_cases_per_million) * 100 
      ELSE 0 
    END AS Case_Fatality_Rate,
    CASE 
      WHEN total_cases_per_million > 0 
      THEN 100 - ((total_deaths_per_million / total_cases_per_million) * 100)
      ELSE 100 
    END AS Survival_Rate
    FROM ${tables.COVID_YEAR_VIEW} 
    WHERE country_name = ? AND year = ?`;
  
  sql.query(query, [country, year], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res[0]);
  });
};

// Get historical mortality rates for a country
CovidCases.getHistoricalMortality = (country, result) => {
  const query = `SELECT 
    year AS Year,
    CASE 
      WHEN total_cases_per_million > 0 
      THEN (total_deaths_per_million / total_cases_per_million) * 100 
      ELSE 0 
    END AS CFR
    FROM ${tables.COVID_YEAR_VIEW} 
    WHERE country_name = ?
    ORDER BY year`;
  
  sql.query(query, [country], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

module.exports = CovidCases;
