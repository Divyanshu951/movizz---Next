import { betterAuth } from "better-auth";
import { Pool } from "@neondatabase/serverless";

// Neon serverless PostgreSQL connection pool
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:dummy@ep-dummy.aws.neon.tech/neondb?sslmode=require";

export const auth = betterAuth({
  database: new Pool({
    connectionString,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || "movizz-secret-key-32-chars-minimum-security",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
