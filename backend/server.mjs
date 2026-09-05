import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(join(dataDir, 'college-kit.db'));
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

const PORT = Number(process.env.PORT || 4000);
const STUDENT_ID = 1; // Replace with the authenticated user's id when auth is added.
const validStatuses = new Set(['attended', 'absent', 'cancelled', 'pending']);

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, initials TEXT NOT NULL,
      college TEXT NOT NULL DEFAULT '', programme TEXT NOT NULL DEFAULT '', semester TEXT NOT NULL DEFAULT '',
      lecture_minutes INTEGER NOT NULL DEFAULT 60, recess_enabled INTEGER NOT NULL DEFAULT 1, recess_start TEXT NOT NULL DEFAULT '13:00', recess_end TEXT NOT NULL DEFAULT '14:00', weekend_schedule INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL, code TEXT NOT NULL, short_name TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT '#0559FA',
      class_type TEXT NOT NULL DEFAULT 'Lecture', default_room TEXT NOT NULL DEFAULT '',
      UNIQUE(user_id, code)
    );
    CREATE TABLE IF NOT EXISTS timetable_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id), weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
      start_time TEXT NOT NULL, end_time TEXT NOT NULL, room TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
      effective_from TEXT NOT NULL DEFAULT '1970-01-01', effective_to TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS class_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      subject_id INTEGER NOT NULL REFERENCES subjects(id), timetable_class_id INTEGER REFERENCES timetable_classes(id),
      class_date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, room TEXT NOT NULL,
      is_override INTEGER NOT NULL DEFAULT 0, is_removed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, timetable_class_id, class_date)
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER NOT NULL UNIQUE REFERENCES class_sessions(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK(status IN ('pending', 'attended', 'absent', 'cancelled')) DEFAULT 'pending',
      marked_at TEXT, note TEXT
    );
  `);
  const subjectColumns = db.prepare('PRAGMA table_info(subjects)').all().map((column) => column.name);
  if (!subjectColumns.includes('short_name')) db.exec("ALTER TABLE subjects ADD COLUMN short_name TEXT NOT NULL DEFAULT ''");
  if (!subjectColumns.includes('class_type')) db.exec("ALTER TABLE subjects ADD COLUMN class_type TEXT NOT NULL DEFAULT 'Lecture'");
  if (!subjectColumns.includes('default_room')) db.exec("ALTER TABLE subjects ADD COLUMN default_room TEXT NOT NULL DEFAULT ''");
  const userColumns = db.prepare('PRAGMA table_info(users)').all().map((column) => column.name);
  if (!userColumns.includes('college')) db.exec("ALTER TABLE users ADD COLUMN college TEXT NOT NULL DEFAULT ''");
  if (!userColumns.includes('programme')) db.exec("ALTER TABLE users ADD COLUMN programme TEXT NOT NULL DEFAULT ''");
  if (!userColumns.includes('semester')) db.exec("ALTER TABLE users ADD COLUMN semester TEXT NOT NULL DEFAULT ''");
  if (!userColumns.includes('lecture_minutes')) db.exec('ALTER TABLE users ADD COLUMN lecture_minutes INTEGER NOT NULL DEFAULT 60');
  if (!userColumns.includes('recess_enabled')) db.exec('ALTER TABLE users ADD COLUMN recess_enabled INTEGER NOT NULL DEFAULT 1');
  if (!userColumns.includes('recess_start')) db.exec("ALTER TABLE users ADD COLUMN recess_start TEXT NOT NULL DEFAULT '13:00'");
  if (!userColumns.includes('recess_end')) db.exec("ALTER TABLE users ADD COLUMN recess_end TEXT NOT NULL DEFAULT '14:00'");
  if (!userColumns.includes('weekend_schedule')) db.exec('ALTER TABLE users ADD COLUMN weekend_schedule INTEGER NOT NULL DEFAULT 0');
  const sessionColumns = db.prepare('PRAGMA table_info(class_sessions)').all().map((column) => column.name);
  if (!sessionColumns.includes('is_removed')) db.exec('ALTER TABLE class_sessions ADD COLUMN is_removed INTEGER NOT NULL DEFAULT 0');
  const templateColumns = db.prepare('PRAGMA table_info(timetable_classes)').all().map((column) => column.name);
  if (!templateColumns.includes('effective_from')) db.exec("ALTER TABLE timetable_classes ADD COLUMN effective_from TEXT NOT NULL DEFAULT '1970-01-01'");
  if (!templateColumns.includes('effective_to')) db.exec('ALTER TABLE timetable_classes ADD COLUMN effective_to TEXT');
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(STUDENT_ID);
  // Keep only an empty local account record for the unauthenticated prototype.
  // Courses, timetable rules, sessions, and attendance are never seeded.
  if (!user) db.prepare('INSERT INTO users (id, name, initials) VALUES (?, ?, ?)').run(STUDENT_ID, '', '');
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS' });
  res.end(JSON.stringify(body));
}
function error(res, status, message) { json(res, status, { error: message }); }
function dateIsValid(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).valueOf()); }
function weekdayFor(date) { return new Date(`${date}T12:00:00`).getDay(); }
function localDateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function nextDateKey(date) { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + 1); return localDateKey(next); }
function previousDateKey(date) { const previous = new Date(`${date}T12:00:00`); previous.setDate(previous.getDate() - 1); return localDateKey(previous); }
function readBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', c => { raw += c; if (raw.length > 1_000_000) reject(new Error('Request body is too large')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Body must be valid JSON')); } }); req.on('error', reject); }); }
function sessionRows(date) {
  return db.prepare(`SELECT cs.id, cs.class_date AS date, cs.start_time AS time, cs.end_time AS endTime, cs.room, cs.is_override AS isOverride,
    s.id AS subjectId, s.name AS title, s.code, s.color, s.class_type AS classType, COALESCE(a.status, 'pending') AS status, a.note
    FROM class_sessions cs JOIN subjects s ON s.id = cs.subject_id LEFT JOIN attendance a ON a.session_id = cs.id
    WHERE cs.user_id = ? AND cs.class_date = ? AND cs.is_removed = 0 ORDER BY cs.start_time`).all(STUDENT_ID, date);
}
function ensureSessions(date) {
  const templates = db.prepare(`SELECT * FROM timetable_classes
    WHERE user_id = ? AND weekday = ? AND active = 1 AND effective_from <= ?
    AND (effective_to IS NULL OR effective_to >= ?)`).all(STUDENT_ID, weekdayFor(date), date, date);
  const create = db.prepare('INSERT OR IGNORE INTO class_sessions (user_id, subject_id, timetable_class_id, class_date, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const item of templates) create.run(STUDENT_ID, item.subject_id, item.id, date, item.start_time, item.end_time, item.room);
}
function getSubject(id) {
  if (id === undefined || id === null || Number.isNaN(Number(id))) return null;
  return db.prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?').get(Number(id), STUDENT_ID);
}

migrate();
const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  try {
    if (req.method === 'GET' && path === '/health') return json(res, 200, { ok: true });
    if (req.method === 'GET' && path === '/api/v1/profile') return json(res, 200, db.prepare('SELECT id, name, initials, college, programme, semester, lecture_minutes AS lectureMinutes, recess_enabled AS recessEnabled, recess_start AS recessStart, recess_end AS recessEnd, weekend_schedule AS weekendSchedule FROM users WHERE id = ?').get(STUDENT_ID));
    if (req.method === 'PATCH' && path === '/api/v1/settings') {
      const body = await readBody(req); const minutes = Number(body.lectureMinutes); const recessEnabled = body.recessEnabled === false ? 0 : 1; const weekendSchedule = body.weekendSchedule ? 1 : 0;
      const validRecess = /^\d\d:\d\d$/.test(body.recessStart) && /^\d\d:\d\d$/.test(body.recessEnd) && (!recessEnabled || body.recessStart < body.recessEnd);
      if (!Number.isInteger(minutes) || minutes < 15 || minutes > 360 || !validRecess) return error(res, 400, 'Use a lecture length between 15 and 360 minutes and valid recess times');
      db.prepare('UPDATE users SET lecture_minutes = ?, recess_enabled = ?, recess_start = ?, recess_end = ?, weekend_schedule = ? WHERE id = ?').run(minutes, recessEnabled, body.recessStart, body.recessEnd, weekendSchedule, STUDENT_ID);
      return json(res, 200, { lectureMinutes: minutes, recessEnabled: Boolean(recessEnabled), recessStart: body.recessStart, recessEnd: body.recessEnd, weekendSchedule: Boolean(weekendSchedule) });
    }
    if (req.method === 'PUT' && path === '/api/v1/profile') {
      const body = await readBody(req);
      if (!body.name?.trim() || !body.college?.trim()) return error(res, 400, 'name and college are required');
      const initials = body.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      db.prepare('UPDATE users SET name = ?, initials = ?, college = ?, programme = ?, semester = ? WHERE id = ?').run(body.name.trim(), initials, body.college.trim(), body.programme?.trim() || '', body.semester?.trim() || '', STUDENT_ID);
      return json(res, 200, db.prepare('SELECT id, name, initials, college, programme, semester, lecture_minutes AS lectureMinutes, recess_enabled AS recessEnabled, recess_start AS recessStart, recess_end AS recessEnd, weekend_schedule AS weekendSchedule FROM users WHERE id = ?').get(STUDENT_ID));
    }

    if (req.method === 'GET' && path === '/api/v1/schedule') {
      const date = url.searchParams.get('date');
      if (!dateIsValid(date)) return error(res, 400, 'date must be YYYY-MM-DD');
      ensureSessions(date);
      return json(res, 200, { date, sessions: sessionRows(date) });
    }
    if (req.method === 'POST' && path === '/api/v1/schedule') {
      const body = await readBody(req);
      const { subjectId, date, startTime, endTime, room } = body;
      if (!getSubject(subjectId) || !dateIsValid(date) || !/^\d\d:\d\d$/.test(startTime) || !/^\d\d:\d\d$/.test(endTime) || !room?.trim()) return error(res, 400, 'subjectId, date, startTime, endTime and room are required');
      const existing = db.prepare('SELECT id FROM class_sessions WHERE user_id = ? AND subject_id = ? AND class_date = ? AND start_time = ? AND is_removed = 0').get(STUDENT_ID, subjectId, date, startTime);
      if (existing) return json(res, 200, { id: existing.id });
      const record = db.prepare('INSERT INTO class_sessions (user_id, subject_id, class_date, start_time, end_time, room, is_override) VALUES (?, ?, ?, ?, ?, ?, 1)').run(STUDENT_ID, subjectId, date, startTime, endTime, room.trim());
      return json(res, 201, db.prepare('SELECT id FROM class_sessions WHERE id = ?').get(record.lastInsertRowid));
    }
    const scheduleMatch = path.match(/^\/api\/v1\/schedule\/(\d+)$/);
    if (req.method === 'DELETE' && scheduleMatch) {
      const id = Number(scheduleMatch[1]);
      const session = db.prepare('SELECT timetable_class_id AS timetableClassId FROM class_sessions WHERE id = ? AND user_id = ?').get(id, STUDENT_ID);
      if (!session) return error(res, 404, 'Class session not found');
      // Recurring classes are hidden only for this date, so the weekly rule remains intact.
      if (session.timetableClassId) db.prepare('UPDATE class_sessions SET is_removed = 1, is_override = 1 WHERE id = ?').run(id);
      else db.prepare('DELETE FROM class_sessions WHERE id = ? AND user_id = ?').run(id, STUDENT_ID);
      return json(res, 200, { id, deleted: true });
    }
    if (req.method === 'PATCH' && scheduleMatch) {
      const body = await readBody(req); const id = Number(scheduleMatch[1]);
      const existing = db.prepare('SELECT id FROM class_sessions WHERE id = ? AND user_id = ?').get(id, STUDENT_ID);
      if (!existing) return error(res, 404, 'Class session not found');
      const fields = []; const values = [];
      for (const [key, column] of Object.entries({ startTime: 'start_time', endTime: 'end_time', room: 'room' })) if (body[key] !== undefined) { fields.push(`${column} = ?`); values.push(typeof body[key] === 'string' ? body[key].trim() : body[key]); }
      if (!fields.length) return error(res, 400, 'No editable fields supplied');
      db.prepare(`UPDATE class_sessions SET ${fields.join(', ')}, is_override = 1 WHERE id = ?`).run(...values, id);
      return json(res, 200, { id });
    }
    const attendanceMatch = path.match(/^\/api\/v1\/schedule\/(\d+)\/attendance$/);
    if (req.method === 'PUT' && attendanceMatch) {
      const body = await readBody(req); const id = Number(attendanceMatch[1]);
      if (!validStatuses.has(body.status)) return error(res, 400, 'status must be pending, attended, absent, or cancelled');
      const session = db.prepare('SELECT id FROM class_sessions WHERE id = ? AND user_id = ?').get(id, STUDENT_ID);
      if (!session) return error(res, 404, 'Class session not found');
      db.prepare(`INSERT INTO attendance (session_id, status, marked_at, note) VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(session_id) DO UPDATE SET status = excluded.status, marked_at = CURRENT_TIMESTAMP, note = excluded.note`).run(id, body.status, body.note?.trim() || null);
      return json(res, 200, { id, status: body.status });
    }
    if (req.method === 'GET' && path === '/api/v1/subjects') {
      return json(res, 200, db.prepare('SELECT id, name, code, short_name AS shortName, color, class_type AS classType, default_room AS defaultRoom FROM subjects WHERE user_id = ? ORDER BY name').all(STUDENT_ID));
    }
    if (req.method === 'POST' && path === '/api/v1/subjects') {
      const body = await readBody(req);
      if (!body.name?.trim() || !body.code?.trim()) return error(res, 400, 'name and code are required');
      try {
        const result = db.prepare('INSERT INTO subjects (user_id, name, code, short_name, color, class_type, default_room) VALUES (?, ?, ?, ?, ?, ?, ?)').run(STUDENT_ID, body.name.trim(), body.code.trim().toUpperCase(), body.shortName?.trim() || body.code.trim().toUpperCase(), body.color || '#0559FA', body.classType?.trim() || 'Lecture', body.defaultRoom?.trim() || '');
        return json(res, 201, { id: Number(result.lastInsertRowid) });
      } catch { return error(res, 409, 'A subject with that code already exists'); }
    }
    if (req.method === 'GET' && path === '/api/v1/timetable/classes') {
      const date = url.searchParams.get('date') || localDateKey();
      if (!dateIsValid(date)) return error(res, 400, 'date must be YYYY-MM-DD');
      const rows = db.prepare(`SELECT tc.id, tc.weekday, tc.start_time AS startTime, tc.end_time AS endTime, tc.room, tc.active,
        tc.effective_from AS effectiveFrom, tc.effective_to AS effectiveTo, s.id AS subjectId, s.name AS subjectName, s.code, s.color, s.class_type AS classType
        FROM timetable_classes tc JOIN subjects s ON s.id = tc.subject_id
        WHERE tc.user_id = ? AND tc.weekday = ? AND tc.active = 1 AND tc.effective_from <= ?
        AND (tc.effective_to IS NULL OR tc.effective_to >= ?) ORDER BY tc.start_time`).all(STUDENT_ID, weekdayFor(date), date, date);
      return json(res, 200, { date, classes: rows });
    }
    if (req.method === 'POST' && path === '/api/v1/timetable/classes') {
      const body = await readBody(req);
      // A newly added recurring class must also begin in the future; past timetable history is immutable.
      const earliestFutureDate = nextDateKey(localDateKey());
      const effectiveFrom = body.effectiveFrom && dateIsValid(body.effectiveFrom) && body.effectiveFrom > localDateKey() ? body.effectiveFrom : earliestFutureDate;
      if (!getSubject(body.subjectId) || !Number.isInteger(body.weekday) || body.weekday < 0 || body.weekday > 6 || !dateIsValid(effectiveFrom) || !/^\d\d:\d\d$/.test(body.startTime) || !/^\d\d:\d\d$/.test(body.endTime) || !body.room?.trim()) return error(res, 400, 'subjectId, weekday, startTime, endTime, room and a valid effectiveFrom date are required');
      const result = db.prepare('INSERT INTO timetable_classes (user_id, subject_id, weekday, start_time, end_time, room, effective_from) VALUES (?, ?, ?, ?, ?, ?, ?)').run(STUDENT_ID, body.subjectId, body.weekday, body.startTime, body.endTime, body.room.trim(), effectiveFrom);
      return json(res, 201, { id: Number(result.lastInsertRowid), effectiveFrom });
    }
    const timetableMatch = path.match(/^\/api\/v1\/timetable\/classes\/(\d+)$/);
    if (req.method === 'DELETE' && timetableMatch) {
      const id = Number(timetableMatch[1]);
      const existing = db.prepare('SELECT * FROM timetable_classes WHERE id = ? AND user_id = ? AND active = 1').get(id, STUDENT_ID);
      if (!existing) return error(res, 404, 'Timetable class not found');
      const earliestFutureDate = nextDateKey(localDateKey());
      db.prepare('UPDATE timetable_classes SET active = 0, effective_to = ? WHERE id = ?').run(previousDateKey(earliestFutureDate), id);
      db.prepare('DELETE FROM class_sessions WHERE timetable_class_id = ? AND class_date >= ? AND is_override = 0').run(id, earliestFutureDate);
      return json(res, 200, { id, deleted: true });
    }
    if (req.method === 'PATCH' && timetableMatch) {
      const body = await readBody(req); const id = Number(timetableMatch[1]);
      const existing = db.prepare('SELECT * FROM timetable_classes WHERE id = ? AND user_id = ? AND active = 1').get(id, STUDENT_ID);
      if (!existing) return error(res, 404, 'Timetable class not found');
      // A recurring timetable edit is versioned. It can only start tomorrow or later,
      // and past sessions are never updated or deleted.
      const earliestFutureDate = nextDateKey(localDateKey());
      const effectiveFrom = body.effectiveFrom && dateIsValid(body.effectiveFrom) && body.effectiveFrom > earliestFutureDate ? body.effectiveFrom : earliestFutureDate;
      const nextSubjectId = body.subjectId === undefined ? existing.subject_id : body.subjectId;
      const nextWeekday = body.weekday === undefined ? existing.weekday : body.weekday;
      const nextStart = body.startTime === undefined ? existing.start_time : body.startTime;
      const nextEnd = body.endTime === undefined ? existing.end_time : body.endTime;
      const nextRoom = body.room === undefined ? existing.room : body.room.trim();
      if (!getSubject(nextSubjectId) || !Number.isInteger(nextWeekday) || nextWeekday < 0 || nextWeekday > 6 || !/^\d\d:\d\d$/.test(nextStart) || !/^\d\d:\d\d$/.test(nextEnd) || !nextRoom) return error(res, 400, 'Invalid timetable change');
      db.prepare('UPDATE timetable_classes SET effective_to = ? WHERE id = ?').run(previousDateKey(effectiveFrom), id);
      // Remove only generated, unmodified FUTURE sessions. Historical sessions and daily overrides stay intact.
      db.prepare('DELETE FROM class_sessions WHERE timetable_class_id = ? AND class_date >= ? AND is_override = 0').run(id, effectiveFrom);
      const result = db.prepare('INSERT INTO timetable_classes (user_id, subject_id, weekday, start_time, end_time, room, effective_from) VALUES (?, ?, ?, ?, ?, ?, ?)').run(STUDENT_ID, nextSubjectId, nextWeekday, nextStart, nextEnd, nextRoom, effectiveFrom);
      return json(res, 201, { id: Number(result.lastInsertRowid), replacesId: id, effectiveFrom });
    }
    const subjectMatch = path.match(/^\/api\/v1\/subjects\/(\d+)$/);
    if (req.method === 'GET' && subjectMatch) {
      const id = Number(subjectMatch[1]);
      const subject = db.prepare('SELECT id, name, code, short_name AS shortName, color, class_type AS classType, default_room AS defaultRoom FROM subjects WHERE id = ? AND user_id = ?').get(id, STUDENT_ID);
      if (!subject) return error(res, 404, 'Subject not found');
      const sessions = db.prepare(`SELECT cs.id, cs.class_date AS date, cs.start_time AS time, cs.end_time AS endTime, cs.room,
        COALESCE(a.status, 'pending') AS status FROM class_sessions cs LEFT JOIN attendance a ON a.session_id = cs.id
        WHERE cs.subject_id = ? AND cs.user_id = ? ORDER BY cs.class_date DESC, cs.start_time DESC`).all(id, STUDENT_ID);
      const eligible = sessions.filter((session) => session.status === 'attended' || session.status === 'absent');
      const attended = eligible.filter((session) => session.status === 'attended').length;
      return json(res, 200, { ...subject, summary: { total: eligible.length, attended, absent: eligible.filter((session) => session.status === 'absent').length, percentage: eligible.length ? Math.round(attended / eligible.length * 100) : 0 }, sessions });
    }
    if (req.method === 'PATCH' && subjectMatch) {
      const id = Number(subjectMatch[1]); const body = await readBody(req);
      const existing = getSubject(id); if (!existing) return error(res, 404, 'Subject not found');
      if (!body.name?.trim() || !body.code?.trim()) return error(res, 400, 'name and code are required');
      try {
        db.prepare('UPDATE subjects SET name = ?, code = ?, short_name = ?, color = ?, class_type = ?, default_room = ? WHERE id = ? AND user_id = ?').run(body.name.trim(), body.code.trim().toUpperCase(), body.shortName?.trim() || body.code.trim().toUpperCase(), body.color || '#0559FA', body.classType?.trim() || 'Lecture', body.defaultRoom?.trim() || '', id, STUDENT_ID);
        return json(res, 200, { id });
      } catch { return error(res, 409, 'A subject with that code already exists'); }
    }
    if (req.method === 'DELETE' && subjectMatch) {
      const id = Number(subjectMatch[1]);
      const existing = getSubject(id);
      if (!existing) return error(res, 404, 'Subject not found');
      // Cascade delete subject's attendance, sessions, and timetable classes
      const sessions = db.prepare('SELECT id FROM class_sessions WHERE subject_id = ? AND user_id = ?').all(id, STUDENT_ID);
      for (const sess of sessions) {
        db.prepare('DELETE FROM attendance WHERE session_id = ?').run(sess.id);
      }
      db.prepare('DELETE FROM class_sessions WHERE subject_id = ? AND user_id = ?').run(id, STUDENT_ID);
      db.prepare('DELETE FROM timetable_classes WHERE subject_id = ? AND user_id = ?').run(id, STUDENT_ID);
      db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(id, STUDENT_ID);
      return json(res, 200, { id, deleted: true });
    }
    if (req.method === 'GET' && path === '/api/v1/attendance/summary') {
      const rows = db.prepare(`SELECT s.id, s.name, s.code, s.short_name AS shortName, s.color,
        SUM(CASE WHEN cs.id IS NOT NULL AND a.status IN ('attended', 'absent') THEN 1 ELSE 0 END) AS total,
        SUM(CASE WHEN a.status = 'attended' THEN 1 ELSE 0 END) AS attended,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
        FROM subjects s
        LEFT JOIN class_sessions cs ON cs.subject_id = s.id AND cs.is_removed = 0
        LEFT JOIN attendance a ON a.session_id = cs.id
        WHERE s.user_id = ? GROUP BY s.id ORDER BY s.name`).all(STUDENT_ID);
      return json(res, 200, {
        subjects: rows.map(r => {
          const tot = Number(r.total);
          const att = Number(r.attended);
          return {
            id: r.id,
            name: r.name,
            code: r.code,
            shortName: r.shortName,
            color: r.color,
            total: tot,
            attended: att,
            absent: Number(r.absent),
            cancelled: Number(r.cancelled),
            percentage: tot > 0 ? Math.round((att / tot) * 100) : 0,
          };
        }),
      });
    }
    if (req.method === 'GET' && path === '/api/v1/attendance/markers') {
      const month = url.searchParams.get('month'); // Expect YYYY-MM
      if (!month || !/^\d{4}-\d{2}$/.test(month)) return error(res, 400, 'month must be YYYY-MM');
      const start = `${month}-01`;
      const [yearStr, monthStr] = month.split('-');
      const days = new Date(Number(yearStr), Number(monthStr), 0).getDate();
      const end = `${month}-${String(days).padStart(2, '0')}`;
      const sessions = db.prepare(`SELECT cs.class_date AS date, COALESCE(a.status, 'pending') AS status
        FROM class_sessions cs
        LEFT JOIN attendance a ON a.session_id = cs.id
        WHERE cs.user_id = ? AND cs.class_date >= ? AND cs.class_date <= ? AND cs.is_removed = 0`).all(STUDENT_ID, start, end);
      const byDate = {};
      for (const row of sessions) {
        if (!byDate[row.date]) byDate[row.date] = [];
        byDate[row.date].push(row.status);
      }
      const today = localDateKey();
      const markers = {};
      for (const [date, statuses] of Object.entries(byDate)) {
        if (date > today) continue;
        const held = statuses.filter((s) => s !== 'cancelled');
        if (!held.length) continue;
        if (held.every((s) => s === 'attended')) markers[date] = 'success';
        else if (held.some((s) => s === 'absent')) markers[date] = 'danger';
        else if (held.some((s) => s === 'pending')) markers[date] = 'warning';
        else markers[date] = 'neutral';
      }
      return json(res, 200, { markers });
    }
    return error(res, 404, 'Route not found');
  } catch (err) { console.error(err); return error(res, 400, err.message || 'Bad request'); }
});
server.listen(PORT, '0.0.0.0', () => console.log(`College Kit API listening on http://localhost:${PORT}`));
