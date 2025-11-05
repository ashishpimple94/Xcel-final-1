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
    
    // If already connected, check if it's still valid
    if (cached.conn) {
      // Check if connection is still alive
      if (cached.conn.connection.readyState === 1) {
        return cached.conn;
      } else {
        // Connection is dead, reset it
        console.log('⚠️ Cached connection is dead, reconnecting...');
        cached.conn = null;
        cached.promise = null;
      }
    }
    
    // If connection is in progress, wait for it
    if (!cached.promise) {
      const opts = {
        bufferCommands: false, // Don't buffer commands - fail fast if not connected
        serverSelectionTimeoutMS: 30000, // 30 seconds timeout
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        w: 'majority',
      };
      
      console.log('🔗 Connecting to MongoDB...');
      console.log('   URI format:', mongoURI.trim().substring(0, 30) + '...');
      
      cached.promise = mongoose.connect(mongoURI.trim(), opts)
        .then((mongoose) => {
          console.log('✅ MongoDB Connected Successfully!');
          console.log('   Host:', mongoose.connection.host);
          console.log('   Database:', mongoose.connection.name);
          console.log('   Ready State:', mongoose.connection.readyState);
          return mongoose;
        })
        .catch((err) => {
          // Clear promise on error so it can retry
          cached.promise = null;
          throw err;
        });
    }
    
    cached.conn = await cached.promise;
    
    // Ensure connection is actually ready
    if (cached.conn.connection.readyState !== 1) {
      // Connection not ready, wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 100));
      if (cached.conn.connection.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }
    }
    
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code || 'N/A');
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    
    // Detailed error information
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication Error Details:');
      console.error('   - Check username and password in MONGODB_URI');
      console.error('   - Ensure password special characters are URL encoded');
      console.error('   - Verify user has proper permissions in MongoDB Atlas');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.error('\n💡 Network Error Details:');
      console.error('   - Check MongoDB Atlas Network Access (allow 0.0.0.0/0)');
      console.error('   - Verify MONGODB_URI is correct');
      console.error('   - Check internet connection');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('\n💡 DNS/Network Error:');
      console.error('   - Check MongoDB cluster hostname');
      console.error('   - Verify network connectivity');
    }
    
    // Don't exit process in serverless - let it retry
    const isServerless = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL;
    if (!isServerless) {
      process.exit(1);
    }
    
    throw error;
  }
};

export default connectDB;

