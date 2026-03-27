import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
	id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	sku: text().notNull().unique(),
	category: text().notNull(),
	quantity: integer({ mode: "number" }).notNull().default(0),
	price: real().notNull().default(0),
	lowStockThreshold: integer("low_stock_threshold", { mode: "number" }).notNull().default(10),
	createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
