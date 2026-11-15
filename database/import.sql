-- Loads the CSV files from CSV/ into htwdb2. Run from the repository root:
--   mysql --local-infile=1 -u root -p < database/import.sql
-- (If the server refuses LOCAL INFILE: SET GLOBAL local_infile = 1; as an admin.)
USE htwdb2;

-- 1) Reference data (31 rows). is_eu = 0 for EEA countries outside the EU.
INSERT INTO countries (country_code, country_name, is_eu) VALUES
  ('AT','Austria',1), ('BE','Belgium',1), ('BG','Bulgaria',1), ('HR','Croatia',1),
  ('CY','Cyprus',1), ('CZ','Czechia',1), ('DK','Denmark',1), ('EE','Estonia',1),
  ('FI','Finland',1), ('FR','France',1), ('DE','Germany',1), ('EL','Greece',1),
  ('HU','Hungary',1), ('IE','Ireland',1), ('IT','Italy',1), ('LV','Latvia',1),
  ('LT','Lithuania',1), ('LU','Luxembourg',1), ('MT','Malta',1), ('NL','Netherlands',1),
  ('PL','Poland',1), ('PT','Portugal',1), ('RO','Romania',1), ('SK','Slovakia',1),
  ('SI','Slovenia',1), ('ES','Spain',1), ('SE','Sweden',1),
  ('IS','Iceland',0), ('LI','Liechtenstein',0), ('NO','Norway',0),
  ('EU','European Union (27)',1);

-- 2) Cases and deaths per million (semicolon-separated, quoted, header row)
LOAD DATA LOCAL INFILE 'CSV/cases_death.csv'
INTO TABLE cases_death_country_year
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(country_name, year, peak_cases_per_million, peak_deaths_per_million,
 avg_cases_per_million, avg_deaths_per_million,
 total_cases_per_million, total_deaths_per_million);

-- 3) Vaccination doses by country / target group / vaccine
LOAD DATA LOCAL INFILE 'CSV/vaccin_age.csv'
INTO TABLE vaccination
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(`Year`, ReportingCountry, TargetGroup, Vaccine, Population, TotalDoses);

-- 4) EU-wide vaccination summary (comma-separated)
LOAD DATA LOCAL INFILE 'CSV/eu_vaccination_summary.csv'
INTO TABLE vaccination_eu_summary
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(`Year`, TargetGroup, Vaccine, Population, TotalDoses);

-- Sanity check: expected 31 / 162 / 7306 / 948 rows
SELECT (SELECT COUNT(*) FROM countries)                AS countries,
       (SELECT COUNT(*) FROM cases_death_country_year) AS cases_death,
       (SELECT COUNT(*) FROM vaccination)              AS vaccination,
       (SELECT COUNT(*) FROM vaccination_eu_summary)   AS eu_summary;
