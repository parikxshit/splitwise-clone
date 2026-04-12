const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables from .env file
dotenv.config();

const pool = require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Spliwise API is running' });
});

// ADD THIS TEST ROUTE
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: '✅ Database connected!',
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Database error', error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` ✅ Server is running on port http://localhost:${PORT}`);
}); 