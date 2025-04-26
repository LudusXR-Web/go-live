import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const connectionDetails = env.DATABASE_URL
  ? env.DATABASE_URL
  : {
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      host: env.POSTGRES_HOST,
      port: Number(env.POSTGRES_PORT),
      database: env.POSTGRES_DATABASE,
    };

const conn = globalForDb.conn ?? postgres(connectionDetails as string);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
