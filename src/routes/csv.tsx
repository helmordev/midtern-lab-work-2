import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Download, Upload } from "lucide-react";
import { ExportSection } from "#/components/csv/ExportSection";
import { ImportSection } from "#/components/csv/ImportSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getCategories } from "#/server/products";

export const Route = createFileRoute("/csv")({
	component: CSVPage,
	loader: async () => {
		const categories = await getCategories();
		return { categories };
	},
});

function CSVPage() {
	const { categories } = Route.useLoaderData() as { categories: string[] };
	const router = useRouter();

	return (
		<div className="flex flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">CSV Import / Export</h1>
				<p className="text-sm text-muted-foreground">
					Bulk manage your inventory data through CSV files.
				</p>
			</div>

			<Tabs defaultValue="import" className="w-full">
				<TabsList>
					<TabsTrigger value="import">
						<Upload className="mr-1.5 size-3.5" />
						Import
					</TabsTrigger>
					<TabsTrigger value="export">
						<Download className="mr-1.5 size-3.5" />
						Export
					</TabsTrigger>
				</TabsList>

				<TabsContent value="import" className="mt-4">
					<ImportSection onImportComplete={() => router.invalidate()} />
				</TabsContent>

				<TabsContent value="export" className="mt-4">
					<ExportSection categories={categories} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
