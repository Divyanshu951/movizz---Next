const { Pool } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function migrate() {
  console.log("Checking and migrating database tables on Neon...");

  const queries = [
    `CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
      "image" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expires_at" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ip_address" TEXT,
      "user_agent" TEXT,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "account_id" TEXT NOT NULL,
      "provider_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" TEXT,
      "refresh_token" TEXT,
      "id_token" TEXT,
      "access_token_expires_at" TIMESTAMP,
      "refresh_token_expires_at" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expires_at" TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS "watchlist_items" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "tmdb_id" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'movie',
      "year" TEXT,
      "rating" REAL,
      "genre" TEXT,
      "poster" TEXT,
      "overview" TEXT,
      "watched" BOOLEAN NOT NULL DEFAULT FALSE,
      "pinned" BOOLEAN NOT NULL DEFAULT FALSE,
      "added_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS "watchlist_user_idx" ON "watchlist_items" ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "watchlist_user_tmdb_idx" ON "watchlist_items" ("user_id", "tmdb_id", "type");`
  ];

  for (const query of queries) {
    await pool.query(query);
  }

  const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`);
  console.log("Success! Current tables:", res.rows.map(r => r.table_name));
  await pool.end();
}

migrate().catch(e => {
  console.error("Migration failed:", e);
  pool.end();
  process.exit(1);
});
