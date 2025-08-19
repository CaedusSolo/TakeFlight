import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google"

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        return true
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = 'user';
      }
      return token
    }, 
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: { strategy: 'jwt'},
} satisfies NextAuthConfig