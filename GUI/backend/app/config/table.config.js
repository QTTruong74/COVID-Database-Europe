// Centralized table name configuration. Override via environment variables.
module.exports = {
  COUNTRY: process.env.TABLE_COUNTRY || "countries",
  COVID_YEAR_VIEW: process.env.TABLE_COVID_YEAR_VIEW || "cases_death_country_year",
  VACCINATION_AGE: process.env.TABLE_VACCINATION_AGE || "vaccination_country_age",
  VACCINATION: process.env.TABLE_VACCINATION || "vaccination",
};
