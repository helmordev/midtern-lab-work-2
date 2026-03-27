import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import { exportProducts } from "#/server/products";

type ExportSectionProps = {
	categories: string[];
};

export function ExportSection({ categories }: ExportSectionProps) {
	const [exportCategory, setExportCategory] = useState("all");
	const [exportStatus, setExportStatus] = useState("all");
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = useCallback(async () => {
		setIsExporting(true);
		try {
			const csvData = await exportProducts({
				data: {
					category: exportCategory !== "all" ? exportCategory : undefined,
					status: exportStatus !== "all" ? exportStatus : undefined,
				},
			});

			const blob = new Blob([csvData], { type: "text/csv" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			const date = new Date().toISOString().split("T")[0];
			a.href = url;
			a.download = `stock-pulse-export-${date}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("Export downloaded successfully");
		} catch {
			toast.error("Export failed");
		} finally {
			setIsExporting(false);
		}
	}, [exportCategory, exportStatus]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Export Inventory</CardTitle>
				<CardDescription>Download your inventory data as a CSV file.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4 sm:flex-row">
						<Select value={exportCategory} onValueChange={setExportCategory}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={exportStatus} onValueChange={setExportStatus}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="in-stock">In Stock</SelectItem>
								<SelectItem value="low-stock">Low Stock</SelectItem>
								<SelectItem value="out-of-stock">Out of Stock</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium">Ready to export</p>
							<p className="text-xs text-muted-foreground">
								File will be named with today&apos;s date automatically.
							</p>
						</div>
						<Button onClick={handleExport} disabled={isExporting}>
							<Download data-icon="inline-start" />
							{isExporting ? "Exporting..." : "Download CSV"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
