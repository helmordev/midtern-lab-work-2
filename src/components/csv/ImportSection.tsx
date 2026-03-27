import { AlertCircle, CheckCircle2, FileUp, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { parseCSVLine } from "#/lib/inventory-utils";
import type { ProductFormData } from "#/server/products";
import { importProducts } from "#/server/products";

type ImportSectionProps = {
	onImportComplete: () => void;
};

export function ImportSection({ onImportComplete }: ImportSectionProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [parsedData, setParsedData] = useState<ProductFormData[]>([]);
	const [parseErrors, setParseErrors] = useState<string[]>([]);
	const [importMode, setImportMode] = useState<"insert" | "upsert">("upsert");
	const [isImporting, setIsImporting] = useState(false);
	const [importResult, setImportResult] = useState<{
		inserted: number;
		updated: number;
		skipped: number;
		errors: string[];
	} | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback((file: File) => {
		if (!file.name.endsWith(".csv")) {
			toast.error("Please upload a CSV file");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const lines = text.split(/\r?\n/).filter((line) => line.trim());

			if (lines.length < 2) {
				toast.error("CSV file is empty or has no data rows");
				return;
			}

			const headerLine = lines[0];
			if (!headerLine) {
				toast.error("CSV file has no header row");
				return;
			}
			const header = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

			const requiredFields = ["name", "sku", "category", "quantity", "price"];
			const missingFields = requiredFields.filter((f) => !header.includes(f));

			if (missingFields.length > 0) {
				setParseErrors([`Missing required columns: ${missingFields.join(", ")}`]);
				return;
			}

			const nameIdx = header.indexOf("name");
			const skuIdx = header.indexOf("sku");
			const categoryIdx = header.indexOf("category");
			const quantityIdx = header.indexOf("quantity");
			const priceIdx = header.indexOf("price");
			const thresholdIdx = header.indexOf("low_stock_threshold");

			const products: ProductFormData[] = [];
			const errors: string[] = [];

			for (let i = 1; i < lines.length; i++) {
				const line = lines[i];
				if (!line) continue;
				const values = parseCSVLine(line);
				const rowNum = i + 1;

				try {
					const name = values[nameIdx] ?? "";
					const sku = values[skuIdx] ?? "";
					const category = values[categoryIdx] ?? "";
					const quantity = Number.parseInt(values[quantityIdx] ?? "0", 10);
					const price = Number.parseFloat(values[priceIdx] ?? "0");
					const threshold =
						thresholdIdx >= 0 ? Number.parseInt(values[thresholdIdx] ?? "10", 10) : 10;

					if (!name || !sku || !category) {
						errors.push(`Row ${rowNum}: Missing required fields (name, sku, or category)`);
						continue;
					}

					if (Number.isNaN(quantity) || quantity < 0) {
						errors.push(`Row ${rowNum}: Invalid quantity "${values[quantityIdx]}"`);
						continue;
					}

					if (Number.isNaN(price) || price < 0) {
						errors.push(`Row ${rowNum}: Invalid price "${values[priceIdx]}"`);
						continue;
					}

					products.push({
						name,
						sku,
						category,
						quantity,
						price,
						lowStockThreshold: Number.isNaN(threshold) ? 10 : threshold,
					});
				} catch {
					errors.push(`Row ${rowNum}: Failed to parse`);
				}
			}

			setParsedData(products);
			setParseErrors(errors);
			setImportResult(null);
		};

		reader.readAsText(file);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile]
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleImport = useCallback(async () => {
		if (parsedData.length === 0) return;
		setIsImporting(true);
		try {
			const result = await importProducts({
				data: { products: parsedData, mode: importMode },
			});
			setImportResult(result);
			if (result.errors.length === 0) {
				toast.success(`Imported: ${result.inserted} new, ${result.updated} updated`);
				onImportComplete();
			} else {
				toast.warning("Import completed with some errors");
			}
		} catch {
			toast.error("Import failed");
		} finally {
			setIsImporting(false);
		}
	}, [parsedData, importMode, onImportComplete]);

	const handleClear = useCallback(() => {
		setParsedData([]);
		setParseErrors([]);
		setImportResult(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	return (
		<div className="flex flex-col gap-4">
			{/* Drop Zone */}
			<Card>
				<CardContent className="pt-6">
					{/* biome-ignore lint/a11y/useSemanticElements: drop zone needs div for drag-and-drop */}
					<div
						role="region"
						aria-label="CSV file drop zone"
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
							isDragging
								? "border-primary bg-sp-primary-bg"
								: "border-muted-foreground/25 hover:border-primary/50"
						}`}
					>
						<FileUp className="mb-4 size-10 text-muted-foreground" />
						<p className="text-sm font-medium">Drag and drop your CSV file here</p>
						<p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv"
							className="absolute inset-0 cursor-pointer opacity-0"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFile(file);
							}}
							style={{ position: "relative", marginTop: "1rem" }}
						/>
						<p className="mt-4 text-xs text-muted-foreground">
							Expected columns:{" "}
							<code className="rounded bg-muted px-1.5 py-0.5">
								name,sku,category,quantity,price,low_stock_threshold
							</code>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Parse Errors */}
			{parseErrors.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Parsing Issues</AlertTitle>
					<AlertDescription>
						<ul className="mt-2 list-inside list-disc text-sm">
							{parseErrors.map((err) => (
								<li key={err}>{err}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{/* Import Result */}
			{importResult && (
				<Alert variant={importResult.errors.length > 0 ? "destructive" : "default"}>
					<CheckCircle2 className="size-4" />
					<AlertTitle>Import Complete</AlertTitle>
					<AlertDescription>
						<div className="mt-2 flex gap-4 text-sm">
							<span className="text-sp-success-text">{importResult.inserted} inserted</span>
							<span className="text-sp-primary">{importResult.updated} updated</span>
							<span className="text-muted-foreground">{importResult.skipped} skipped</span>
						</div>
						{importResult.errors.length > 0 && (
							<ul className="mt-2 list-inside list-disc text-sm">
								{importResult.errors.map((err) => (
									<li key={err}>{err}</li>
								))}
							</ul>
						)}
					</AlertDescription>
				</Alert>
			)}

			{/* Preview */}
			{parsedData.length > 0 && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">Preview ({parsedData.length} items)</CardTitle>
								<CardDescription>Review the data before importing.</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Select
									value={importMode}
									onValueChange={(v) => setImportMode(v as "insert" | "upsert")}
								>
									<SelectTrigger className="w-[160px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="insert">Insert Only</SelectItem>
										<SelectItem value="upsert">Insert or Update</SelectItem>
									</SelectContent>
								</Select>
								<Button onClick={handleImport} disabled={isImporting}>
									{isImporting ? "Importing..." : "Import Data"}
								</Button>
								<Button variant="outline" size="icon" onClick={handleClear}>
									<X className="size-4" />
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="max-h-[400px] overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>SKU</TableHead>
										<TableHead>Category</TableHead>
										<TableHead className="text-right">Qty</TableHead>
										<TableHead className="text-right">Price</TableHead>
										<TableHead className="text-right">Threshold</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{parsedData.slice(0, 50).map((item) => (
										<TableRow key={item.sku}>
											<TableCell className="font-medium">{item.name}</TableCell>
											<TableCell className="font-mono text-xs">{item.sku}</TableCell>
											<TableCell>
												<Badge variant="secondary">{item.category}</Badge>
											</TableCell>
											<TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
											<TableCell className="text-right tabular-nums">
												${item.price.toFixed(2)}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{item.lowStockThreshold}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						{parsedData.length > 50 && (
							<p className="mt-2 text-center text-xs text-muted-foreground">
								Showing first 50 of {parsedData.length} items
							</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
