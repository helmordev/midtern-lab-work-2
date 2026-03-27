import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { StockHealthBar } from "#/components/StockHealthBar";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { formatCurrency, formatNumber } from "#/lib/inventory-utils";
import type { InventoryStats } from "#/lib/types";
import { getInventoryStats } from "#/server/products";

export const Route = createFileRoute("/insights")({
	component: InsightsPage,
	loader: async () => {
		const stats = await getInventoryStats();
		return { stats };
	},
});

function InsightsPage() {
	const { stats } = Route.useLoaderData() as { stats: InventoryStats };

	const categoryEntries: [string, { count: number; quantity: number; value: number }][] =
		Object.entries(stats.categoryBreakdown).sort((a, b) => b[1].value - a[1].value);

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Inventory Insights</h1>
				<p className="text-sm text-muted-foreground">
					Analytics and visual feedback about your stock health.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Products</CardTitle>
						<Package className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{formatNumber(stats.totalProducts)}</div>
						<p className="mt-1 text-xs text-muted-foreground">
							{formatNumber(stats.totalQuantity)} total units in stock
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
						<DollarSign className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</div>
						<p className="mt-1 text-xs text-muted-foreground">Combined value of all stock</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Stock Health</CardTitle>
						<BarChart3 className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-3">
							<div className="flex flex-col items-center">
								<span className="text-2xl font-bold text-sp-success-text">
									{stats.inStockCount}
								</span>
								<span className="text-[10px] text-muted-foreground">In Stock</span>
							</div>
							<div className="h-8 w-px bg-border" />
							<div className="flex flex-col items-center">
								<span className="text-2xl font-bold text-sp-warning-text">
									{stats.lowStockCount}
								</span>
								<span className="text-[10px] text-muted-foreground">Low</span>
							</div>
							<div className="h-8 w-px bg-border" />
							<div className="flex flex-col items-center">
								<span className="text-2xl font-bold text-sp-danger-text">
									{stats.outOfStockCount}
								</span>
								<span className="text-[10px] text-muted-foreground">Out</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Stock Health Bar */}
			{stats.totalProducts > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Stock Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<StockHealthBar
							inStockCount={stats.inStockCount}
							lowStockCount={stats.lowStockCount}
							outOfStockCount={stats.outOfStockCount}
							totalProducts={stats.totalProducts}
							barHeight="h-6"
						/>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Category Breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Category Breakdown</CardTitle>
					</CardHeader>
					<CardContent>
						{categoryEntries.length === 0 ? (
							<p className="py-8 text-center text-sm text-muted-foreground">
								No categories yet. Add products to see breakdown.
							</p>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Category</TableHead>
										<TableHead className="text-right">Products</TableHead>
										<TableHead className="text-right">Units</TableHead>
										<TableHead className="text-right">Value</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{categoryEntries.map(([category, data]) => (
										<TableRow key={category}>
											<TableCell>
												<Badge variant="secondary">{category}</Badge>
											</TableCell>
											<TableCell className="text-right tabular-nums">{data.count}</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatNumber(data.quantity)}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatCurrency(data.value)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Top Low Stock Items */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<AlertTriangle className="size-4 text-sp-warning-text" />
							Top Low Stock Items
						</CardTitle>
					</CardHeader>
					<CardContent>
						{stats.topLowStockItems.length === 0 ? (
							<div className="flex flex-col items-center py-8 text-center">
								<TrendingUp className="mb-3 size-8 text-sp-success-text" />
								<p className="text-sm font-medium">All stocked up!</p>
								<p className="mt-1 text-xs text-muted-foreground">
									No items are running low on stock.
								</p>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{stats.topLowStockItems.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="text-sm font-medium">{item.name}</p>
											<p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-bold text-sp-warning-text">{item.quantity} left</p>
											<p className="text-xs text-muted-foreground">
												Threshold: {item.lowStockThreshold}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
