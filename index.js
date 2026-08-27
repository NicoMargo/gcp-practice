const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 8080;

// Connect to the DB using environment variables
// Note: DB_PASS will be securely injected by Secret Manager
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get('/', async (req, res) => {
  try {
    // Attempt a simple query to prove the connection works
    const result = await pool.query('SELECT NOW() as time');
    res.json({
      status: 'success',
      message: 'Connected to private Cloud SQL securely!',
      dbTime: result.rows[0].time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
