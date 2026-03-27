import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { AppSidebar } from "#/components/AppSidebar";
import { Separator } from "#/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar";
import { Toaster } from "#/components/ui/sonner";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Stock Pulse | Inventory Manager",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased" suppressHydrationWarning>
				<TanStackQueryProvider>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>
							<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
								<SidebarTrigger className="-ml-1" />
								<Separator orientation="vertical" className="mr-2 h-4" />
								<span className="text-sm font-medium text-muted-foreground">Stock Pulse</span>
							</header>
							<main className="flex-1 overflow-auto">{children}</main>
						</SidebarInset>
					</SidebarProvider>
					<Toaster richColors position="top-right" />
				</TanStackQueryProvider>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
			<h2 className="text-4xl font-bold tracking-tight">404</h2>
			<p className="text-lg text-muted-foreground">
				The page you&apos;re looking for doesn&apos;t exist.
			</p>
			<Link to="/" className="text-sm font-medium text-primary hover:underline">
				Go back to Dashboard
			</Link>
		</div>
	);
}
