import type { Product } from "#/db/schema";

export function getStockStatus(product: Product): "in-stock" | "low-stock" | "out-of-stock" {
	if (product.quantity === 0) return "out-of-stock";
	if (product.quantity <= product.lowStockThreshold) return "low-stock";
	return "in-stock";
}

export function getStockStatusLabel(status: "in-stock" | "low-stock" | "out-of-stock"): string {
	switch (status) {
		case "in-stock":
			return "In Stock";
		case "low-stock":
			return "Low Stock";
		case "out-of-stock":
			return "Out of Stock";
	}
}

export function getStockBadgeClass(status: "in-stock" | "low-stock" | "out-of-stock"): string {
	switch (status) {
		case "in-stock":
			return "stock-badge-in";
		case "low-stock":
			return "stock-badge-low";
		case "out-of-stock":
			return "stock-badge-out";
	}
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amount);
}

export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-US").format(num);
}

export function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line.charAt(i);

		if (inQuotes) {
			if (char === '"') {
				if (i + 1 < line.length && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				current += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === ",") {
				result.push(current.trim());
				current = "";
			} else {
				current += char;
			}
		}
	}

	result.push(current.trim());
	return result;
}
