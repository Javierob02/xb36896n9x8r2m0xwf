// server.js
const localtunnel = require('localtunnel');

(async () => {
  const port = process.env.PORT || 3000; // Render sets this automatically
  const tunnel = await localtunnel({ port });

  console.log('LocalTunnel server running at URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
