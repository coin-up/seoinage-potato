import { describe, expect, it, beforeEach, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { createQrSessionCookie } from "./qrAccess";

const mockState = vi.hoisted(() => ({
  rows: [] as Array<{ id: number; ticketCode: string; status: "pending" | "completed"; receivedAt: number; completedAt: number | null }>,
  nextId: 1,
}));

vi.mock("./db", () => ({
  getPotatoOrders: vi.fn(async (search?: string) => {
    const query = search?.trim().toUpperCase();
    return mockState.rows.filter(row => !query || row.ticketCode.includes(query));
  }),
  createPotatoOrder: vi.fn(async (order: { ticketCode: string; status: "pending" | "completed"; receivedAt: number; completedAt: number | null }) => {
    const id = mockState.nextId++;
    mockState.rows.push({ id, ...order });
    return id;
  }),
  completePotatoOrder: vi.fn(async (id: number) => {
    const row = mockState.rows.find(item => item.id === id);
    if (!row) return 0;
    row.status = "completed";
    row.completedAt = Date.now();
    return 1;
  }),
  clearPotatoOrders: vi.fn(async () => {
    const count = mockState.rows.length;
    mockState.rows = [];
    return count;
  }),
}));

function createContext(mode?: "buyer" | "admin" | "combined"): TrpcContext {
  const cookie = mode ? `__Host-potato_qr=${createQrSessionCookie(mode)}` : "";
  return {
    user: undefined,
    req: { protocol: "https", headers: cookie ? { cookie } : {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  mockState.rows = [];
  mockState.nextId = 1;
});

describe("orders QR session API", () => {
  it("rejects a direct URL/API request without a QR session", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.orders.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("registers a valid ticket and returns its id", async () => {
    const caller = appRouter.createCaller(createContext("buyer"));
    const result = await caller.orders.register({ ticketCode: "a123" });
    expect(result).toMatchObject({ success: true, orderId: 1, ticketCode: "A123" });
  });

  it("searches tickets by a partial code", async () => {
    const caller = appRouter.createCaller(createContext("combined"));
    await caller.orders.register({ ticketCode: "A123" });
    await caller.orders.register({ ticketCode: "B234" });
    const result = await caller.orders.list({ search: "b2" });
    expect(result.orders.map(order => order.ticketCode)).toEqual(["B234"]);
  });

  it("moves an order from pending to completed", async () => {
    const caller = appRouter.createCaller(createContext("combined"));
    const created = await caller.orders.register({ ticketCode: "C345" });
    await caller.orders.complete({ id: created.orderId });
    const result = await caller.orders.list({});
    expect(result.pending).toHaveLength(0);
    expect(result.completed[0]).toMatchObject({ ticketCode: "C345", status: "completed" });
  });

  it("clears all orders from the combined page", async () => {
    const caller = appRouter.createCaller(createContext("combined"));
    await caller.orders.register({ ticketCode: "D456" });
    await caller.orders.register({ ticketCode: "E567" });
    const cleared = await caller.orders.clearAll();
    expect(cleared).toMatchObject({ success: true, deletedRows: 2 });
    expect((await caller.orders.list({})).orders).toHaveLength(0);
  });

  it("does not allow the buyer session to complete an order", async () => {
    const caller = appRouter.createCaller(createContext("buyer"));
    await expect(caller.orders.complete({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
