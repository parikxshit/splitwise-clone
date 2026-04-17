const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test the connection
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

connectDB();

module.exports = prisma;
