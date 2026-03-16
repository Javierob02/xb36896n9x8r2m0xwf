// server.js
const http = require('http');
const localtunnel = require('localtunnel');

const port = process.env.PORT || 3000;

// Minimal listener to satisfy Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Tunnel server running');
}).listen(port, async () => {
  console.log(`Render port listener active on ${port}`);

  // Start localtunnel server for your API
  const tunnel = await localtunnel({
    port: 5404,       // your local API port on your Mac (or mapped container port)
    host: '0.0.0.0',  // listen on all interfaces
  });

  console.log('LocalTunnel server ready at URL:', tunnel.url);
});
