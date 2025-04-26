import "server-only";

import { eq } from "drizzle-orm";
import type {
  AdapterUser,
  Session,
  DefaultSession,
  NextAuthConfig,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createId } from "@paralleldrive/cuid2";

import { env } from "~/env";
import { db } from "~/server/db";
import { signIn } from "~/server/auth";
import { accounts, sessions, users, personalDetails } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    sessionToken: string;
    user: typeof users.$inferSelect & DefaultSession["user"];
  }

  interface AdapterSession extends DefaultSession {
    sessionToken: string;
    user: typeof users.$inferSelect & DefaultSession["user"];
  }

  type AdapterUser = typeof users.$inferSelect & DefaultSession["user"];
}

const googleScopes = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/meetings.space.created",
];
const maxUpdateTime = 1000 * 60 * 30;

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
      redirectProxyUrl:
        env.NODE_ENV === "production" ? env.GOOGLE_REDIRECT_URI : undefined,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: googleScopes.join(" "),
        },
      },
      account: (account) => ({
        ...account,
      }),
      //eslint-disable-next-line @typescript-eslint/no-unsafe-return
      profile: (profile) => ({
        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...profile,
        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: profile.sub, //eslint-disable-line @typescript-eslint/no-unsafe-member-access
        username: createId(),
      }),
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  debug: env.NODE_ENV === "development",
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
    //@ts-expect-error Auth.js Type Mismatch
    session: async ({
      session,
      user,
    }: {
      session: Session & { user: AdapterUser };
      user: AdapterUser;
    }) => {
      const updateDelta = +new Date() - +new Date(user.updatedAt);

      if (updateDelta > maxUpdateTime) {
        const userAccount = await db.query.accounts.findFirst({
          where: (account, { eq }) => eq(account.userId, user.id),
          columns: {
            refresh_token: true,
          },
        });

        if (!userAccount?.refresh_token)
          return {
            error: "Unauthorized",
          };

        const updatedAccount = await refreshAccessToken(
          env.GOOGLE_CLIENT_ID,
          env.GOOGLE_CLIENT_SECRET,
          userAccount.refresh_token,
        );

        if (typeof updatedAccount.error === "string") {
          console.log("[auth][debug]: ", JSON.stringify(updatedAccount.error));
          await signIn("google");
        }

        await db
          .update(accounts)
          .set({
            access_token: updatedAccount.accessToken,
            expires_at: updatedAccount.expiresIn,
            refresh_token: updatedAccount.refreshToken,
          })
          .where(eq(accounts.userId, user.id));
        await db
          .update(users)
          .set({ updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }

      session.user = {
        ...user,
        type: user.type ?? "student", // Default type if not provided
        username: user.username ?? user.id, // Default username if not provided
        createdAt: user.createdAt ?? new Date(),
        updatedAt: user.updatedAt ?? new Date(),
      };

      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      await db.insert(personalDetails).values({ userId: user.id! });
    },
  },
} satisfies NextAuthConfig;

const refreshAccessToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) => {
  try {
    const url = new URL("https://oauth2.googleapis.com/token");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("client_secret", clientSecret);
    url.searchParams.set("grant_type", "refresh_token");
    url.searchParams.set("refresh_token", refreshToken);

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newToken = await response.json();

    if (!response.ok) {
      throw newToken;
    }

    return {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      accessToken: newToken.access_token as string,
      expiresIn: Math.floor(
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (+new Date() + Number(newToken.expires_in) * 1000) / 1000,
      ),
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      refreshToken: newToken.refresh_token as string,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "RefreshAccessTokenError",
    };
  }
};
