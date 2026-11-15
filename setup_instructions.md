# Local setup (backend, frontend, database)

See the root `README.md` for the short version.

1. **Install Node.js**: `brew install node` (installs node and npm).
2. **Create the database** (MySQL 8 / MariaDB must be running). From the repository root:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql --local-infile=1 -u root -p < database/import.sql
   ```
   The import prints the row counts (31 / 162 / 7306 / 948).
3. **Start the backend** (port 8081):
   ```bash
   cd GUI/backend
   cp .env.example .env      # set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (default DB_NAME: htwdb2)
   npm install
   npm start
   ```
   Check `http://localhost:8081/api/dbtest` -> `{"connected":true}`.
4. **Start the frontend** (port 8080) in a second terminal:
   ```bash
   cd GUI/frontend
   npm install
   npm start                 # or: npm run dev
   ```
   Open `http://localhost:8080/`.
5. **Stop** either server with `CTRL + C`.

Notes: the backend must run on port 8081 and the frontend on 8080 (the Vite dev server proxies `/api` to 8081). `.env` is git-ignored; never commit real credentials.
