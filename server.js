const { startServer } = require('localtunnel-server');

const port = process.env.PORT || 3000;

startServer({
  port,
  host: '0.0.0.0',
}).then(() => {
  console.log(`LocalTunnel server running on port ${port}`);
});
