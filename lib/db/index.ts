import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:dummy@ep-dummy.aws.neon.tech/neondb?sslmode=require";

// Disable websocket for environments where needed or allow pooling
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
