// db/pool.js
// WHY a "pool" and not a single connection?
// Creating a new database connection on every request is slow and can exhaust
// PostgreSQL's max connection limit under load. A pool keeps a small set of
// reusable connections ready, and gives one to each query automatically.
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // pg logs helpful warnings when a client isn't released back to the pool.
  // In dev we let it warn; in prod you'd set this to false and log manually.
  allowExitOnIdle: process.env.NODE_ENV !== "production",
});

// A tiny smoke test: confirm the server can actually reach PostgreSQL.
export async function checkDatabase() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT NOW() AS now");
    console.log(`✅ Database connected. Server time: ${rows[0].now}`);
  } finally {
    // Always release the client back to the pool, even if the query fails.
    client.release();
  }
}

// Graceful shutdown: close the pool when the process is stopped (Ctrl+C, kill).
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
