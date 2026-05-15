const http = require('http');

// Step 1: Login
const loginData = JSON.stringify({
  email: 'test2@test.com',
  password: 'test123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const result = JSON.parse(body);
    const token = result.token;
    console.log('Token obtained:', token.substring(0, 20) + '...');

    // Step 2: Create draft blog
    const blogData = JSON.stringify({
      title: 'Draft Blog Test',
      content: 'This is a draft blog post content.',
      excerpt: 'Draft excerpt'
    });

    const blogOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/blogs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(blogData),
        'Authorization': 'Bearer ' + token
      }
    };

    const blogReq = http.request(blogOptions, (blogRes) => {
      let blogBody = '';
      blogRes.on('data', chunk => blogBody += chunk);
      blogRes.on('end', () => {
        console.log('Blog creation status:', blogRes.statusCode);
        console.log('Blog creation response:', blogBody);
      });
    });

    blogReq.on('error', (e) => console.error(e));
    blogReq.write(blogData);
    blogReq.end();
  });
});

loginReq.on('error', (e) => console.error(e));
loginReq.write(loginData);
loginReq.end();