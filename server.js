import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let client = null;
const pendingRequests = new Map();

// Accept raw body (JSON, text, etc.)
app.use(express.raw({ type: "*/*" }));

wss.on("connection", (ws) => {
  console.log("✅ Tunnel client connected");
  client = ws;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    const pending = pendingRequests.get(data.requestId);
    if (!pending) return;

    const { res } = pending;

    res.status(data.status);

    for (const [key, value] of Object.entries(data.headers || {})) {
      try {
        res.setHeader(key, value);
      } catch {}
    }

    res.send(data.body);
    pendingRequests.delete(data.requestId);
  });

  ws.on("close", () => {
    console.log("❌ Tunnel client disconnected");
    client = null;
  });
});

// Catch ALL routes
app.all("*", (req, res) => {
  if (!client) {
    return res.status(503).send("No tunnel client connected");
  }

  const requestId = Math.random().toString(36).slice(2);

  pendingRequests.set(requestId, { res });

  const payload = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    body: req.body.toString(),
  };

  client.send(JSON.stringify(payload));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Tunnel server running on port ${PORT}`);
});        const hostname = req.headers.host;

        if (!hostname) {
            res.statusCode = 400;
            res.end('Host header required');
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);

        if (!clientId) {
            appCallback(req, res);
            return;
        }

        const client = manager.getClient(clientId);

        if (!client) {
            res.statusCode = 404;
            res.end('Tunnel not found');
            return;
        }

        client.handleRequest(req, res);
    });

    server.on('upgrade', (req, socket) => {

        const hostname = req.headers.host;

        if (!hostname) {
            socket.destroy();
            return;
        }

        const clientId = GetClientIdFromHostname(hostname);

        if (!clientId) {
            socket.destroy();
            return;
        }

        const client = manager.getClient(clientId);

        if (!client) {
            socket.destroy();
            return;
        }

        client.handleUpgrade(req, socket);
    });

    return server;
}
