# PatrolRMS

**Commercial Law Enforcement Records Management System**  
Product Owner: Cpl. J. Bradford, San Diego County Sheriff's Department  
Legal: California Labor Code §2870 — developed independently using personal resources.

---

## Architecture

```
patrolrms/
├── apps/
│   ├── api/          Express 5 + TypeScript + PostgreSQL + Redis
│   └── mobile/       React 18 + TypeScript + Vite + Tailwind + Capacitor
├── docker-compose.yml
└── nginx.conf
```

## Quick Start (Local Dev)

### Prerequisites
- Docker Desktop
- Node.js 20+
- npm 10+

### 1. Start the database and cache
```bash
cd patrolrms
docker-compose up postgres redis -d
```

### 2. Start the API
```bash
cd apps/api
npm install
npm run dev
# Runs migrations + seed data automatically on first start
```

### 3. Start the frontend
```bash
cd apps/mobile
npm install
npm run dev
# Opens at http://localhost:5173
```

### Default login credentials
| Badge  | PIN  | Role       |
|--------|------|------------|
| C003   | 1234 | Supervisor |
| D001   | 1234 | Officer    |
| ADMIN  | 0000 | Admin      |

---

## Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in your values.

### Required for production
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — 256-bit random string
- `JWT_REFRESH_SECRET` — separate 256-bit random string
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` — for evidence file storage

---

## Feature Overview

| Screen | Description |
|--------|-------------|
| Login | PIN-based auth, Bronco desert BG |
| Location | Station picker with admin sub-tabs |
| Case Queue | Searchable cases, priority color-coding, real-time WS badge |
| Action | Report type selector (7 types) |
| Case/Incident Report | 35-field incident form with voice dictation |
| Arrest Report | 40-field arrest + booking form |
| Property & Evidence | 3-tab evidence log with chain of custody |
| Traffic Collision | 5-tab SWITRS-compatible collision form |
| Tow/Impound | Vehicle tow record with multi-select reason checkboxes |
| Deputy's Report | 3-tab activity log with use-of-force and equipment |
| Digital Evidence | File/media manager with S3 upload and presigned download |
| Supervisor Queue | Real-time approve/reject dashboard |

---

## Android Build (Capacitor)

```bash
cd apps/mobile
npm run build
npm run cap:sync
npm run cap:android   # Opens Android Studio
```

### Required Android permissions (already in AndroidManifest)
- `CAMERA`
- `RECORD_AUDIO`
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
- `ACCESS_FINE_LOCATION`

### Target
- Android 10+ (API 29+)
- Test device: Samsung Galaxy Tab A

---

## Multi-Tenancy

Each agency gets its own PostgreSQL schema (`<slug>.*`).

### Onboard a new agency
```sql
-- 1. Register the agency
INSERT INTO public.agencies (slug, name, tier) VALUES ('new_agency', 'New Agency Name', 'standard');

-- 2. Run migration to create schema
DEFAULT_AGENCY_SLUG=new_agency npx knex migrate:latest
```

### Licensing tiers
| Tier | Users | Locations | Retention |
|------|-------|-----------|-----------|
| Standard | 50 | 5 | 90 days |
| Premium | Unlimited | Unlimited | 7 years |

---

## PDF Reports

Server-side generation via Puppeteer + Nunjucks templates.

`GET /v1/reports/:id/pdf` — returns PDF binary.

Templates in `apps/api/src/templates/reports/`. Each report type has its own HTML template extending `base.html`. DRAFT watermark shown for Draft/Pending status.

---

## Security

- PIN hashed with bcrypt (cost 12)
- JWT (1h) + httpOnly refresh cookie (7d)
- 5 failed attempts → account locked (admin unlock via `POST /admin/users/:id/unlock`)
- 15-minute idle auto-logout (implement in frontend via activity listener)
- Audit log on every create/read/update/delete
- TLS 1.2+ enforced at Nginx
- S3 presigned URLs (1h expiry) for file downloads
- No PII in URL params

---

## Offline Mode

Form drafts saved to IndexedDB (Dexie.js) on every keystroke (2s debounce).  
On reconnect, `useNetwork` hook automatically flushes the sync queue to the API.  
Banner shown when offline: "Offline — changes saved locally".

---

## Development Milestones

| # | Status | Milestone |
|---|--------|-----------|
| 1 | ✅ | Foundation — monorepo, Docker, DB, auth |
| 2 | ✅ | Core screens — Login, Location, Case Queue |
| 3 | ✅ | Case Report Form — CRUD, autosave, offline |
| 4 | ✅ | Arrest + Property Forms |
| 5 | ✅ | Collision + Tow Forms |
| 6 | ✅ | Deputy Report + Digital Evidence |
| 7 | ✅ | Supervisor Queue + WebSocket |
| 8 | ✅ | Admin Panel (users, locations, stats) |
| 9 | ⬜ | Multi-tenant schema isolation (schema per agency) |
| 10 | ⬜ | Android packaging + Play Store prep |
