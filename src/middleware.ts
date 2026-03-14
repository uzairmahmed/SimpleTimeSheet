import { withAuth } from "next-auth/middleware";

// Only protect authenticated route groups. Public routes (/, /login, /unauthorized)
// are accessible without a session.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/timesheet/:path*", "/admin/:path*"],
};
