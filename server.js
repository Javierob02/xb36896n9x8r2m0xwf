// server.js
const localtunnel = require('localtunnel');

(async () => {
  const port = process.env.PORT || 3000;

  // start your own tunnel server
  const tunnel = await localtunnel({ port, host: '0.0.0.0' });

  console.log('LocalTunnel server running at URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
