import { bigint, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const potatoOrders = pgTable("potatoOrders", {
  id: serial("id").primaryKey(),
  ticketCode: varchar("ticketCode", { length: 4 }).notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  receivedAt: bigint("receivedAt", { mode: "number" }).notNull(),
  completedAt: bigint("completedAt", { mode: "number" }),
});

export type PotatoOrder = typeof potatoOrders.$inferSelect;
export type InsertPotatoOrder = typeof potatoOrders.$inferInsert;
