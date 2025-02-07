import NextAuth from "next-auth";
import google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { awardFreeCreditsToUser } from "./lib/user";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [google],
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user?.id;
      }
      return token;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        await awardFreeCreditsToUser(user.id);
      }
    },
  },
});
