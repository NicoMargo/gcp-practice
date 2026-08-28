const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 8080;

// IMPORTANT: We need this to parse JSON bodies from Pub/Sub POST requests
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
});

// The GET route (For human testing via browser)
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ status: 'success', message: 'Connected to private DB!', time: result.rows[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB connection failed' });
  }
});

// The POST route (For Pub/Sub)
app.post('/', (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      console.log('Bad Request: Missing Pub/Sub message body');
      return res.status(400).send('Bad Request: Missing Pub/Sub message body');
    }

    // Pub/Sub sends the actual payload encoded in Base64
    const pubSubMessage = req.body.message;
    const dataString = pubSubMessage.data
      ? Buffer.from(pubSubMessage.data, 'base64').toString()
      : 'No data';

    console.log(`Received Pub/Sub message: ${dataString}`);

    // In a real app, you would insert this into the DB here!

    // MUST return a 2xx status code to tell Pub/Sub "I got it!"
    res.status(200).send('Message Processed successfully.');

  } catch (error) {
    console.error('Error processing Pub/Sub message:', error);
    // Returning 500 tells Pub/Sub to retry later
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
