const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'WebsiteDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// Use Windows Auth (Trusted Connection) or SQL login
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
  config.options.trustedConnection = true;
} else {
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}

let pool = null;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✅ Connected to SQL Server — WebsiteDB');
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      throw err;
    }
  }
  return pool;
}

module.exports = { getPool, sql };
