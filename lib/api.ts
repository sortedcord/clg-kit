export type AttendanceStatus = 'pending' | 'attended' | 'absent' | 'cancelled';
export type Session = { id: number; subjectId: number; date: string; time: string; endTime: string; title: string; code: string; room: string; color: string; classType: string; status: AttendanceStatus };

// Set EXPO_PUBLIC_API_URL to your computer's LAN address when testing on a phone,
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api/v1
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? 'Unable to reach College Kit');
  }
  return response.json() as Promise<T>;
}

export type Profile = { id: number; name: string; initials: string; college: string; programme: string; semester: string; lectureMinutes: number; recessEnabled: boolean; recessStart: string; recessEnd: string; weekendSchedule: boolean };
export type Subject = { id: number; name: string; code: string; shortName: string; color: string; classType: string; defaultRoom: string }; 

export const collegeApi = {
  profile() { return request<Profile>('/profile'); },
  updateProfile(data: { name: string; college: string; programme?: string; semester?: string }) { return request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(data) }); },
  updateSettings(data: { lectureMinutes: number; recessEnabled: boolean; recessStart: string; recessEnd: string; weekendSchedule: boolean }) { return request<{ lectureMinutes: number; recessEnabled: boolean; recessStart: string; recessEnd: string; weekendSchedule: boolean }>('/settings', { method: 'PATCH', body: JSON.stringify(data) }); },
  subjects() { return request<Subject[]>('/subjects'); },
  createSubject(data: { name: string; code: string; shortName?: string; color?: string; classType?: string; defaultRoom?: string }) { return request<{ id: number }>('/subjects', { method: 'POST', body: JSON.stringify(data) }); },
  subject(id: number) { return request<{ id: number; name: string; code: string; shortName: string; color: string; classType: string; defaultRoom: string; summary: { total: number; attended: number; absent: number; percentage: number }; sessions: Array<{ id: number; date: string; time: string; endTime: string; room: string; status: AttendanceStatus }> }>(`/subjects/${id}`); },
  updateSubject(id: number, data: { name: string; code: string; shortName: string; color?: string; classType?: string; defaultRoom?: string }) { return request<{ id: number }>(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  deleteSubject(id: number) { return request<{ id: number; deleted: boolean }>(`/subjects/${id}`, { method: 'DELETE' }); },
  schedule(date: string) { return request<{ date: string; sessions: Session[] }>(`/schedule?date=${date}`); },
  markAttendance(id: number, status: AttendanceStatus) { return request<{ id: number; status: AttendanceStatus }>(`/schedule/${id}/attendance`, { method: 'PUT', body: JSON.stringify({ status }) }); },
  removeClass(id: number) { return request<{ id: number; deleted: boolean }>(`/schedule/${id}`, { method: 'DELETE' }); },
  addOneOffClass(data: { subjectId: number; date: string; startTime: string; endTime: string; room: string }) { return request<{ id: number }>('/schedule', { method: 'POST', body: JSON.stringify(data) }); },
  attendanceSummary() { return request<{ subjects: Array<{ id: number; name: string; code: string; shortName?: string; color: string; total: number; attended: number; absent: number; cancelled: number; percentage: number }> }>('/attendance/summary'); },
  attendanceMarkers(month: string) { return request<{ markers: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> }>(`/attendance/markers?month=${month}`); },
  timetable(date: string) { return request<{ date: string; classes: Array<{ id: number; weekday: number; startTime: string; endTime: string; room: string; subjectId: number; subjectName: string; code: string; color: string; classType: string; effectiveFrom: string; effectiveTo: string | null }> }>(`/timetable/classes?date=${date}`); },
  updateTimetableClass(id: number, data: { subjectId?: number; weekday?: number; startTime?: string; endTime?: string; room?: string; effectiveFrom?: string }) { return request<{ id: number; replacesId: number; effectiveFrom: string }>(`/timetable/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  deleteTimetableClass(id: number) { return request<{ id: number; deleted: boolean }>(`/timetable/classes/${id}`, { method: 'DELETE' }); },
  addTimetableClass(data: { subjectId: number; weekday: number; startTime: string; endTime: string; room: string; effectiveFrom?: string }) { return request<{ id: number }>('/timetable/classes', { method: 'POST', body: JSON.stringify(data) }); },
};
