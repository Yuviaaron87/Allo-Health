import type { NextAuthConfig } from "next-auth"

export default {
  trustHost: true,
  providers: [], 
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      
      // Fail-safe: If we are on Vercel but the URL is localhost, something is wrong with the env
      // This is a common issue with NEXTAUTH_URL being set to localhost in dashboard
      if (typeof window === 'undefined' && process.env.VERCEL && nextUrl.hostname === 'localhost') {
        console.warn('Detected localhost redirect on Vercel. Check NEXTAUTH_URL env var.');
      }

      const isOnDashboard = nextUrl.pathname !== "/login" && !nextUrl.pathname.startsWith('/api')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
