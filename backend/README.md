# Backend Setup (Supabase-first)

This project ships with a Supabase-first backend option. You can also replace it with a Node API.

## 1) Provision Supabase

1. Create a new project at https://supabase.com
2. In the SQL editor, run the scripts in order:
   - `supabase/01_schema.sql`
   - `supabase/02_rls.sql`
   - `supabase/03_functions.sql`
   - `supabase/04_optimistic.sql`
3. Copy your Project URL and anon public key.

## 2) Configure the app

Edit `app.json` and set:

```json
{
  "expo": {
    "extra": {
      "SUPABASE_URL": "https://YOUR_REF.supabase.co",
      "SUPABASE_ANON_KEY": "YOUR_ANON_KEY"
    }
  }
}
```

## 3) Run the app

- `npm start`
- Use the UI to register/login, create lists and items. API helpers live in `src/services/api/`.

## 4) RLS & Security

- Policies ensure only family members can access data.
- Owners can add/remove members.
- Snapshots are append-only.

## 5) Optimistic Concurrency & Sync

- DB has `updated_at` with triggers.
- Client provides a local mutation queue with retries and conflict policy:
  - Last-write-wins via `updated_at`.
  - For price changes, snapshots always append.

## 6) Realtime

- `src/services/realtime.ts` subscribes to lists/items/snapshots.
- Ensure RLS allows your user to receive changes.

## 7) Observability & Costs (roadmap)

- Logs: pino/winston; Metrics: OpenTelemetry exporters.
- Cron: use Supabase Scheduled Functions / external cron to aggregate monthly spend and prune old snapshots.

## 8) Optional Node API

- NestJS/Express + Prisma + Postgres
- JWT Auth (Supabase auth tokens or own issuer)
- Endpoints mirror the README proposal. Add rate limiting (Upstash/Redis), server-side zod validation, and audit logs.
