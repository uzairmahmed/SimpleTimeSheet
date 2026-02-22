import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }
      if (pathname.startsWith("/timesheet")) {
        return !!token;
      }
      return true;
    },
  },
});

// Protect /admin and /admin/* (admin only), /timesheet and /timesheet/* (authenticated)
export const config = {
  matcher: ["/admin", "/admin/:path*", "/timesheet", "/timesheet/:path*"],
};
