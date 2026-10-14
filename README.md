# QR Check-in App

A mobile-first orienteering competition app I built during my internship at TÜBİTAK for an event run by the National Technology Workshops (Milli Teknoloji Atölyeleri, MTA) programme. Participants scan QR codes placed at 7 locations across the Gebze Campus and compete to complete the course in the fastest time.

## Features

- **Participant verification** — only pre-registered names can join; no open sign-ups
- **Auto-complete name input** — fuzzy Turkish name matching (handles İ/I/ı/ğ/ş/ç/ö/ü)
- **Device binding** — one name per device, prevents duplicate registrations
- **QR check-in** — each location has a unique QR code; scanning records the visit instantly
- **Personal dashboard** — shows visited/remaining locations and completion status
- **Live leaderboard** — auto-refreshes every 5 seconds, password-protected, shows rank, progress dots, and completion time
- **Completion time tracking** — measured from first registration to last check-in

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |

## Database Schema

**`katilimcilar`** — pre-loaded participant list
| Column | Type | Description |
|---|---|---|
| `id` | int | Primary key |
| `ad_soyad` | text | Full name |
| `kullanici_id` | uuid | Linked user ID (null until claimed) |
| `claimed_at` | timestamptz | When the participant registered |

**`users`** — active competition users
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Participant name |
| `created_at` | bigint | Registration timestamp (ms) |
| `baslangic_zamani` | timestamptz | Race start time |
| `last_checkin` | bigint | Last check-in timestamp (ms) |
| `completed_at` | bigint | Completion timestamp (ms) |

**`ziyaretler`** — check-in records
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `kullanici_id` | uuid | FK → users.id |
| `nokta_id` | text | Checkpoint ID (e.g. `qr-k4m7x`) |
| `ziyaret_zamani` | timestamptz | Visit timestamp |

## How It Works

```
1. Organizer loads participant names into `katilimcilar` table
2. Participant opens the app → types their full name → auto-complete suggests matches
3. Name is verified against `katilimcilar` → UUID assigned → stored in localStorage
4. Participant scans a QR code at a location → /check-in/[id] route fires
5. Server inserts into `ziyaretler` → updates `users.last_checkin`
6. At 7/7 completions → `users.completed_at` is set
7. Leaderboard ranks by: most locations first, then earliest last check-in on ties
```

## Project Structure

```
app/
├── page.tsx                    # Registration / welcome screen
├── dashboard/page.tsx          # Personal progress dashboard
├── leaderboard/page.tsx        # Live competition leaderboard
├── check-in/[id]/page.tsx      # QR scan landing page
├── nokta/[id]/page.tsx         # Checkpoint info page
└── api/
    ├── register/route.ts       # POST — register participant
    ├── check-in/route.ts       # POST — record a check-in
    ├── progress/route.ts       # GET  — fetch user progress
    ├── leaderboard/route.ts    # GET  — fetch leaderboard data
    ├── leaderboard-auth/route.ts # POST — verify leaderboard password
    └── katilimcilar-list/route.ts # GET — autocomplete name list
lib/
├── checkpoints.ts              # Checkpoint definitions (IDs, names)
├── storage.ts                  # Supabase query helpers
└── supabase.ts                 # Supabase client
```

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Fill in your Supabase URL and keys

# Start dev server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key   # public anon key, never the service-role key
LEADERBOARD_PASSWORD=choose_a_strong_password          # server-side only
```

## Adding Participants

Participants must be added to the `katilimcilar` table in Supabase **before** the event. The app rejects any name not in this list.

You can bulk-import via:
- Supabase Dashboard → Table Editor → `katilimcilar` → Insert rows
- CSV import through the Supabase dashboard
- Supabase SQL editor with an `INSERT` statement

## QR Codes

Each checkpoint has a unique ID defined in `lib/checkpoints.ts`. QR codes should encode the URL:

```
https://your-domain.com/check-in/[checkpoint-id]
```

Example: `https://your-domain.com/check-in/qr-k4m7x`

## Resetting for a New Event

To clear all competition data while keeping the participant list intact:

```sql
DELETE FROM ziyaretler;
DELETE FROM users;
```

> Do **not** delete from `katilimcilar` unless you want to re-upload the participant list.

## Known limitations and next steps

- The leaderboard password only gates the leaderboard page; the `/api/leaderboard` endpoint itself is public. A production version would check the password (or a session token) on the server for that route too.
- Participant identity is stored in `localStorage`, so clearing browser data or switching device loses the session. A proper version would use Supabase Auth.
- `@vercel/kv` and `pg` are listed in `package.json` from an earlier storage approach and are no longer used; they can be removed.

