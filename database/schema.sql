-- Schema for the COVID-19 Europe analysis app.
-- Usage (from the repository root):
--   mysql -u root -p < database/schema.sql
--   mysql --local-infile=1 -u root -p < database/import.sql
-- The database name must match DB_NAME in GUI/backend/.env (default: htwdb2).

CREATE DATABASE IF NOT EXISTS htwdb2 DEFAULT CHARACTER SET utf8mb4;
USE htwdb2;

DROP TABLE IF EXISTS vaccination_eu_summary;
DROP TABLE IF EXISTS vaccination_country_age;
DROP TABLE IF EXISTS vaccination;
DROP TABLE IF EXISTS cases_death_country_year;
DROP TABLE IF EXISTS countries;

-- Reference table. country_code follows Eurostat/ECDC codes (Greece = 'EL');
-- 'EU' is the aggregate "European Union (27)" used in the cases/deaths data.
CREATE TABLE countries (
  country_code CHAR(2)      NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  is_eu        BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (country_code),
  UNIQUE KEY uq_countries_name (country_name)
) ENGINE=InnoDB;

-- Yearly cases/deaths per million (source: Our World in Data, aggregated by cases_death.py).
-- Read by the backend as TABLE_COVID_YEAR_VIEW.
CREATE TABLE cases_death_country_year (
  country_name            VARCHAR(100)  NOT NULL,
  year                    SMALLINT      NOT NULL,
  peak_cases_per_million  DECIMAL(12,2) NOT NULL,
  peak_deaths_per_million DECIMAL(12,2) NOT NULL,
  avg_cases_per_million   DECIMAL(12,2) NOT NULL,
  avg_deaths_per_million  DECIMAL(12,2) NOT NULL,
  total_cases_per_million DECIMAL(12,2) NOT NULL,
  total_deaths_per_million DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (country_name, year),
  KEY idx_cases_year (year),
  CONSTRAINT fk_cases_country FOREIGN KEY (country_name)
    REFERENCES countries (country_name)
) ENGINE=InnoDB;

-- Yearly vaccine doses per country, age/target group and vaccine (source: ECDC Vaccine Tracker).
CREATE TABLE vaccination (
  `Year`            SMALLINT    NOT NULL,
  ReportingCountry  CHAR(2)     NOT NULL,
  TargetGroup       VARCHAR(20) NOT NULL,
  Vaccine           VARCHAR(20) NOT NULL,
  Population        BIGINT      NOT NULL,
  TotalDoses        BIGINT      NOT NULL,
  PRIMARY KEY (`Year`, ReportingCountry, TargetGroup, Vaccine),
  KEY idx_vacc_country_year (ReportingCountry, `Year`),
  CONSTRAINT fk_vacc_country FOREIGN KEY (ReportingCountry)
    REFERENCES countries (country_code)
) ENGINE=InnoDB;

-- EU-wide aggregate of `vaccination` (produced by 27_eu.py).
CREATE TABLE vaccination_eu_summary (
  `Year`      SMALLINT    NOT NULL,
  TargetGroup VARCHAR(20) NOT NULL,
  Vaccine     VARCHAR(20) NOT NULL,
  Population  BIGINT      NOT NULL,
  TotalDoses  BIGINT      NOT NULL,
  PRIMARY KEY (`Year`, TargetGroup, Vaccine)
) ENGINE=InnoDB;

-- Weekly vaccination uptake by age group (ECDC format, YearWeekISO like '2021-W01').
-- No CSV for this table is shipped in CSV/, so it stays empty unless you load the
-- ECDC weekly dataset yourself. The backend/frontend handle the empty case with fallbacks.
CREATE TABLE vaccination_country_age (
  ReportingCountry CHAR(2)     NOT NULL,
  YearWeekISO      CHAR(8)     NOT NULL,
  TargetGroup      VARCHAR(20) NOT NULL,
  Denominator_1    BIGINT      NULL,
  Denominator_2    BIGINT      NULL,
  DoseAdditional1  BIGINT      NULL,
  PRIMARY KEY (ReportingCountry, YearWeekISO, TargetGroup),
  CONSTRAINT fk_vacage_country FOREIGN KEY (ReportingCountry)
    REFERENCES countries (country_code)
) ENGINE=InnoDB;
