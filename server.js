// server.js
const localtunnel = require('localtunnel');

(async () => {
  const port = process.env.PORT || 3000; // default to 3000 if PORT not defined
  const tunnel = await localtunnel({ port });
  console.log('LocalTunnel server running at:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();
