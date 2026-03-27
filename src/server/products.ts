import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "#/db/index";
import { products } from "#/db/schema";

// ── Validation Schemas ──

export const productSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	sku: z.string().min(1, "SKU is required"),
	category: z.string().min(1, "Category is required"),
	quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
	price: z.number().min(0, "Price must be 0 or greater"),
	lowStockThreshold: z.number().int().min(0, "Threshold must be 0 or greater").default(10),
});

export const updateProductSchema = productSchema.extend({
	id: z.number().int().positive(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;

// ── Server Functions ──

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	const result = await db.select().from(products).orderBy(desc(products.updatedAt));
	return result;
});

export const getProductById = createServerFn({ method: "GET" })
	.inputValidator((id: number) => id)
	.handler(async ({ data: id }) => {
		const result = await db.select().from(products).where(eq(products.id, id));
		return result[0] ?? null;
	});

export const searchProducts = createServerFn({ method: "GET" })
	.inputValidator((data: { query?: string; category?: string; status?: string }) => data)
	.handler(async ({ data: filters }) => {
		let query = db.select().from(products);

		const conditions = [];

		if (filters.query) {
			const searchTerm = `%${filters.query}%`;
			conditions.push(or(like(products.name, searchTerm), like(products.sku, searchTerm)));
		}

		if (filters.category && filters.category !== "all") {
			conditions.push(eq(products.category, filters.category));
		}

		if (conditions.length > 0) {
			for (const condition of conditions) {
				if (condition) {
					query = query.where(condition) as typeof query;
				}
			}
		}

		let result = await query.orderBy(desc(products.updatedAt));

		if (filters.status && filters.status !== "all") {
			result = result.filter((product) => {
				if (filters.status === "in-stock") {
					return product.quantity > product.lowStockThreshold;
				}
				if (filters.status === "low-stock") {
					return product.quantity > 0 && product.quantity <= product.lowStockThreshold;
				}
				if (filters.status === "out-of-stock") {
					return product.quantity === 0;
				}
				return true;
			});
		}

		return result;
	});

export const createProduct = createServerFn({ method: "POST" })
	.inputValidator((data: ProductFormData) => productSchema.parse(data))
	.handler(async ({ data }) => {
		const existing = await db.select().from(products).where(eq(products.sku, data.sku));

		if (existing.length > 0) {
			throw new Error(`Product with SKU "${data.sku}" already exists`);
		}

		const result = await db
			.insert(products)
			.values({
				...data,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		const created = result[0];
		if (!created) {
			throw new Error("Failed to create product");
		}
		return created;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.inputValidator((data: UpdateProductData) => updateProductSchema.parse(data))
	.handler(async ({ data }) => {
		const { id, ...updateData } = data;

		const existing = await db.select().from(products).where(eq(products.sku, data.sku));

		if (existing.length > 0 && existing[0]?.id !== id) {
			throw new Error(`Another product with SKU "${data.sku}" already exists`);
		}

		const result = await db
			.update(products)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(products.id, id))
			.returning();

		return result[0] ?? null;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.inputValidator((id: number) => id)
	.handler(async ({ data: id }) => {
		await db.delete(products).where(eq(products.id, id));
		return { success: true };
	});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
	const result = await db
		.selectDistinct({ category: products.category })
		.from(products)
		.orderBy(asc(products.category));
	return result.map((r) => r.category);
});

export const getInventoryStats = createServerFn({ method: "GET" }).handler(async () => {
	const allProducts = await db.select().from(products);

	const totalProducts = allProducts.length;
	const totalQuantity = allProducts.reduce((sum, p) => sum + p.quantity, 0);
	const totalValue = allProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
	const lowStockCount = allProducts.filter(
		(p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
	).length;
	const outOfStockCount = allProducts.filter((p) => p.quantity === 0).length;
	const inStockCount = allProducts.filter((p) => p.quantity > p.lowStockThreshold).length;

	const categoryBreakdown = allProducts.reduce(
		(acc, p) => {
			if (!acc[p.category]) {
				acc[p.category] = { count: 0, quantity: 0, value: 0 };
			}
			const cat = acc[p.category];
			if (cat) {
				cat.count++;
				cat.quantity += p.quantity;
				cat.value += p.price * p.quantity;
			}
			return acc;
		},
		{} as Record<string, { count: number; quantity: number; value: number }>
	);

	const topLowStockItems = allProducts
		.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold)
		.sort((a, b) => a.quantity - b.quantity)
		.slice(0, 5);

	return {
		totalProducts,
		totalQuantity,
		totalValue,
		lowStockCount,
		outOfStockCount,
		inStockCount,
		categoryBreakdown,
		topLowStockItems,
	};
});

// ── CSV Functions ──

export const importProducts = createServerFn({ method: "POST" })
	.inputValidator((data: { products: ProductFormData[]; mode: "insert" | "upsert" }) => data)
	.handler(async ({ data }) => {
		const results = {
			inserted: 0,
			updated: 0,
			skipped: 0,
			errors: [] as string[],
		};

		for (const productData of data.products) {
			try {
				const parsed = productSchema.safeParse(productData);
				if (!parsed.success) {
					results.errors.push(
						`SKU ${productData.sku}: ${parsed.error.issues.map((i) => i.message).join(", ")}`
					);
					results.skipped++;
					continue;
				}

				const existing = await db.select().from(products).where(eq(products.sku, parsed.data.sku));

				if (existing.length > 0) {
					if (data.mode === "upsert") {
						await db
							.update(products)
							.set({
								...parsed.data,
								updatedAt: new Date(),
							})
							.where(eq(products.sku, parsed.data.sku));
						results.updated++;
					} else {
						results.skipped++;
					}
				} else {
					await db.insert(products).values({
						...parsed.data,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
					results.inserted++;
				}
			} catch {
				results.errors.push(`SKU ${productData.sku}: Unexpected error`);
				results.skipped++;
			}
		}

		return results;
	});

export const exportProducts = createServerFn({ method: "GET" })
	.inputValidator((filters?: { category?: string; status?: string }) => filters)
	.handler(async ({ data: filters }) => {
		let allProducts = await db.select().from(products).orderBy(asc(products.name));

		if (filters?.category && filters.category !== "all") {
			allProducts = allProducts.filter((p) => p.category === filters.category);
		}

		if (filters?.status && filters.status !== "all") {
			allProducts = allProducts.filter((p) => {
				if (filters.status === "in-stock") return p.quantity > p.lowStockThreshold;
				if (filters.status === "low-stock")
					return p.quantity > 0 && p.quantity <= p.lowStockThreshold;
				if (filters.status === "out-of-stock") return p.quantity === 0;
				return true;
			});
		}

		const csvHeader = "name,sku,category,quantity,price,low_stock_threshold";
		const csvRows = allProducts.map(
			(p) =>
				`"${p.name.replace(/"/g, '""')}","${p.sku}","${p.category}",${p.quantity},${p.price},${p.lowStockThreshold}`
		);

		return [csvHeader, ...csvRows].join("\n");
	});
