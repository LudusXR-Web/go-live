import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_URL: z.string(),
    AUTH_SECRET: z.string(),

    DATABASE_URL: z.string().url(),
    PUBLIC_DATABASE_URL: z.string().url().optional(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_API_KEY: z.string(),
    GOOGLE_REDIRECT_URI: z.string().url(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_AWS_OBJECT_PREFIX: z.string().url(),
    NEXT_PUBLIC_AWS_BUCKET_NAME: z.string(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_URL: process.env.AUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,

    DATABASE_URL: process.env.DATABASE_URL,
    PUBLIC_DATABASE_URL: process.env.PUBLIC_DATABASE_URL,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_AWS_OBJECT_PREFIX: process.env.NEXT_PUBLIC_AWS_OBJECT_PREFIX,
    NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
