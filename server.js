import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ 
  server,
  maxPayload: 10 * 1024 * 1024 // 10 MB
});

let client = null;
const pendingRequests = new Map();

app.use(express.raw({ type: "*/*" }));

wss.on("connection", (ws) => {
  console.log("✅ Tunnel client connected");
  client = ws;

  ws.on("message", (message) => {
    try {
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

    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on("close", () => {
    console.log("❌ Tunnel client disconnected");
    client = null;
  });
});

app.all("*", (req, res) => {
  if (!client) {
    res.status(503).send("No tunnel client connected");
    return;
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
});
