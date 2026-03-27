import "dotenv/config";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { products } from "../db/schema.ts";

const db = drizzle(process.env.DATABASE_URL || "dev.db");

// Seed for reproducible results
faker.seed(42);

const CATEGORIES = ["Electronics", "Accessories", "Office", "Furniture", "Storage"] as const;

function generateSKU(category: string, index: number): string {
	const prefix = category.slice(0, 2).toUpperCase();
	return `${prefix}-${String(index).padStart(3, "0")}`;
}

function generateProduct(index: number) {
	const category = faker.helpers.arrayElement([...CATEGORIES]);

	const quantity = faker.helpers.weightedArrayElement([
		{ weight: 5, value: faker.number.int({ min: 20, max: 500 }) },
		{ weight: 3, value: faker.number.int({ min: 1, max: 15 }) },
		{ weight: 2, value: 0 },
	]);

	const lowStockThreshold = faker.helpers.arrayElement([5, 10, 15, 20, 25, 30, 50]);

	return {
		name: faker.commerce.productName(),
		sku: generateSKU(category, index),
		category,
		quantity,
		price: Number.parseFloat(faker.commerce.price({ min: 3, max: 600, dec: 2 })),
		lowStockThreshold,
	};
}

const PRODUCT_COUNT = 25;

const seedProducts = Array.from({ length: PRODUCT_COUNT }, (_, i) => generateProduct(i + 1));

async function seed() {
	// biome-ignore lint/suspicious/noConsole: seed script requires console output
	console.log(`Seeding database with ${PRODUCT_COUNT} products (faker.js)...`);

	const now = new Date();

	for (const product of seedProducts) {
		await db
			.insert(products)
			.values({
				...product,
				createdAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: products.sku,
				set: {
					name: product.name,
					category: product.category,
					quantity: product.quantity,
					price: product.price,
					lowStockThreshold: product.lowStockThreshold,
					updatedAt: now,
				},
			});
	}

	// biome-ignore lint/suspicious/noConsole: seed script requires console output
	console.log(`Seeded ${seedProducts.length} products across ${CATEGORIES.length} categories.`);
}

seed().catch((err) => {
	console.error(err);
});
