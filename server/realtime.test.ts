import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { createQrSessionCookie } from "./qrAccess";
import { publishOrderChange, registerRealtimeRoutes } from "./realtime";

type RouteHandler = (request: any, response: any) => void;

function createSseHarness() {
  let handler: RouteHandler | undefined;
  registerRealtimeRoutes({
    get: (_path: string, route: RouteHandler) => {
      handler = route;
    },
  } as any);

  const request = new EventEmitter() as EventEmitter & { headers: Record<string, string> };
  request.headers = { cookie: `__Host-potato_qr=${createQrSessionCookie("admin")}` };

  const writes: string[] = [];
  const response = {
    setHeader: () => undefined,
    flushHeaders: () => undefined,
    write: (chunk: string) => writes.push(chunk),
    status: () => response,
    end: () => undefined,
  };

  handler?.(request, response);
  return { request, writes };
}

describe("realtime order events", () => {
  it("accepts a QR session and broadcasts order changes to connected clients", () => {
    const { request, writes } = createSseHarness();

    expect(writes[0]).toMatch(/^event: ready\ndata:/);
    publishOrderChange();
    expect(writes.some(write => write.startsWith("event: orders\ndata:"))).toBe(true);

    request.emit("close");
  });
});
