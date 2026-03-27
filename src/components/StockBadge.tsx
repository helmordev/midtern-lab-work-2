import { getStockBadgeClass, getStockStatusLabel } from "#/lib/inventory-utils";

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function StockBadge({ status }: { status: StockStatus }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStockBadgeClass(status)}`}
		>
			{getStockStatusLabel(status)}
		</span>
	);
}
