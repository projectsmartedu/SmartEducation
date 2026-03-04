const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let cached = global.__mongoose;
if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const directUri = process.env.MONGODB_URI_DIRECT;
  
  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const options = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      autoIndex: false
    };

    const tryConnect = async (connUri) => {
      try {
        const mongooseInstance = await mongoose.connect(connUri, options);
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      } catch (err) {
        // Handle SRV/DNS failures by attempting a direct URI fallback if provided
        const isSrvError = /querySrv|EREFUSED|ETIMEDOUT|getaddrinfo/i.test(err.message);
        if (isSrvError && directUri) {
          console.warn('SRV/DNS lookup failed. Trying direct connection URI fallback...');
          try {
            const mongooseInstance = await mongoose.connect(directUri, options);
            console.log(`MongoDB Connected via direct URI: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
          } catch (directErr) {
            console.error('Direct URI also failed:', directErr.message);
            throw err;
          }
        }
        throw err;
      }
    };

    // Try direct URI first since DNS is broken locally
    cached.promise = directUri ? tryConnect(directUri) : tryConnect(uri);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
