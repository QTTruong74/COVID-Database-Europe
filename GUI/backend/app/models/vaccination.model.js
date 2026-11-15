const db = require("./db.js");
const tables = require("../config/table.config.js");

const VaccinationCountryAge = function() {};

VaccinationCountryAge.getCountries = (result) => {
  db.query(
    `SELECT DISTINCT ReportingCountry as country FROM ${tables.VACCINATION_AGE} ORDER BY ReportingCountry`,
    (err, res) => {
      if (err) {
        // If schema mismatch, return empty list to let frontend fallback
        console.log("vaccination_country_age countries error: ", err.message);
        result(null, []);
        return;
      }
      result(null, res.map(r => r.country));
    }
  );
};

VaccinationCountryAge.getYears = (result) => {
  db.query(
    `SELECT DISTINCT YearWeekISO as year FROM ${tables.VACCINATION_AGE} ORDER BY YearWeekISO`,
    (err, res) => {
      if (err) {
        console.log("vaccination_country_age years error: ", err.message);
        result(null, []);
        return;
      }
      // Extract year from YearWeekISO (format: 2021-W01)
      const years = [...new Set(res.map(r => r.year.split('-')[0]))].sort();
      result(null, years);
    }
  );
};

VaccinationCountryAge.getByCountryAndYear = (country, year, result) => {
  db.query(
    `SELECT 
      ReportingCountry as Country,
      TargetGroup as AgeGroup,
      AVG(Denominator_1) as Denominator_1,
      AVG(Denominator_2) as Denominator_2,
      AVG(DoseAdditional1) as DoseAdditional1
    FROM ${tables.VACCINATION_AGE}
    WHERE ReportingCountry = ? AND YearWeekISO LIKE ?
    GROUP BY ReportingCountry, TargetGroup
    ORDER BY TargetGroup`,
    [country, `${year}%`],
    (err, res) => {
      if (err) {
        console.log("vaccination_country_age data error: ", err.message);
        result(null, []);
        return;
      }
      result(null, res);
    }
  );
};

// Get vaccine type distribution by country and year
VaccinationCountryAge.getVaccineDistribution = (country, year, result) => {
  // First try with the main vaccination table if it exists
  db.query(
    `SELECT 
      Vaccine,
      SUM(TotalDoses) as TotalDoses,
      (SUM(TotalDoses) * 100.0 / 
        (SELECT SUM(TotalDoses) 
         FROM ${tables.VACCINATION} 
         WHERE ReportingCountry = ? AND Year = ?)) as Percentage
    FROM ${tables.VACCINATION}
    WHERE ReportingCountry = ? AND Year = ?
    GROUP BY Vaccine
    ORDER BY TotalDoses DESC`,
    [country, year, country, year],
    (err, res) => {
      if (err) {
        console.log("vaccination distribution error: ", err.message);
        result(null, []);
        return;
      }
      result(null, res);
    }
  );
};

module.exports = VaccinationCountryAge;
