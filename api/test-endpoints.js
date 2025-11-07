const http = require('http');

function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === expectedStatus) {
            console.log(`✅ ${path} - Status ${res.statusCode}`);
            console.log(JSON.stringify(parsed, null, 2));
            resolve(parsed);
          } else {
            console.log(`❌ ${path} - Expected ${expectedStatus}, got ${res.statusCode}`);
            console.log(JSON.stringify(parsed, null, 2));
            reject(new Error(`Unexpected status code: ${res.statusCode}`));
          }
        } catch (error) {
          console.error(`❌ ${path} - Parse error:`, error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${path} - Request error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Starting API tests...\n');

  try {
    // Test 1: Health check
    await testEndpoint('/health');
    console.log('');

    // Test 2: Get tenant by subdomain
    await testEndpoint('/api/tenants/claire');
    console.log('');

    // Test 3: Get tenant by domain
    await testEndpoint('/api/tenants/domain/clairehamilton.vip');
    console.log('');

    // Test 4: List all tenants
    await testEndpoint('/api/tenants');
    console.log('');

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed');
    process.exit(1);
  }
}

// Give server time to start if needed
setTimeout(runTests, 1000);
