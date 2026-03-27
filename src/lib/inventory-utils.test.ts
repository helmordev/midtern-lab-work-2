import { describe, expect, it } from "vitest";
import type { Product } from "#/db/schema";
import {
	formatCurrency,
	formatNumber,
	getStockBadgeClass,
	getStockStatus,
	getStockStatusLabel,
	parseCSVLine,
} from "./inventory-utils";

// Helper to create a product-like object for testing
function makeProduct(overrides: Partial<Product> = {}): Product {
	return {
		id: 1,
		name: "Test Product",
		sku: "TST-001",
		category: "General",
		quantity: 50,
		price: 29.99,
		lowStockThreshold: 10,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

// ── getStockStatus ──

describe("getStockStatus", () => {
	it("returns 'in-stock' when quantity exceeds threshold", () => {
		const product = makeProduct({ quantity: 50, lowStockThreshold: 10 });
		expect(getStockStatus(product)).toBe("in-stock");
	});

	it("returns 'low-stock' when quantity equals threshold", () => {
		const product = makeProduct({ quantity: 10, lowStockThreshold: 10 });
		expect(getStockStatus(product)).toBe("low-stock");
	});

	it("returns 'low-stock' when quantity is below threshold but above 0", () => {
		const product = makeProduct({ quantity: 3, lowStockThreshold: 10 });
		expect(getStockStatus(product)).toBe("low-stock");
	});

	it("returns 'out-of-stock' when quantity is 0", () => {
		const product = makeProduct({ quantity: 0, lowStockThreshold: 10 });
		expect(getStockStatus(product)).toBe("out-of-stock");
	});

	it("returns 'in-stock' when quantity is 1 and threshold is 0", () => {
		const product = makeProduct({ quantity: 1, lowStockThreshold: 0 });
		expect(getStockStatus(product)).toBe("in-stock");
	});

	it("returns 'out-of-stock' when both quantity and threshold are 0", () => {
		const product = makeProduct({ quantity: 0, lowStockThreshold: 0 });
		expect(getStockStatus(product)).toBe("out-of-stock");
	});
});

// ── getStockStatusLabel ──

describe("getStockStatusLabel", () => {
	it("returns 'In Stock' for in-stock", () => {
		expect(getStockStatusLabel("in-stock")).toBe("In Stock");
	});

	it("returns 'Low Stock' for low-stock", () => {
		expect(getStockStatusLabel("low-stock")).toBe("Low Stock");
	});

	it("returns 'Out of Stock' for out-of-stock", () => {
		expect(getStockStatusLabel("out-of-stock")).toBe("Out of Stock");
	});
});

// ── getStockBadgeClass ──

describe("getStockBadgeClass", () => {
	it("returns correct class for in-stock", () => {
		expect(getStockBadgeClass("in-stock")).toBe("stock-badge-in");
	});

	it("returns correct class for low-stock", () => {
		expect(getStockBadgeClass("low-stock")).toBe("stock-badge-low");
	});

	it("returns correct class for out-of-stock", () => {
		expect(getStockBadgeClass("out-of-stock")).toBe("stock-badge-out");
	});
});

// ── formatCurrency ──

describe("formatCurrency", () => {
	it("formats a whole number with two decimal places", () => {
		expect(formatCurrency(100)).toBe("$100.00");
	});

	it("formats a decimal number", () => {
		expect(formatCurrency(29.99)).toBe("$29.99");
	});

	it("formats zero", () => {
		expect(formatCurrency(0)).toBe("$0.00");
	});

	it("formats large numbers with commas", () => {
		expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
	});

	it("formats small decimal amounts", () => {
		expect(formatCurrency(0.5)).toBe("$0.50");
	});
});

// ── formatNumber ──

describe("formatNumber", () => {
	it("formats a simple number", () => {
		expect(formatNumber(42)).toBe("42");
	});

	it("formats zero", () => {
		expect(formatNumber(0)).toBe("0");
	});

	it("formats large numbers with commas", () => {
		expect(formatNumber(1234567)).toBe("1,234,567");
	});

	it("formats 1000", () => {
		expect(formatNumber(1000)).toBe("1,000");
	});
});

// ── parseCSVLine ──

describe("parseCSVLine", () => {
	it("parses a simple comma-separated line", () => {
		expect(parseCSVLine("a,b,c")).toEqual(["a", "b", "c"]);
	});

	it("parses values with quoted fields", () => {
		expect(parseCSVLine('"hello","world"')).toEqual(["hello", "world"]);
	});

	it("handles commas inside quoted fields", () => {
		expect(parseCSVLine('"hello, world",foo')).toEqual(["hello, world", "foo"]);
	});

	it("handles escaped double quotes inside quoted fields", () => {
		expect(parseCSVLine('"say ""hi""",bar')).toEqual(['say "hi"', "bar"]);
	});

	it("trims whitespace from unquoted values", () => {
		expect(parseCSVLine("  a , b , c  ")).toEqual(["a", "b", "c"]);
	});

	it("parses empty fields", () => {
		expect(parseCSVLine("a,,c")).toEqual(["a", "", "c"]);
	});

	it("parses a single value", () => {
		expect(parseCSVLine("hello")).toEqual(["hello"]);
	});

	it("parses a line with only commas", () => {
		expect(parseCSVLine(",,")).toEqual(["", "", ""]);
	});

	it("parses CSV header for products", () => {
		expect(parseCSVLine("name,sku,category,quantity,price,low_stock_threshold")).toEqual([
			"name",
			"sku",
			"category",
			"quantity",
			"price",
			"low_stock_threshold",
		]);
	});

	it("parses a product data row with quoted name", () => {
		expect(parseCSVLine('"Wireless Mouse","WM-001","Electronics",50,29.99,10')).toEqual([
			"Wireless Mouse",
			"WM-001",
			"Electronics",
			"50",
			"29.99",
			"10",
		]);
	});

	it("parses a product name containing a comma", () => {
		expect(parseCSVLine('"USB Cable, Type-C","UC-002","Accessories",100,9.99,20')).toEqual([
			"USB Cable, Type-C",
			"UC-002",
			"Accessories",
			"100",
			"9.99",
			"20",
		]);
	});

	it("parses empty string", () => {
		expect(parseCSVLine("")).toEqual([""]);
	});
});
