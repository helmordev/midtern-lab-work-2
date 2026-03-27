import type { Product } from "#/db/schema";

export type InventoryStats = {
	totalProducts: number;
	totalQuantity: number;
	totalValue: number;
	lowStockCount: number;
	outOfStockCount: number;
	inStockCount: number;
	categoryBreakdown: Record<string, { count: number; quantity: number; value: number }>;
	topLowStockItems: Product[];
};
