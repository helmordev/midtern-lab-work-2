import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, FileSpreadsheet, LayoutDashboard, Package, Zap } from "lucide-react";
import ThemeToggle from "#/components/ThemeToggle";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "#/components/ui/sidebar";

const navItems = [
	{
		title: "Dashboard",
		url: "/",
		icon: LayoutDashboard,
	},
	{
		title: "Products",
		url: "/products",
		icon: Package,
	},
	{
		title: "Insights",
		url: "/insights",
		icon: BarChart3,
	},
	{
		title: "CSV Import/Export",
		url: "/csv",
		icon: FileSpreadsheet,
	},
] as const;

export function AppSidebar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4">
				<Link to="/" className="flex items-center gap-2 no-underline">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Zap className="size-4" />
					</div>
					<div className="flex flex-col group-data-[collapsible=icon]:hidden">
						<span className="text-sm font-bold text-foreground">Stock Pulse</span>
						<span className="text-[10px] text-muted-foreground">Inventory Manager</span>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive =
									item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
											<Link to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarSeparator />
				<div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:justify-center">
					<span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
						Theme
					</span>
					<ThemeToggle />
				</div>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
