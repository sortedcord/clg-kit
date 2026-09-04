# College Kit API

A zero-dependency Node HTTP API backed by a persistent SQLite database. The database is created at `backend/data/college-kit.db` on first start with no subjects, timetable rules, sessions, or attendance records.

## Run

```sh
npm run api
```

The API listens on `http://localhost:4000`. In a second terminal, run the Expo app:

```sh
npm start
```

For a physical device, expose the API on your development machine's LAN IP:

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api/v1 npm start
```

## Data model

- `users` — currently a seeded local user; this is the seam for authentication.
- `subjects` — course name, code, and display colour.
- `timetable_classes` — recurring weekly timetable rules.
- `class_sessions` — dated generated classes plus one-off overrides.
- `attendance` — one status per session: `pending`, `attended`, `absent`, or `cancelled`.

Sessions are generated from the weekly timetable when a date is requested. One-off sessions and edits are stored independently, so daily changes never alter the regular timetable. Cancelled sessions are excluded from attendance totals.

Recurring timetable edits are **versioned**: `PATCH /timetable/classes/:id` closes the existing rule and creates a replacement rule effective tomorrow (or a later supplied date). It only removes future, auto-generated sessions for the old rule. Past sessions, their times, and every attendance record are retained unchanged.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Service check |
| GET | `/api/v1/profile` | Current user profile |
| GET | `/api/v1/schedule?date=YYYY-MM-DD` | Get/create dated sessions |
| POST | `/api/v1/schedule` | Add a one-off class |
| PATCH / DELETE | `/api/v1/schedule/:id` | Edit/remove a dated class |
| PUT | `/api/v1/schedule/:id/attendance` | Set `{ "status": "attended" }` |
| GET / POST | `/api/v1/subjects` | List/create subjects |
| GET / POST | `/api/v1/timetable/classes?date=YYYY-MM-DD` | List/create recurring classes active for a date |
| PATCH | `/api/v1/timetable/classes/:id` | Version a recurring class change for tomorrow or later |
| GET | `/api/v1/attendance/summary` | Per-subject attendance totals |

Timetable image OCR is deliberately not performed by this service. A mobile client should upload/select an image, run OCR with a provider of choice, let the student review the extracted classes, then send confirmed subjects and timetable classes through the endpoints above. This avoids silently creating an inaccurate timetable from an image.
