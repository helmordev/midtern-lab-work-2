type StockHealthBarProps = {
	inStockCount: number;
	lowStockCount: number;
	outOfStockCount: number;
	totalProducts: number;
	/** Height class for the bar (e.g., "h-4" or "h-6"). Defaults to "h-4". */
	barHeight?: string;
};

export function StockHealthBar({
	inStockCount,
	lowStockCount,
	outOfStockCount,
	totalProducts,
	barHeight = "h-4",
}: StockHealthBarProps) {
	if (totalProducts === 0) return null;

	return (
		<div>
			<div className={`flex ${barHeight} w-full overflow-hidden rounded-full`}>
				{inStockCount > 0 && (
					<div
						className="bg-sp-success-border transition-all"
						style={{ width: `${(inStockCount / totalProducts) * 100}%` }}
					/>
				)}
				{lowStockCount > 0 && (
					<div
						className="bg-sp-warning-border transition-all"
						style={{ width: `${(lowStockCount / totalProducts) * 100}%` }}
					/>
				)}
				{outOfStockCount > 0 && (
					<div
						className="bg-sp-danger-border transition-all"
						style={{ width: `${(outOfStockCount / totalProducts) * 100}%` }}
					/>
				)}
			</div>
			<div className="mt-3 flex flex-wrap gap-4 text-sm">
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full bg-sp-success-border" />
					<span>In Stock ({inStockCount})</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full bg-sp-warning-border" />
					<span>Low Stock ({lowStockCount})</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="size-3 rounded-full bg-sp-danger-border" />
					<span>Out of Stock ({outOfStockCount})</span>
				</div>
			</div>
		</div>
	);
}
