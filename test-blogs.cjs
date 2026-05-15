const http = require('http');

http.get('http://localhost:5000/api/blogs', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total:', json.total || 'N/A');
      console.log('Blogs count:', json.blogs.length);
      json.blogs.slice(0,5).forEach(b => console.log(`- ID ${b.id}: ${b.title} (${b.status})`));
    } catch(e) {
      console.log('Raw response:', data.substring(0,500));
    }
  });
}).on('error', (e) => console.error('Request error:', e.message));