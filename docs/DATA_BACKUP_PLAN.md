# College Kit Data Export, Reset, and Restore Plan

## Objective

Add a versioned backup system that lets a user:

1. Export every piece of College Kit data into one portable JSON backup.
2. Download or share that backup.
3. Reset the application to a clean state.
4. Import the backup later.
5. Recover profile, settings, subjects, schedules, attendance, notes, and history without broken relationships or data loss.

The acceptance criterion is:

> Export snapshot A -> reset the application -> import snapshot A -> export snapshot B must produce equivalent user data with no missing records, notes, attendance, settings, history, or broken relationships.

---

## 1. Data covered by the backup

The snapshot must include all user-owned records in the database.

### Profile and settings (`users`)

- Name
- Initials
- College
- Programme
- Semester
- Default lecture duration
- Recess enabled state
- Recess start and end
- Weekend schedule setting

### Subjects (`subjects`)

- Subject ID
- Name
- Code
- Short name
- Color
- Class type
- Default room

### Recurring timetable (`timetable_classes`)

- Timetable rule ID
- Subject relationship
- Weekday
- Start and end times
- Room
- Active state
- Effective-from date
- Effective-to date
- Creation timestamp

### Individual lectures (`class_sessions`)

- Lecture ID
- Subject relationship
- Recurring timetable relationship, when applicable
- Date
- Start and end times
- Room
- One-off/override state
- Removed state
- Lecture notes
- Creation timestamp

### Attendance (`attendance`)

- Attendance record ID
- Lecture relationship
- Attendance status
- Marked timestamp
- Attendance note, if present

Include historical, current, future, recurring, one-off, cancelled, overridden, removed, and noted lecture data. Export must not only include records currently visible in the UI.

---

## 2. Versioned backup format

Use a readable JSON document:

```json
{
  "format": "college-kit-backup",
  "schemaVersion": 1,
  "appVersion": "1.0.0",
  "exportedAt": "2026-09-05T08:30:00.000Z",
  "checksum": "sha256:...",
  "data": {
    "profile": {},
    "subjects": [],
    "timetableClasses": [],
    "classSessions": [],
    "attendance": []
  },
  "summary": {
    "subjects": 11,
    "timetableClasses": 24,
    "classSessions": 148,
    "attendanceRecords": 87,
    "lectureNotes": 12
  }
}
```

`schemaVersion` allows future versions to migrate older backup files instead of rejecting them.

Use timestamped filenames such as:

```text
college-kit-backup-2026-09-05-0830.json
```

Do not include the student's name or college in the filename.

---

## 3. Backend export endpoint

Add:

```http
GET /api/v1/data/export
```

### Export sequence

1. Read the current user profile.
2. Read every subject owned by the user.
3. Read all timetable rules owned by the user.
4. Read all lecture sessions owned by the user.
5. Read attendance rows for exported lecture sessions.
6. Convert database field names to stable backup field names.
7. Generate record counts.
8. Generate a checksum over the canonical `data` object.
9. Return the complete backup document.

Export must not call `ensureSessions()`, because exporting must be read-only and must not mutate the database by generating sessions.

Return:

```http
Content-Type: application/json
Content-Disposition: attachment; filename="college-kit-backup-....json"
Cache-Control: no-store
```

---

## 4. Backup validation and preview

Add:

```http
POST /api/v1/data/import/preview
```

This validates the JSON without modifying the database.

### Structural validation

Verify:

- Root value is an object.
- `format` is `college-kit-backup`.
- `schemaVersion` is supported.
- Required data collections exist.
- IDs are positive integers.
- Dates are valid `YYYY-MM-DD` values.
- Times are valid `HH:mm` values.
- Weekdays are between `0` and `6`.
- Attendance statuses are supported.
- Required strings are present.
- Backup size is within the request limit.

### Relationship validation

Verify:

- Every timetable class refers to an included subject.
- Every lecture refers to an included subject.
- Every recurring lecture's timetable ID exists in the backup.
- Every attendance record refers to an included lecture.
- Subject codes are unique.
- Subject, timetable, lecture, and attendance IDs are unique.
- Attendance contains no duplicate lecture relationship.

### Integrity validation

