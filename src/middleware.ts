import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Authenticated employees trying to reach /admin → unauthorized
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // Let the middleware function above handle authorization;
      // this just ensures only authenticated users pass the gate.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/timesheet/:path*", "/admin/:path*"],
};
