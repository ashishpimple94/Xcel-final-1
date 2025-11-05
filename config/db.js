import mongoose from 'mongoose';

// Cache connection for serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    // Support multiple environment variable names
    const mongoURI = process.env.MONGODB_URI 
      || process.env.MONGO_URL 
      || process.env.MONGODB_URL
      || process.env.DATABASE_URL;
    
    // Critical check: mongoURI must be defined and a string
    if (!mongoURI || typeof mongoURI !== 'string' || mongoURI.trim() === '') {
      console.error('❌ ERROR: MongoDB URI is not set!');
      console.error('Please set MONGODB_URI environment variable.');
      throw new Error('MongoDB URI is not configured');
    }
    
    // If already connected, return cached connection
    if (cached.conn) {
      return cached.conn;
    }
    
    // If connection is in progress, wait for it
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      };
      
      cached.promise = mongoose.connect(mongoURI.trim(), opts).then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully!');
        return mongoose;
      });
    }
    
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    // Don't exit process in serverless - let it retry
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    
    throw error;
  }
};

export default connectDB;

