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

export const config = {
  matcher: ["/admin/:path*", "/timesheet/:path*"],
};
