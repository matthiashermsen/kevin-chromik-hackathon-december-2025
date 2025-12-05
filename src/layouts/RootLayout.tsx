import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { MainHeader } from "../components/MainHeader";

export function RootLayout() {
	return (
		<div className="min-h-screen">
			<MainHeader />
			<Outlet />
			<TanStackRouterDevtools />
		</div>
	);
}
