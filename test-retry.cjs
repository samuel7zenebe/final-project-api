const http = require('http');

function test() {
  http.get('http://localhost:5000/api/blogs', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('Response keys:', Object.keys(json));
        console.log('Blogs count:', json.blogs.length);
        json.blogs.forEach(b => console.log(`ID ${b.id}: ${b.title} (${b.status})`));
      } catch(e) {
        console.log('Raw:', data.substring(0,200));
      }
    });
  }).on('error', (e) => {
    console.log('Connection error, retrying in 2s...');
    setTimeout(test, 2000);
  });
}

test();