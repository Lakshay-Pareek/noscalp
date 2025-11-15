const http = require('http');
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { id: 'org-001', role: 'organizer' },
  'your-super-secret-key-change-in-production',
  { expiresIn: '24h' }
);

console.log('Generated Token:', token);
console.log('\n=== Testing API Endpoints ===\n');

// Test 1: Health Check
console.log('1. Testing Health Check...');
const healthReq = http.get('http://localhost:3001/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Health Check Response:', data);
    console.log('');
    
    // Test 2: Mint Ticket
    testMintTicket();
  });
});

healthReq.on('error', (err) => {
  console.error('❌ Health Check Error:', err.message);
});

function testMintTicket() {
  console.log('2. Testing Mint Ticket Endpoint...');
  
  const payload = JSON.stringify({
    ticketId: 'test-ticket-001',
    buyerPubKey: 'addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt',
    metadata: {
      title: 'Test Concert 2024',
      seat: 'A1',
      image: 'ipfs://QmTest'
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tickets/mint',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('✅ Mint Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      console.log('');
      
      // Test 3: Get Ticket
      testGetTicket();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Mint Error:', err.message);
  });

  req.write(payload);
  req.end();
}

function testGetTicket() {
  console.log('3. Testing Get Ticket Endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tickets/test-ticket-001',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('✅ Get Ticket Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      console.log('');
      
      // Test 4: Request Resale
      testRequestResale();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Get Ticket Error:', err.message);
  });

  req.end();
}

function testRequestResale() {
  console.log('4. Testing Request Resale Endpoint...');
  
  const payload = JSON.stringify({
    ticketId: 'test-ticket-001',
    buyerProof: {
      type: 'ownership_proof',
      ticketId: 'test-ticket-001',
      signature: 'mock-signature',
      timestamp: Date.now()
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tickets/request-resale',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('✅ Request Resale Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      console.log('');
      
      // Test 5: Transfer Ticket
      testTransferTicket();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request Resale Error:', err.message);
  });

  req.write(payload);
  req.end();
}

function testTransferTicket() {
  console.log('5. Testing Transfer Ticket Endpoint...');
  
  const payload = JSON.stringify({
    ticketId: 'test-ticket-001',
    newBuyerPubKey: 'addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt',
    transferProof: {
      type: 'transfer_proof',
      ticketId: 'test-ticket-001',
      newOwnerCommitment: 'new-commitment-hash',
      signature: 'mock-signature',
      timestamp: Date.now()
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tickets/transfer',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('✅ Transfer Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      console.log('');
      
      // Test 6: Cancel Ticket
      testCancelTicket();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Transfer Error:', err.message);
  });

  req.write(payload);
  req.end();
}

function testCancelTicket() {
  console.log('6. Testing Cancel Ticket Endpoint...');
  
  const payload = JSON.stringify({
    ticketId: 'test-ticket-001'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tickets/cancel',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('✅ Cancel Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response:', data);
      }
      console.log('\n=== All Tests Complete ===');
    });
  });

  req.on('error', (err) => {
    console.error('❌ Cancel Error:', err.message);
  });

  req.write(payload);
  req.end();
}
