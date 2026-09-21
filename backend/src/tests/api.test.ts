import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Melomix Backend Automated Test Suite...\n');

  let passed = 0;
  let failed = 0;

  // 1. Health Check Test
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200 && res.data.status === 'healthy') {
      console.log('✅ PASS: GET /api/health returned healthy');
      passed++;
    } else {
      throw new Error('Unexpected health response');
    }
  } catch (err: any) {
    console.error('❌ FAIL: GET /api/health -', err.message);
    failed++;
  }

  // 2. Songs API Test
  try {
    const res = await axios.get(`${BASE_URL}/songs?limit=5`);
    if (res.status === 200 && res.data.data.length > 0) {
      console.log(`✅ PASS: GET /api/songs returned ${res.data.data.length} tracks (Total: ${res.data.meta.total})`);
      passed++;
    } else {
      throw new Error('Failed to retrieve songs');
    }
  } catch (err: any) {
    console.error('❌ FAIL: GET /api/songs -', err.message);
    failed++;
  }

  // 3. User Login Test
  let token = '';
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@melomix.com',
      password: 'password123',
    });
    if (res.status === 200 && res.data.data.token) {
      token = res.data.data.token;
      console.log(`✅ PASS: POST /api/auth/login authenticated user (${res.data.data.user.name})`);
      passed++;
    } else {
      throw new Error('No token returned');
    }
  } catch (err: any) {
    console.error('❌ FAIL: POST /api/auth/login -', err.message);
    failed++;
  }

  // 4. Authenticated Me Test
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 200 && res.data.data.email === 'user@melomix.com') {
      console.log('✅ PASS: GET /api/auth/me verified active session');
      passed++;
    } else {
      throw new Error('Unauthorized or mismatched user');
    }
  } catch (err: any) {
    console.error('❌ FAIL: GET /api/auth/me -', err.message);
    failed++;
  }

  // 5. Playlist Creation Test
  try {
    const res = await axios.post(
      `${BASE_URL}/playlists`,
      {
        name: `Automated Test Playlist ${Date.now()}`,
        description: 'Testing playlist creation pipeline',
        isPublic: true,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 201 && res.data.data._id) {
      console.log(`✅ PASS: POST /api/playlists created playlist ("${res.data.data.name}")`);
      passed++;
    } else {
      throw new Error('Failed to create playlist');
    }
  } catch (err: any) {
    console.error('❌ FAIL: POST /api/playlists -', err.message);
    failed++;
  }

  // 6. AI Recommendations Test
  try {
    const res = await axios.get(`${BASE_URL}/recommendations?limit=6`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 200 && res.data.data.recommendations.length > 0) {
      console.log(`✅ PASS: GET /api/recommendations returned ${res.data.data.recommendations.length} AI matches (Source: ${res.data.data.source})`);
      passed++;
    } else {
      throw new Error('No recommendations generated');
    }
  } catch (err: any) {
    console.error('❌ FAIL: GET /api/recommendations -', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed | ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests();
