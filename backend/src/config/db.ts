import mongoose from 'mongoose';
import { env } from './env';

let mongoServer: any = null;

export const connectDB = async (): Promise<string> => {
  if (env.MONGODB_URI && env.MONGODB_URI.trim() !== '') {
    // Development or Production with configured MONGODB_URI
    console.log('[Database] Connecting to external MongoDB instance...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Database] Successfully connected to external MongoDB');
    return env.MONGODB_URI;
  }

  // No MONGODB_URI provided
  if (env.NODE_ENV === 'production') {
    throw new Error(
      '[Fatal Configuration Error] MONGODB_URI is required in production mode. Melomix will not silently fallback to an in-memory database in production.'
    );
  }

  // Development mode fallback: Start mongodb-memory-server
  console.log('[Database] No MONGODB_URI specified in development. Initializing mongodb-memory-server fallback...');
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to in-memory MongoDB at ${uri}`);
    return uri;
  } catch (err: any) {
    console.error('[Database] Failed to start in-memory MongoDB:', err.message);
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
