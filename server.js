import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import connectDB from './config/db.js';
import voterRoutes from './routes/voterRoutes.js';

// Load environment variables (only in development, production uses system env vars)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Excel Upload API',
    endpoints: {
      uploadExcel: 'POST /api/voters/upload',
      getAllVoters: 'GET /api/voters',
      getVoterById: 'GET /api/voters/:id',
      deleteAllVoters: 'DELETE /api/voters',
    },
  });
});

app.use('/api/voters', voterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// Start server (only in non-serverless environments)
const PORT = process.env.PORT || 8000;

// Export app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}         ║
║   📁 Excel Upload API is ready!            ║
║   🔗 http://localhost:${PORT}               ║
╚════════════════════════════════════════════╝
    `);
  });
}

