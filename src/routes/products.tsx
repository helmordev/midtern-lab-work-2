import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Check, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "#/components/ProductForm";
import { StockBadge } from "#/components/StockBadge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
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
import type { Product } from "#/db/schema";
import { formatCurrency, formatNumber, getStockStatus } from "#/lib/inventory-utils";
import type { ProductFormData } from "#/server/products";
import {
	createProduct,
	deleteProduct,
	getCategories,
	getProducts,
	updateProduct,
} from "#/server/products";

export const Route = createFileRoute("/products")({
	component: ProductsPage,
	loader: async () => {
		const [products, categories] = await Promise.all([getProducts(), getCategories()]);
		return { products, categories };
	},
});

const emptyFormData: ProductFormData = {
	name: "",
	sku: "",
	category: "",
	quantity: 0,
	price: 0,
	lowStockThreshold: 10,
};

function ProductsPage() {
	const { products, categories } = Route.useLoaderData() as {
		products: Product[];
		categories: string[];
	};
	const router = useRouter();

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	// Dialog state
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

	// Form state
	const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Inline editing
	const [inlineEditId, setInlineEditId] = useState<number | null>(null);
	const [inlineEditData, setInlineEditData] = useState({
		quantity: 0,
		price: 0,
	});

	// TanStack Table sorting state
	const [sorting, setSorting] = useState<SortingState>([]);

	// Pre-filter data based on category/status/search before passing to table
	const filteredProducts = useMemo(() => {
		return products.filter((p) => {
			const matchesSearch =
				!searchQuery ||
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.sku.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

			const status = getStockStatus(p);
			const matchesStatus = statusFilter === "all" || status === statusFilter;

			return matchesSearch && matchesCategory && matchesStatus;
		});
	}, [products, searchQuery, categoryFilter, statusFilter]);

	// ── Handlers used in column definitions (must be defined before useMemo) ──

	const handleOpenEdit = useCallback((product: Product) => {
		setFormData({
			name: product.name,
			sku: product.sku,
			category: product.category,
			quantity: product.quantity,
			price: product.price,
			lowStockThreshold: product.lowStockThreshold,
		});
		setEditingProduct(product);
	}, []);

	const handleInlineEdit = useCallback((product: Product) => {
		setInlineEditId(product.id);
		setInlineEditData({
			quantity: product.quantity,
			price: product.price,
		});
	}, []);

	const handleInlineSave = useCallback(
		async (product: Product) => {
			try {
				await updateProduct({
					data: {
						id: product.id,
						name: product.name,
						sku: product.sku,
						category: product.category,
						quantity: inlineEditData.quantity,
						price: inlineEditData.price,
						lowStockThreshold: product.lowStockThreshold,
					},
				});
				toast.success("Updated successfully");
				setInlineEditId(null);
				router.invalidate();
			} catch {
				toast.error("Failed to update");
			}
		},
		[inlineEditData, router]
	);

	// Column definitions for TanStack Table
	const columns = useMemo<ColumnDef<Product>[]>(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Name
						<ArrowUpDown className="ml-1 size-3.5" />
					</Button>
				),
				cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
			},
			{
				accessorKey: "sku",
				header: ({ column }) => (
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						SKU
						<ArrowUpDown className="ml-1 size-3.5" />
					</Button>
				),
				cell: ({ row }) => (
					<span className="font-mono text-xs text-muted-foreground">{row.getValue("sku")}</span>
				),
			},
			{
				accessorKey: "category",
				header: ({ column }) => (
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Category
						<ArrowUpDown className="ml-1 size-3.5" />
					</Button>
				),
				cell: ({ row }) => <Badge variant="secondary">{row.getValue("category")}</Badge>,
			},
			{
				accessorKey: "quantity",
				header: ({ column }) => (
					<div className="text-right">
						<Button
							variant="ghost"
							size="sm"
							className="-mr-3 h-8"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						>
							Quantity
							<ArrowUpDown className="ml-1 size-3.5" />
						</Button>
					</div>
				),
				cell: ({ row }) => {
					const product = row.original;
					const isInlineEditing = inlineEditId === product.id;

					return (
						<div className="text-right">
							{isInlineEditing ? (
								<Input
									type="number"
									value={inlineEditData.quantity}
									onChange={(e) =>
										setInlineEditData((prev) => ({
											...prev,
											quantity: Number.parseInt(e.target.value, 10) || 0,
										}))
									}
									className="h-8 w-20 text-right"
									min={0}
								/>
							) : (
								<button
									type="button"
									className="cursor-pointer tabular-nums hover:underline"
									onDoubleClick={() => handleInlineEdit(product)}
								>
									{formatNumber(product.quantity)}
								</button>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "price",
				header: ({ column }) => (
					<div className="text-right">
						<Button
							variant="ghost"
							size="sm"
							className="-mr-3 h-8"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						>
							Price
							<ArrowUpDown className="ml-1 size-3.5" />
						</Button>
					</div>
				),
				cell: ({ row }) => {
					const product = row.original;
					const isInlineEditing = inlineEditId === product.id;

					return (
						<div className="text-right">
							{isInlineEditing ? (
								<Input
									type="number"
									value={inlineEditData.price}
									onChange={(e) =>
										setInlineEditData((prev) => ({
											...prev,
											price: Number.parseFloat(e.target.value) || 0,
										}))
									}
									className="h-8 w-24 text-right"
									min={0}
									step={0.01}
								/>
							) : (
								<button
									type="button"
									className="cursor-pointer tabular-nums hover:underline"
									onDoubleClick={() => handleInlineEdit(product)}
								>
									{formatCurrency(product.price)}
								</button>
							)}
						</div>
					);
				},
			},
			{
				id: "status",
				accessorFn: (row) => getStockStatus(row),
				header: ({ column }) => (
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Status
						<ArrowUpDown className="ml-1 size-3.5" />
					</Button>
				),
				cell: ({ row }) => {
					const status = getStockStatus(row.original);
					return <StockBadge status={status} />;
				},
			},
			{
				id: "actions",
				enableSorting: false,
				header: () => <div className="text-right">Actions</div>,
				cell: ({ row }) => {
					const product = row.original;
					const isInlineEditing = inlineEditId === product.id;

					return (
						<div className="text-right">
							{isInlineEditing ? (
								<div className="flex items-center justify-end gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() => handleInlineSave(product)}
									>
										<Check className="size-3.5 text-sp-success-text" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() => setInlineEditId(null)}
									>
										<X className="size-3.5" />
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() => handleOpenEdit(product)}
									>
										<Pencil className="size-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 text-destructive"
										onClick={() => setDeleteTarget(product)}
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							)}
						</div>
					);
				},
			},
		],
		[inlineEditId, inlineEditData, handleInlineEdit, handleInlineSave, handleOpenEdit]
	);

	const table = useReactTable({
		data: filteredProducts,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const handleOpenAdd = useCallback(() => {
		setFormData(emptyFormData);
		setIsAddOpen(true);
	}, []);

	const handleSubmitAdd = useCallback(async () => {
		setIsSubmitting(true);
		try {
			await createProduct({ data: formData });
			toast.success("Product created successfully");
			setIsAddOpen(false);
			router.invalidate();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to create product");
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, router]);

	const handleSubmitEdit = useCallback(async () => {
		if (!editingProduct) return;
		setIsSubmitting(true);
		try {
			await updateProduct({
				data: { ...formData, id: editingProduct.id },
			});
			toast.success("Product updated successfully");
			setEditingProduct(null);
			router.invalidate();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update product");
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, editingProduct, router]);

	const handleDelete = useCallback(async () => {
		if (!deleteTarget) return;
		try {
			await deleteProduct({ data: deleteTarget.id });
			toast.success(`"${deleteTarget.name}" deleted`);
			setDeleteTarget(null);
			router.invalidate();
		} catch {
			toast.error("Failed to delete product");
		}
	}, [deleteTarget, router]);

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Page Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Products</h1>
					<p className="text-sm text-muted-foreground">Manage your inventory products.</p>
				</div>
				<Button onClick={handleOpenAdd}>
					<Plus data-icon="inline-start" />
					Add Product
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or SKU..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-full sm:w-[180px]">
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
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full sm:w-[180px]">
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
				</CardContent>
			</Card>

			{/* Products Table (TanStack Table) */}
			<Card>
				<CardContent className="pt-6">
					{filteredProducts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Package className="mb-4 size-12 text-muted-foreground/40" />
							<h3 className="text-lg font-medium">No products found</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								{products.length === 0
									? "Get started by adding your first product."
									: "Try adjusting your search or filters."}
							</p>
							{products.length === 0 && (
								<Button onClick={handleOpenAdd} className="mt-4" size="sm">
									<Plus data-icon="inline-start" />
									Add Product
								</Button>
							)}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows.map((row) => (
										<TableRow key={row.id} className="group">
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
					<div className="mt-4 text-xs text-muted-foreground">
						Showing {filteredProducts.length} of {products.length} products
						{sorting.length > 0 && (
							<>
								{" "}
								&middot; Sorted by {sorting[0]?.id} ({sorting[0]?.desc ? "desc" : "asc"})
							</>
						)}{" "}
						&middot; Double-click quantity or price for inline editing.
					</div>
				</CardContent>
			</Card>

			{/* Add Product Dialog */}
			<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Add Product</DialogTitle>
						<DialogDescription>Fill in the details for the new product.</DialogDescription>
					</DialogHeader>
					<ProductForm formData={formData} onChange={setFormData} categories={categories} />
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsAddOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmitAdd} disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Product"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Product Dialog */}
			<Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Edit Product</DialogTitle>
						<DialogDescription>Update the product details.</DialogDescription>
					</DialogHeader>
					<ProductForm formData={formData} onChange={setFormData} categories={categories} />
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingProduct(null)}>
							Cancel
						</Button>
						<Button onClick={handleSubmitEdit} disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Product</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
