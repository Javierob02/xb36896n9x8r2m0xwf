// server.js
const { startServer } = require('localtunnel-server');

// Render will set the PORT environment variable
const port = process.env.PORT || 3000;

startServer({ port })
  .then(() => {
    console.log(`✅ LocalTunnel server running on port ${port}`);
  })
  .catch((err) => {
    console.error('❌ Error starting LocalTunnel server:', err);
  });
