# Step 1 — Jobs Table + CRUD API (with user_id from day one)

I tested everything in my sandbox against a real PostgreSQL database before sending it to you: all five routes work, and I ran **nine curl tests** covering the happy paths AND the error cases (bad status, missing title, nonexistent job, delete). This is proven code, not theory.

---

## Part 1 — What changed since Step 0

Your `server/` folder now has three new things and one small change:

```
server/
├── sql/01_init.sql      ← NEW: the SQL that creates your tables (run once)
├── src/routes/jobs.js   ← NEW: the 5 CRUD routes
├── src/server.js        ← changed: mounts /api/jobs + adds error handler
├── .env.example         ← changed: added USER_ID=1
└── package.json         ← unchanged
```

---

## Part 2 — Your setup (3 steps)

### Step 2.1 — Replace the server files

Copy the new `server/` folder from my zip into your project (replace the old one, your React app is untouched). Then:

```bash
cd job-tracker/server
npm install
cp .env.example .env
```

Edit your `.env` so it has these two lines (the DATABASE_URL stays the same as Step 0):

```
DATABASE_URL=postgresql://jobapp:secret@localhost:5432/jobtracker
USER_ID=1
```

### Step 2.2 — Create the tables in PostgreSQL (the pgAdmin way)

1. Open pgAdmin → expand **Servers → PostgreSQL → Databases → jobtracker**
2. Click **Tools → Query Tool** (the SQL icon on the toolbar)
3. Open the file `server/sql/01_init.sql` in the Query Tool (File → Open File), or just copy-paste its contents into the query editor
4. Click the **play button** (Execute/Refresh)
5. You should see messages like `CREATE TABLE`, `INSERT 0 1`, `CREATE INDEX` — that means success

The script does three things, in this order:

1. **Creates the `users` table** — for Step 4's login system
2. **Creates ONE "seed" user** with email `me@test.local` — a temporary fake user so you can test the API right now, before login exists
3. **Creates the `jobs` table** — with `user_id` pointing at that seed user

If you run it a second time, nothing breaks: `IF NOT EXISTS` makes it safe to re-run.

**Quick check it worked:** in pgAdmin, right-click `jobtracker` → **Query Tool** → run `SELECT * FROM users;` — you should see one row: `me@test.local`.

### Step 2.3 — Start the server

```bash
npm run dev
```

You should see `🚀 Server listening` and `✅ Database connected`.

---

## Part 3 — The 5 routes (your complete API now)

| Route | What it does | Example curl |
|---|---|---|
| `GET /api/jobs` | List all jobs (only yours) | `curl http://localhost:4000/api/jobs` |
| `GET /api/jobs/1` | Get one job by id | `curl http://localhost:4000/api/jobs/1` |
| `POST /api/jobs` | Create a job | see below |
| `PATCH /api/jobs/1` | Update some fields | `curl -X PATCH -d '{"status":"interviewing"}'` |
| `DELETE /api/jobs/1` | Delete a job | `curl -X DELETE http://localhost:4000/api/jobs/1` |

Create your first job (copy-paste this):

```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Backend Developer","company":"Acme Corp","status":"applied","location":"Lagos (Remote)"}'
```

Move a job to a new column (this is exactly what your Kanban drag will send in Step 3):

```bash
curl -X PATCH http://localhost:4000/api/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"interviewing"}'
```

---

## Part 4 — The "why" behind the important decisions

**Why `user_id` from day one, when login doesn't exist yet?**
Because retrofitting it later means rewriting every query you already wrote. Adding it now costs minutes; fixing it later costs hours. Right now, a tiny piece of middleware reads `USER_ID=1` from your `.env` and treats every request as "the seed user". When Step 5 adds real JWT login, we replace only that one middleware function — and none of your 5 routes change. That's what "designed with auth in mind" actually means in practice.

**Why `$1, $2` instead of putting values in the SQL string?**
This is the #1 security rule in backend development. Never build SQL like `"INSERT INTO jobs VALUES ('" + title + "')"` — if someone sends a title like `'; DROP TABLE jobs; --`, your app executes it. This attack is called **SQL injection**. Parameterized queries (`$1` with a separate values array) keep data and code strictly separated, so PostgreSQL can never confuse them. Always use parameters, every time, no exceptions.

**Why validate `status` in code AND in the database?**
The database has a `CHECK` constraint (it physically refuses any status that isn't one of the six kanban columns). The code checks it first so you get a clean, friendly error message (`"status must be one of: ..."`) instead of a raw database error. Two layers of defense, each with a different job.

**Why `WHERE id = $1 AND user_id = $2` on every read/update/delete?**
That `user_id` check is authorization. It means "you can only touch jobs that belong to you." Right now it's always the seed user, so it feels decorative — but the moment Step 5 adds real login, this exact clause is what stops Alice from seeing Bob's jobs. Writing it from day one means Step 5 is a small change, not a rewrite.

**Why `PATCH` and not `PUT` for updates?**
`PUT` means "replace the whole job" — you'd have to send title, company, status, location... all of it, even to change one field. `PATCH` means "change only what I'm sending". When your Kanban board drags a card, it sends `{ "status": "interviewing" }` — one field — and the code builds the `UPDATE` statement from only the fields you sent. This is the same reason the kanban drag in Step 3 will be easy.

**Why the centralized error handler at the bottom of server.js?**
Every route forwards errors with `next(err)` instead of writing its own try/catch error response. One place handles all errors, returns a clean JSON error, and — importantly — never sends stack traces to the client (stack traces help attackers; your terminal log is where they belong).

---

## Part 5 — Definition of done (verify yourself)

1. `npm run dev` shows both `🚀 Server listening` AND `✅ Database connected`.
2. In pgAdmin, `SELECT * FROM users;` on the `jobtracker` database shows one row (`me@test.local`), and the `jobs` table exists.
3. The `curl` POST command above returns a job with `"id": 1` and `"user_id": 1`.
4. `GET /api/jobs` returns that job; `PATCH` changes its status; `DELETE` removes it (HTTP 204, no body).
5. Sending `{"status":"fired"}` returns HTTP **400** with the friendly error — your validation works.
6. (Optional but great practice) Open pgAdmin and run `SELECT * FROM jobs;` — see the data your API inserted. This is the "peek at the warehouse" moment: your app put the data there, not you.

When all boxes are green, reply **"Step 1 done"** and we move to **Step 2: testing every route with Postman/Thunder Client** — where I'll show you how to save these requests so you never re-type curl commands again.
