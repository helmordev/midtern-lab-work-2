import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowRight,
	BarChart3,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
} from "lucide-react";
import { StockBadge } from "#/components/StockBadge";
import { StockHealthBar } from "#/components/StockHealthBar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import type { Product } from "#/db/schema";
import { formatCurrency, formatNumber, getStockStatus } from "#/lib/inventory-utils";
import type { InventoryStats } from "#/lib/types";
import { getInventoryStats, getProducts } from "#/server/products";

export const Route = createFileRoute("/")({
	component: DashboardPage,
	loader: async () => {
		const [stats, products] = await Promise.all([getInventoryStats(), getProducts()]);
		return { stats, recentProducts: products.slice(0, 5) };
	},
});

function DashboardPage() {
	const { stats, recentProducts } = Route.useLoaderData() as {
		stats: InventoryStats;
		recentProducts: Product[];
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-sm text-muted-foreground">Overview of your inventory at a glance.</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Products</CardTitle>
						<Package className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{formatNumber(stats.totalProducts)}</div>
						<p className="mt-1 text-xs text-muted-foreground">Unique SKUs in inventory</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Units</CardTitle>
						<ShoppingCart className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{formatNumber(stats.totalQuantity)}</div>
						<p className="mt-1 text-xs text-muted-foreground">Items across all products</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
						<DollarSign className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</div>
						<p className="mt-1 text-xs text-muted-foreground">Total value of stock on hand</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Alerts</CardTitle>
						<AlertTriangle className="size-4 text-sp-warning-text" />
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold text-sp-warning-text">{stats.lowStockCount}</span>
							<span className="text-sm text-muted-foreground">low</span>
							<span className="text-3xl font-bold text-sp-danger-text">
								{stats.outOfStockCount}
							</span>
							<span className="text-sm text-muted-foreground">out</span>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">Items needing attention</p>
					</CardContent>
				</Card>
			</div>

			{/* Stock Health Bar */}
			{stats.totalProducts > 0 && (
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Stock Health</CardTitle>
						<BarChart3 className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<StockHealthBar
							inStockCount={stats.inStockCount}
							lowStockCount={stats.lowStockCount}
							outOfStockCount={stats.outOfStockCount}
							totalProducts={stats.totalProducts}
						/>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Recent Products */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Products</CardTitle>
						<Link to="/products">
							<Button variant="ghost" size="sm">
								View All
								<ArrowRight className="ml-1 size-3.5" />
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						{recentProducts.length === 0 ? (
							<div className="flex flex-col items-center py-8 text-center">
								<Package className="mb-3 size-8 text-muted-foreground/40" />
								<p className="text-sm font-medium">No products yet</p>
								<p className="mt-1 text-xs text-muted-foreground">Add products to see them here.</p>
								<Link to="/products" className="mt-3">
									<Button size="sm">Add Product</Button>
								</Link>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead className="text-right">Qty</TableHead>
										<TableHead className="text-right">Price</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentProducts.map((product) => {
										const status = getStockStatus(product);
										return (
											<TableRow key={product.id}>
												<TableCell className="font-medium">{product.name}</TableCell>
												<TableCell className="text-right tabular-nums">
													{formatNumber(product.quantity)}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{formatCurrency(product.price)}
												</TableCell>
												<TableCell>
													<StockBadge status={status} />
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Low Stock Alerts */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-lg">
							<AlertTriangle className="size-4 text-sp-warning-text" />
							Low Stock Alerts
						</CardTitle>
						<Link to="/insights">
							<Button variant="ghost" size="sm">
								Details
								<ArrowRight className="ml-1 size-3.5" />
							</Button>
						</Link>
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
											<Badge variant={item.quantity === 0 ? "destructive" : "secondary"}>
												{item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
											</Badge>
											<p className="mt-1 text-xs text-muted-foreground">
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

			{/* Quick Actions */}
			{stats.totalProducts === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-10">
						<Package className="mb-4 size-12 text-muted-foreground/30" />
						<h3 className="text-lg font-semibold">Welcome to Stock Pulse</h3>
						<p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
							Get started by adding products manually or importing them from a CSV file.
						</p>
						<div className="mt-6 flex gap-3">
							<Link to="/products">
								<Button>Add Products</Button>
							</Link>
							<Link to="/csv">
								<Button variant="outline">Import CSV</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
