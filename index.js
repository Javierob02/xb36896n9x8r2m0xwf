import createServer from './server.js';

const port = process.env.PORT || 3000;

// create LocalTunnel server
const server = createServer({
  secure: true
});

server.listen(port, () => {
  console.log(`✅ LocalTunnel server running on port ${port}`);
});
