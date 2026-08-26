import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, TICKET_CODE_PATTERN, type QrAccessMode } from "@shared/const";
import { completePotatoOrder, createPotatoOrder, getPotatoOrders, clearPotatoOrders } from "./db";
import { assertQrSession, getQrSession } from "./qrAccess";
import { publishOrderChange } from "./realtime";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

function assertQrAccess(request: Parameters<typeof assertQrSession>[0], allowedModes: QrAccessMode[]) {
  try {
    return assertQrSession(request, allowedModes);
  } catch {
    throw new TRPCError({ code: "FORBIDDEN", message: "QRコードからアクセスしてください。" });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    access: publicProcedure.query(({ ctx }) => ({ mode: getQrSession(ctx.req)?.mode ?? null })),

    list: publicProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        assertQrAccess(ctx.req, ["buyer", "admin", "combined"]);
        const orders = await getPotatoOrders(input.search);
        return {
          orders,
          pending: orders.filter(order => order.status === "pending"),
          completed: orders.filter(order => order.status === "completed"),
        };
      }),

    register: publicProcedure
      .input(z.object({ ticketCode: z.string().min(1).max(4) }))
      .mutation(async ({ ctx, input }) => {
        assertQrAccess(ctx.req, ["buyer", "combined"]);
        const ticketCode = input.ticketCode.trim().toUpperCase();
        if (!TICKET_CODE_PATTERN.test(ticketCode)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "英字1文字＋3桁番号で入力してください。例：A123" });
        }

        try {
          const orderId = await createPotatoOrder({
            ticketCode,
            status: "pending",
            receivedAt: Date.now(),
            completedAt: null,
          });
          publishOrderChange();
          return { success: true as const, orderId: Number(orderId ?? 0), ticketCode };
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.toLowerCase().includes("duplicate") || message.includes("ticketCode")) {
            throw new TRPCError({ code: "CONFLICT", message: "このチケットはすでに受付済みです。" });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "受付登録に失敗しました。" });
        }
      }),

    complete: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        assertQrAccess(ctx.req, ["admin", "combined"]);
        const affectedRows = await completePotatoOrder(input.id);
        if (!affectedRows) {
          throw new TRPCError({ code: "NOT_FOUND", message: "受付データが見つかりません。" });
        }
        publishOrderChange();
        return { success: true as const };
      }),

    clearAll: publicProcedure
      .mutation(async ({ ctx }) => {
        assertQrAccess(ctx.req, ["combined"]);
        const deletedRows = await clearPotatoOrders();
        publishOrderChange();
        return { success: true as const, deletedRows };
      }),
  }),
});

export type AppRouter = typeof appRouter;