Recalculate the checksum and compare it with the snapshot checksum. A mismatch must prevent import.

Preview response:

```json
{
  "valid": true,
  "schemaVersion": 1,
  "exportedAt": "2026-09-05T08:30:00.000Z",
  "profile": {
    "name": "Aditya Gupta",
    "college": "Maharaja Agrasen Institute of Technology"
  },
  "summary": {
    "subjects": 11,
    "timetableClasses": 24,
    "classSessions": 148,
    "attendanceRecords": 87,
    "lectureNotes": 12
  },
  "warnings": []
}
```

---

## 5. Transactional import endpoint

Add:

```http
POST /api/v1/data/import
```

Request body:

```json
{
  "confirmation": "REPLACE_CURRENT_DATA",
  "backup": {}
}
```

Reject the request unless the exact confirmation value is supplied.

### Transaction sequence

Run all work inside one SQLite transaction:

```text
BEGIN IMMEDIATE

1. Validate the full backup again.
2. Delete current attendance records.
3. Delete current lecture sessions.
4. Delete current timetable rules.
5. Delete current subjects.
6. Update the existing user/profile row.
7. Insert subjects using original explicit IDs.
8. Insert timetable rules using original explicit IDs.
9. Insert lecture sessions using original explicit IDs.
10. Insert attendance records using original explicit IDs.
11. Update SQLite auto-increment sequences.
12. Run foreign-key integrity checks.
13. Commit.

On any error:
ROLLBACK
```

Preserve original IDs to retain relationships without requiring a foreign-key remapping pass.

Before committing, run:

```sql
PRAGMA foreign_key_check;
```

Any returned row must cause a rollback.

---

## 6. Reset endpoint

Add:

```http
POST /api/v1/data/reset
```

Expected body:

```json
{
  "confirmation": "RESET_COLLEGE_KIT"
}
```

### Reset behavior

Inside a transaction:

1. Delete attendance.
2. Delete class sessions.
3. Delete timetable rules.
4. Delete subjects.
5. Reset the existing profile to onboarding values.
6. Restore default settings.
7. Reset applicable SQLite sequences.
8. Commit.

Keep the fixed local user row because the prototype uses `STUDENT_ID`.

The UI must use a two-step destructive confirmation and recommend exporting a backup first.

---

## 7. Settings interface

Add a `Data & backup` section in Settings:

```text
Data & backup
Keep a portable copy of your College Kit data.
```

### Export

```text
Export data
Download a complete snapshot of your profile, timetable,
attendance, and lecture notes.

Export backup
```

States:

- Default
- Preparing backup
- Sharing/downloading
- Export complete
- Export failed

### Import

```text
Import data
Restore College Kit from a previously exported backup.

Choose backup
```

Flow:

```text
Choose file
    -> Read JSON
    -> Preview validation
    -> Show summary
    -> Confirm replacement
    -> Import transaction
    -> Reload app state
```

The preview must show export date, version, profile, counts, warnings, and the destructive replacement consequence.

### Reset

Use a visually separate danger-soft region:

```text
Reset College Kit
Remove all saved data and return to onboarding.

Reset all data
```

Include privacy copy:

```text
Backup files may contain personal details and lecture notes. Store them somewhere private.
```

---

## 8. Cross-platform file handling

Install Expo SDK-compatible modules:

```bash
npx expo install expo-file-system expo-sharing expo-document-picker
```

### Native export

1. Request the backup JSON.
2. Write it to the app cache using Expo File System.
3. Open the system share sheet with Expo Sharing.
4. Let the user save/share it.
5. Remove the temporary file when appropriate.

### Native import

1. Open Expo Document Picker.
2. Restrict selection to JSON-like files.
3. Copy to cache if required.
4. Read as text.
5. Parse with guarded error handling.
6. Enforce a file-size limit before parsing.
7. Send to the preview endpoint.

### Web export

1. Fetch the backup.
2. Create a JSON `Blob`.
3. Create a temporary object URL.
4. Trigger a browser download.
5. Revoke the object URL.

### Web import

Use Expo Document Picker web support or a hidden browser input accepting `.json` and `application/json`. Pass the parsed document through the same validation and preview flow.

---

## 9. Client architecture

