const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_career_portal');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Do not crash the application in development, allow mock database behaviors or retries
    console.warn('[Database Warning] Running in memory-mock/standalone mode if connection is unavailable.');
  }
};

module.exports = connectDB;
