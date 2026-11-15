# COVID-19 Data Analysis for Europe (2020–2024)

A web application for exploring COVID-19 cases, deaths and vaccinations across European countries. It was built as a database coursework project (*Belegarbeit*) in the Computer Engineering programme at HTW Berlin, winter semester 2025/26.

**Stack:** MySQL 8 → Node.js / Express REST API → Vue 3 + Vite single-page app (Chart.js for charts).

The full project report (German) is included: [Datenbank_ML03-2.pdf](Datenbank_ML03-2.pdf).

## What it does

| Module | Description |
|---|---|
| Dashboard | Entry page with cards linking to every module |
| Countries | Sortable table of cases/deaths per million, filterable by year |
| Regional analysis | Compare countries by total/average/peak cases and deaths (table or bar chart) |
| Temporal analysis | Multi-country line charts; detects growth and decline phases |
| Survival rates | Case fatality rate (CFR), age adjustment and a vaccine-effectiveness estimate |
| Spread metrics | Growth rate, doubling time and reproduction number |
| Vaccine analysis | Doses by vaccine type per country and year |

## Repository layout

```
GUI/backend/    Express API (routes -> controllers -> models, mysql2 pool)
GUI/frontend/   Vue 3 SPA (components, services, router)
database/       schema.sql (tables) and import.sql (loads the CSVs)
CSV/            CSV data used by import.sql
27_eu.py        ETL script: aggregates vaccination data for the EU
cases_death.py  ETL script: aggregates daily cases/deaths to yearly values
setup_instructions.md  Detailed local setup guide
Datenbank_ML03-2.pdf   Project report (German)
```

## Getting started

**Prerequisites:** Node.js (e.g. `brew install node`) and a running MySQL 8 / MariaDB server.

```bash
# 1. Database (from the repository root)
mysql -u root -p < database/schema.sql
mysql --local-infile=1 -u root -p < database/import.sql   # prints row counts 31 / 162 / 7306 / 948

# 2. Backend -> http://localhost:8081
cd GUI/backend
cp .env.example .env        # then edit DB_USER / DB_PASSWORD (DB_NAME defaults to htwdb2)
npm install
npm start                   # check http://localhost:8081/api/dbtest

# 3. Frontend -> http://localhost:8080 (new terminal)
cd GUI/frontend
npm install
npm start
```

The Vite dev server proxies `/api` to the backend, so the backend must run on port 8081 and the frontend on 8080. If the server rejects `LOCAL INFILE`, enable it with `SET GLOBAL local_infile = 1;` as an admin user.

Configuration lives in `GUI/backend/.env` (git-ignored). Never commit real credentials.

## Database

| Table | Content |
|---|---|
| `countries` | `country_code`, `country_name`, `is_eu` (30 countries + the "European Union (27)" aggregate) |
| `cases_death_country_year` | Yearly cases/deaths per million (peak, average, total) per country |
| `vaccination` | Yearly doses per country, target/age group and vaccine |
| `vaccination_eu_summary` | EU-wide aggregate of the above |
| `vaccination_country_age` | Weekly uptake by age group; **empty** (no source CSV shipped) |

## API

- `GET /api/countries`, `/api/countries/:code`
- `GET /api/covid-cases`, `/years`, `/year/:year`, `/mortality/:country/:year`, `/mortality-history/:country`
- `GET /api/vaccination-country-age`, `/countries`, `/years`, `/vaccine-distribution`
- `GET /api/dbtest`

## Method and limitations

CFR = deaths / cases; survival = 100 % − CFR; age-adjusted CFR = baseline CFR × age multiplier; vaccine protection uses assumed vaccine-effectiveness values. See section 9 of the report.

These are simple, **indicative** estimates. The data contains no link between deaths and individual vaccination status, so no causal claims about vaccine effectiveness can be made. Reporting delays and differing testing strategies also bias cases and deaths. Some views fall back to sample data when the database has no matching rows.

## Data sources

- Cases and deaths: [Our World in Data – COVID-19 deaths](https://ourworldindata.org/covid-deaths)
- Vaccinations: [ECDC COVID-19 Vaccine Tracker](https://vaccinetracker.ecdc.europa.eu/public/extensions/COVID-19/vaccine-tracker.html#uptake-tab)
- Population: [Eurostat](https://ec.europa.eu/eurostat) (demographic data)
- Epidemiological reference data: [WHO COVID-19 Dashboard](https://data.who.int/dashboards/covid19/data)

The raw data belongs to the respective providers; please check their terms of use before reusing it. `cases_death.py` and `27_eu.py` show how the CSVs in `CSV/` were prepared.

## Contributors

- **Duc Nguyen**
- **Quoc Thong Truong**

Supervisor: Prof. Dr. Thomas Baar, HTW Berlin.

The backend structure is based on the bezkoder tutorial [Node.js REST APIs with Express & MySQL](https://www.bezkoder.com/node-js-rest-api-express-mysql/).

## License

No license has been specified yet. Until one is added, all rights are reserved by the authors.
