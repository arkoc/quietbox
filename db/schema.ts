import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// Intentionally no sender, IP, user-agent, referrer, or account columns.
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), body: text("body").notNull(),
  day: text("day").notNull(), isRead: integer("is_read").notNull().default(0),
}, (t) => [check("message_length", sql`length(${t.body}) BETWEEN 1 AND 8000`)]);
// Short-lived random proof fingerprints prevent replay; never linked to messages.
export const usedProofs = sqliteTable("used_proofs", {
  signature: text("signature").primaryKey(), expiresAt: integer("expires_at").notNull(),
});
// Global counters, never per-IP or per-device.
export const limits = sqliteTable("limits", {
  bucket: text("bucket").primaryKey(), count: integer("count").notNull(),
  capacity: integer("capacity").notNull(), expiresAt: integer("expires_at").notNull(),
}, (t) => [check("within_capacity", sql`${t.count} <= ${t.capacity}`)]);
