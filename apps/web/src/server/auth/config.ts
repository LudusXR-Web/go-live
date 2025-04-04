import "server-only";

import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createId } from "@paralleldrive/cuid2";

import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, sessions, users, personalDetails } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: typeof users.$inferSelect & DefaultSession["user"];
  }

  interface AdapterSession extends DefaultSession {
    user: typeof users.$inferSelect & DefaultSession["user"];
  }

  type AdapterUser = typeof users.$inferSelect & DefaultSession["user"];
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope:
            "openid profile email https://www.googleapis.com/auth/calendar",
        },
      },
      profile: (profile) => ({
        username: `${profile.name.toLowerCase().replaceAll(" ", "_")}_${createId()}`,
        ...profile,
      }),
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  cookies: {
    sessionToken: {
      name: "golive-session",
    },
    csrfToken: {
      name: "golive-csrf",
    },
    callbackUrl: {
      name: "golive-callback",
    },
  },
  session: {
    generateSessionToken: () => createId(),
    maxAge: 604800,
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    session: async ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
  events: {
    createUser: async ({ user }) => {
      await db.insert(personalDetails).values({ userId: user.id! });
    },
  },
} satisfies NextAuthConfig;
