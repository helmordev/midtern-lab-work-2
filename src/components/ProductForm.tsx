import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import type { ProductFormData } from "#/server/products";

type ProductFormProps = {
	formData: ProductFormData;
	onChange: (data: ProductFormData) => void;
	categories: string[];
};

export function ProductForm({ formData, onChange, categories }: ProductFormProps) {
	const [newCategory, setNewCategory] = useState("");
	const [showNewCategory, setShowNewCategory] = useState(false);

	return (
		<div className="grid gap-4 py-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="name">Product Name</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => onChange({ ...formData, name: e.target.value })}
						placeholder="e.g., Wireless Mouse"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="sku">SKU</Label>
					<Input
						id="sku"
						value={formData.sku}
						onChange={(e) => onChange({ ...formData, sku: e.target.value })}
						placeholder="e.g., WM-001"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="category">Category</Label>
				{showNewCategory ? (
					<div className="flex gap-2">
						<Input
							value={newCategory}
							onChange={(e) => setNewCategory(e.target.value)}
							placeholder="New category name"
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (newCategory.trim()) {
									onChange({
										...formData,
										category: newCategory.trim(),
									});
									setShowNewCategory(false);
									setNewCategory("");
								}
							}}
						>
							Add
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setShowNewCategory(false)}>
							Cancel
						</Button>
					</div>
				) : (
					<div className="flex gap-2">
						<Select
							value={formData.category}
							onValueChange={(val) => onChange({ ...formData, category: val })}
						>
							<SelectTrigger className="flex-1">
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button variant="outline" size="sm" onClick={() => setShowNewCategory(true)}>
							New
						</Button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="quantity">Quantity</Label>
					<Input
						id="quantity"
						type="number"
						value={formData.quantity}
						onChange={(e) =>
							onChange({
								...formData,
								quantity: Number.parseInt(e.target.value, 10) || 0,
							})
						}
						min={0}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="price">Price ($)</Label>
					<Input
						id="price"
						type="number"
						value={formData.price}
						onChange={(e) =>
							onChange({
								...formData,
								price: Number.parseFloat(e.target.value) || 0,
							})
						}
						min={0}
						step={0.01}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="threshold">Low Stock Threshold</Label>
					<Input
						id="threshold"
						type="number"
						value={formData.lowStockThreshold}
						onChange={(e) =>
							onChange({
								...formData,
								lowStockThreshold: Number.parseInt(e.target.value, 10) || 0,
							})
						}
						min={0}
					/>
				</div>
			</div>
		</div>
	);
}