Create:

```text
lib/backup.ts
components/data-backup-section.tsx
components/import-preview-sheet.tsx
```

`lib/backup.ts` should own:

- Export API request
- Platform-specific download/share
- Platform-specific file selection
- JSON parsing
- File-size checks
- Preview request
- Confirmed import request
- Reset request
- User-facing error normalization

Extend `collegeApi` with:

```ts
exportData()
previewImport(backup)
importData(backup)
resetData()
```

Keep file-system and backup concerns out of `app/settings.tsx`.

---

## 10. Restore and reset behavior

After successful import:

1. Close preview/confirmation sheets.
2. Clear screen-level cached state.
3. Reload profile and settings.
4. Return to Today.
5. Re-fetch schedule, subjects, timetable, attendance, and notes.
6. Show a success message.
7. Route to onboarding if the restored profile is incomplete.

After reset:

1. Close open sheets.
2. Clear UI state.
3. Replace navigation history with `/onboarding`.
4. Show the empty onboarding state.

---

## 11. Error handling

Use specific recovery-oriented messages:

- Invalid JSON: `This file is not valid JSON. Choose a College Kit backup file.`
- Wrong format: `This is not a College Kit backup.`
- Unsupported version: `This backup was created by an unsupported version of College Kit.`
- Damaged file: `This backup appears to be incomplete or modified.`
- Broken relationships: `The backup contains missing subject or lecture relationships. Your current data was not changed.`
- Transaction failure: `Couldn’t restore the backup. Your current data is unchanged.`
- Export failure: `Couldn’t prepare the backup. Check the connection and try again.`

Because import is transactional, failed imports must never partially replace current data.

---

## 12. Security and privacy

- Never upload backups to a third-party service.
- Do not log backup bodies, names, or notes.
- Use `Cache-Control: no-store` for export responses.
- Enforce a request-size limit, such as 10 MB.
- Reject unsafe/prototype-pollution keys during validation.
- Ignore or reject unknown database columns.
- Never execute SQL generated from backup field names.
- Use prepared statements for all inserted values.
- Treat backup files as private educational data.

---

## 13. Testing plan

### Backend round-trip test

1. Seed profile and settings.
2. Create multiple subjects.
3. Add recurring timetable rules.
4. Add one-off lectures.
5. Add overrides and removed lectures.
6. Mark attendance states.
7. Add lecture notes.
8. Export snapshot A.
9. Reset the app.
10. Import snapshot A.
11. Export snapshot B.
12. Compare normalized `data` from A and B deeply.

### Backend edge cases

- Empty account export/import
- Duplicate IDs
- Duplicate subject codes
- Invalid dates and times
- Unsupported attendance status
- Unsupported schema version
- Checksum mismatch
- Large notes
- Cancelled lectures
- Removed lectures
- Recurring timetable history
- Import over non-empty current data
- Transaction rollback preservation

### Playwright coverage

- Export creates a `.json` download.
- Export file has the expected format and summary.
- Invalid files show clear validation errors.
- Valid files show the import preview.
- Cancelling preview changes nothing.
- Confirmed import restores profile, settings, subjects, timetable, attendance, and notes.
- Reset requires confirmation.
- Reset routes to onboarding.
- Failed import leaves current data unchanged.

### Docker verification

After implementation and commit:

```bash
docker compose up --build -d
curl --fail http://localhost:8080/health
```

Execute the complete export -> reset -> import -> export round trip against the Docker deployment.

---

## 14. Recommended implementation order

1. Define backup TypeScript types and schema version.
2. Add backend snapshot builder.
3. Add export endpoint.
4. Add validation utilities.
5. Add preview endpoint.
6. Add transactional import endpoint.
7. Add reset endpoint.
8. Add `collegeApi` methods.
9. Install Expo file modules.
10. Build platform-specific backup adapters.
11. Add the Settings `Data & backup` section.
12. Build import preview and confirmation sheets.
13. Add navigation refresh behavior after restore/reset.
14. Add backend round-trip tests.
15. Add Playwright download/import/reset tests.
16. Test native file flows.
17. Commit and push.
18. Run `docker compose up --build -d`.
19. Execute complete Docker round-trip verification.
