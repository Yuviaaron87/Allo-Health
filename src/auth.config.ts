import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "Admin" && credentials?.password === "admin@123") {
          return { id: "1", name: "Administrator", role: "admin" }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname !== "/login"
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
