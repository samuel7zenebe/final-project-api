const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoidGVzdDJAdGVzdC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3ODU3NzczNiwiZXhwIjoxNzc4NjY0MTM2fQ.bTnA_g-CFCGMdwMJaONzq_GCtI9sTj3bF8Hf5uGOAb4';

const blogData = JSON.stringify({
  title: 'Draft Blog Test',
  content: 'This is a draft blog post content.',
  excerpt: 'Draft excerpt'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/blogs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': blogData.length,
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(blogData);
req.end();