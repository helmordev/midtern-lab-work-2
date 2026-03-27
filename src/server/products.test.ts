import { describe, expect, it } from "vitest";
import { productSchema, updateProductSchema } from "./products";

// ── productSchema ──

describe("productSchema", () => {
	it("accepts valid product data", () => {
		const data = {
			name: "Wireless Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
			lowStockThreshold: 10,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(data);
		}
	});

	it("applies default lowStockThreshold of 10", () => {
		const data = {
			name: "USB Cable",
			sku: "UC-001",
			category: "Accessories",
			quantity: 100,
			price: 9.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.lowStockThreshold).toBe(10);
		}
	});

	it("rejects empty name", () => {
		const data = {
			name: "",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects empty sku", () => {
		const data = {
			name: "Mouse",
			sku: "",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects empty category", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "",
			quantity: 50,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects negative quantity", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: -1,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects negative price", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: -5,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("accepts zero quantity", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 0,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it("accepts zero price", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 0,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it("rejects non-integer quantity", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 5.5,
			price: 29.99,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects negative lowStockThreshold", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
			lowStockThreshold: -1,
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects missing required fields", () => {
		const result = productSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("rejects wrong types", () => {
		const data = {
			name: 123,
			sku: true,
			category: null,
			quantity: "fifty",
			price: "cheap",
		};
		const result = productSchema.safeParse(data);
		expect(result.success).toBe(false);
	});
});

// ── updateProductSchema ──

describe("updateProductSchema", () => {
	it("accepts valid update data with id", () => {
		const data = {
			id: 1,
			name: "Updated Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 45,
			price: 24.99,
			lowStockThreshold: 10,
		};
		const result = updateProductSchema.safeParse(data);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe(1);
		}
	});

	it("rejects missing id", () => {
		const data = {
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = updateProductSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects non-positive id", () => {
		const data = {
			id: 0,
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = updateProductSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects negative id", () => {
		const data = {
			id: -1,
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = updateProductSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("rejects decimal id", () => {
		const data = {
			id: 1.5,
			name: "Mouse",
			sku: "WM-001",
			category: "Electronics",
			quantity: 50,
			price: 29.99,
		};
		const result = updateProductSchema.safeParse(data);
		expect(result.success).toBe(false);
	});
});
