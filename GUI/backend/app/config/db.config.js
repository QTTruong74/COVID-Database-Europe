// Read configuration from environment variables with sensible defaults.
// Set these in your shell or use a .env file (with dotenv) in development.
module.exports = {
  HOST: process.env.DB_HOST || "127.0.0.1",
  PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "htwdb2",
};