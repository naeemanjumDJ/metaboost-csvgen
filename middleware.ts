import { auth } from "@/auth";

export const LOGIN = "/login";
export const PUBLIC_ROUTES = ["/", "/login", "/maintenance"];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isLoginPage = nextUrl.pathname === LOGIN;
  const isMaintenancePage = nextUrl.pathname === "/maintenance";

  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // If in maintenance mode and not on maintenance page, redirect to maintenance
  if (isMaintenanceMode && !isMaintenancePage) {
    return Response.redirect(new URL("/maintenance", nextUrl));
  }

  if (!isMaintenanceMode && isMaintenancePage) {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (isAuthenticated && isLoginPage)
    // Regular auth flow
    return Response.redirect(new URL("/dashboard", nextUrl));

  if (!isAuthenticated && !isPublicRoute)
    return Response.redirect(new URL(LOGIN, nextUrl));
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
