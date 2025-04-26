import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        host: env.POSTGRES_HOST,
        port: Number(env.POSTGRES_PORT),
        database: env.POSTGRES_DATABASE,
      },
  tablesFilter: ["golive_*"],
} satisfies Config;
