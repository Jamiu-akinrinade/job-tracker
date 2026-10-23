# job-tracker Server — Step 0 (Scaffold)

Express + ES modules + nodemon + PostgreSQL (pg pool). This is the scaffolding
that Steps 1–6 build on top of.

## One-time setup on your machine

```bash
# 1. PostgreSQL: create a dedicated user and database
#    (run once, in psql or pgAdmin)
CREATE USER jobapp WITH PASSWORD 'secret';
CREATE DATABASE jobtracker OWNER jobapp;

# 2. Install dependencies
npm install

# 3. Create the real .env (never commit it)
cp .env.example .env
# edit .env — set DATABASE_URL to postgresql://jobapp:secret@localhost:5432/jobtracker

# 4. Run in dev mode (auto-restarts on file changes)
npm run dev
```

## Verify (definition of done)

```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok","service":"job-tracker-api","db":"connected",...}
```

If `db` says `unreachable`, the server is fine but your DATABASE_URL, the
user, or PostgreSQL itself needs checking — this is exactly the
"database → API → React" debugging order we agreed on.

## Scripts

| Command       | What it does                               |
| ------------- | ------------------------------------------ |
| `npm run dev` | Starts server with nodemon (auto-restart)  |
| `npm start`   | Starts server with plain Node (production) |

## Next step

Step 1: create the `jobs` table (with `user_id` from day one) and build the
`/api/jobs` CRUD routes on top of this scaffold.
