const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables from .env file
dotenv.config();

const prisma = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const apiRoutes = require('./src/routes');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Spliwise API is running' });
});

// ADD THIS TEST ROUTE
app.get('/db-test', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    res.json({
      message: '✅ Database connected!',
      time: result[0].now
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Database error', error: err.message });
  }
});

// Global Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(` ✅ Server is running on port http://localhost:${PORT}`);
}); 
