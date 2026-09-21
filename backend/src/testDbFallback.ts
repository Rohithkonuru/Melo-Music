import { connectDB, disconnectDB } from './config/db';

async function testFallback() {
  console.log('--- TEST 1: Production without MONGODB_URI ---');
  process.env.NODE_ENV = 'production';
  process.env.MONGODB_URI = '';
  // re-require env
  const { env } = await import('./config/env');
  env.NODE_ENV = 'production';
  env.MONGODB_URI = '';

  try {
    await connectDB();
    console.error('TEST 1 FAILED: Allowed production without MONGODB_URI!');
    process.exit(1);
  } catch (err: any) {
    console.log('TEST 1 PASSED: Caught expected error ->', err.message);
  }

  console.log('\n--- TEST 2: Development without MONGODB_URI (Memory Fallback) ---');
  env.NODE_ENV = 'development';
  env.MONGODB_URI = '';
  try {
    const uri = await connectDB();
    console.log('TEST 2 PASSED: Connected to memory server URI ->', uri);
    await disconnectDB();
  } catch (err: any) {
    console.error('TEST 2 FAILED:', err.message);
    process.exit(1);
  }

  console.log('\nALL DB FALLBACK TESTS PASSED!');
  process.exit(0);
}

testFallback();
