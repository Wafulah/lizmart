export { auth as middleware } from "auth"

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/orders/:path*',
  ],
};