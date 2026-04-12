const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Spliwise API is running' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` ✅ Server is running on port http://localhost:${PORT}`);
}); 