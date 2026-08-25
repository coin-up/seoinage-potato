import type { Express, Request, Response } from "express";
import { assertQrSession } from "./qrAccess";

const clients = new Set<Response>();

export function publishOrderChange() {
  const message = `event: orders\ndata: ${JSON.stringify({ changedAt: Date.now() })}\n\n`;
  clients.forEach(client => {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  });
}

export function registerRealtimeRoutes(app: Express) {
  app.get("/api/realtime", (request: Request, response: Response) => {
    try {
      assertQrSession(request, ["buyer", "admin", "combined"]);
    } catch {
      response.status(403).end();
      return;
    }

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();
    response.write(`event: ready\ndata: ${JSON.stringify({ connectedAt: Date.now() })}\n\n`);
    clients.add(response);

    const heartbeat = setInterval(() => {
      try {
        response.write(": heartbeat\n\n");
      } catch {
        clearInterval(heartbeat);
        clients.delete(response);
      }
    }, 15_000);

    request.on("close", () => {
      clearInterval(heartbeat);
      clients.delete(response);
    });
  });
}
