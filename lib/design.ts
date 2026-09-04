import { colors, type SemanticTone, type SubjectTone } from '@/components/ui';

const subjectTones = Object.keys(colors.subject) as SubjectTone[];

const hash = (value: string | number) => {
  const input = String(value);
  let result = 0;
  for (let index = 0; index < input.length; index += 1) result = ((result << 5) - result + input.charCodeAt(index)) | 0;
  return Math.abs(result);
};

/** Maps persisted subjects to one stable accessible surface/accent pair. */
export function subjectToneFor(identity: string | number, savedColor?: string): SubjectTone {
  const normalized = savedColor?.toUpperCase();
  const matched = subjectTones.find((tone) => colors.subject[tone].accent.toUpperCase() === normalized || colors.subject[tone].surface.toUpperCase() === normalized);
  return matched ?? subjectTones[hash(identity) % subjectTones.length];
}

export function attendanceTone(percentage: number, total: number, threshold = 75): SemanticTone {
  if (!total) return 'neutral';
  if (percentage >= threshold) return 'success';
  if (percentage >= threshold - 10) return 'warning';
  return 'danger';
}

export function attendanceMessage(percentage: number, total: number, threshold = 75) {
  if (!total) return { title: 'No attendance yet', message: 'Mark your first class to start tracking progress.' };
  if (percentage >= threshold + 5) return { title: 'You’re on track', message: `${percentage}% overall · Keep it above ${threshold}%.` };
  if (percentage >= threshold) return { title: 'You’re just above the target', message: `${percentage}% overall · Your target is ${threshold}%.` };
  return { title: 'Attendance needs attention', message: `${percentage}% overall · Your target is ${threshold}%.` };
}
