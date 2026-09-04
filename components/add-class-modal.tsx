import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  BottomSheet,
  Button,
  FormField,
  InlineBanner,
  SubjectBadge,
  colors,
  radius,
  spacing,
} from '@/components/ui';
import { dateFromKey, formatDayHeading, timeToMinutes } from '@/lib/date';
import { subjectToneFor } from '@/lib/design';
import { collegeApi, type Subject } from '@/lib/api';

type Props = { visible: boolean; onClose: () => void; onAdded: () => void; date: string; regular?: boolean; weekday?: number };
type TimeRange = { start: string; end: string };

const subjectShortName = (subject: Subject) => subject.shortName || subject.name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').toUpperCase().slice(0, 6);
const addMinutes = (time: string, minutes: number) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = ((hours * 60 + mins + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const skipRecess = (time: string, recessStart: string, recessEnd: string) => time >= recessStart && time < recessEnd ? recessEnd : time;
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function AddClassModal({ visible, onClose, onAdded, date, regular = false, weekday }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [lectureMinutes, setLectureMinutes] = useState(60);
  const [recessEnabled, setRecessEnabled] = useState(true);
  const [recess, setRecess] = useState('13:00–14:00');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [existingRanges, setExistingRanges] = useState<TimeRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    const existing = regular
      ? collegeApi.timetable(date).then(({ classes }) => classes.map((item) => ({ start: item.startTime, end: item.endTime })))
      : collegeApi.schedule(date).then(({ sessions }) => sessions.filter((item) => item.status !== 'cancelled').map((item) => ({ start: item.time, end: item.endTime })));

    Promise.all([collegeApi.subjects(), collegeApi.profile(), existing])
      .then(([items, profile, ranges]) => {
        setSubjects(items);
        setSubjectId(items[0]?.id ?? null);
        setRoom(items[0]?.defaultRoom ?? '');
        setExistingRanges(ranges);
        const minutes = profile.lectureMinutes ?? 60;
        const recessIsEnabled = Boolean(profile.recessEnabled);
        const recessStart = profile.recessStart ?? '13:00';
        const recessEnd = profile.recessEnd ?? '14:00';
        const lastEnd = [...ranges].sort((left, right) => left.end.localeCompare(right.end)).at(-1)?.end;
        const nextStart = recessIsEnabled ? skipRecess(lastEnd || '09:00', recessStart, recessEnd) : (lastEnd || '09:00');
        setLectureMinutes(minutes);
        setRecessEnabled(recessIsEnabled);
        setRecess(`${recessStart}–${recessEnd}`);
        setStartTime(nextStart);
        setEndTime(addMinutes(nextStart, minutes));
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [visible, date, regular]);

  const updateStart = (value: string) => {
    setStartTime(value);
    setError('');
    if (validTime(value)) setEndTime(addMinutes(value, lectureMinutes));
  };

  const save = async () => {
    if (!subjectId) {
      setError('Choose a subject before adding this class.');
      return;
    }
    if (!validTime(startTime) || !validTime(endTime) || timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      setError('Use valid times and make the end time later than the start time.');
      return;
    }
    const overlaps = existingRanges.some((range) => timeToMinutes(startTime) < timeToMinutes(range.end) && timeToMinutes(endTime) > timeToMinutes(range.start));
    if (overlaps) {
      setError('This time overlaps another class. Choose a different time range.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const location = room.trim() || 'TBA';
      if (regular) await collegeApi.addTimetableClass({ subjectId, weekday: weekday ?? dateFromKey(date).getDay(), startTime, endTime, room: location, effectiveFrom: date });
      else await collegeApi.addOneOffClass({ subjectId, date, startTime, endTime, room: location });
      onAdded();
      onClose();
      setRoom('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const title = regular ? 'Add recurring class' : 'Add a class';
  const context = regular
    ? `Repeats on ${new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(dateFromKey(date))}. Recurring changes begin in the future.`
    : `One-off class for ${formatDayHeading(dateFromKey(date))}.`;

  return <BottomSheet
    visible={visible}
    title={title}
    onClose={onClose}
    footer={<Button label={regular ? 'Add recurring class' : 'Add class'} loading={saving} disabled={loading || subjects.length === 0} haptic="success" onPress={save} trailing={<Ionicons name="checkmark" size={18} color={colors.neutral.surface} />} />}>
    <AppText variant="bodySmall" color={colors.neutral.textSecondary}>{context}</AppText>

    {error ? <InlineBanner title="Couldn’t add class" message={error} tone="danger" style={styles.feedback} /> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Loading subjects and times…</AppText></View> : null}

    {!loading ? <>
      <AppText variant="label" color={colors.neutral.textSecondary} style={styles.sectionLabel}>Subject</AppText>
      {subjects.length === 0 ? <InlineBanner title="No subjects available" message="Add a subject from onboarding or your subject list before scheduling a class." tone="warning" /> : <View style={styles.subjects}>
        {subjects.map((subject) => {
          const tone = subjectToneFor(subject.id, subject.color);
          const selected = subject.id === subjectId;
          return <Pressable
            key={subject.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${subject.name}, ${subject.code}`}
            onPress={() => { setSubjectId(subject.id); setRoom(subject.defaultRoom ?? ''); setError(''); }}
            style={({ pressed }) => [styles.subject, selected && { backgroundColor: colors.subject[tone].surface, borderColor: colors.subject[tone].accent }, pressed && styles.pressed]}>
            <SubjectBadge shortName={subjectShortName(subject)} tone={tone} size="small" />
            <View style={styles.subjectCopy}>
              <AppText variant="label" numberOfLines={1}>{subject.name}</AppText>
              <AppText variant="caption" color={colors.neutral.textMuted}>{subject.code}</AppText>
            </View>
            <View style={[styles.radio, selected && { borderColor: colors.subject[tone].accent }]}>{selected ? <View style={[styles.radioDot, { backgroundColor: colors.subject[tone].accent }]} /> : null}</View>
          </Pressable>;
        })}
      </View>}

      <View style={styles.timeHeading}>
        <AppText variant="label" color={colors.neutral.textSecondary}>Time</AppText>
        <AppText variant="caption" color={colors.neutral.textMuted}>{lectureMinutes} min default · {recessEnabled ? `recess ${recess}` : 'recess off'}</AppText>
      </View>
      <View style={styles.timeFields}>
        <FormField label="Starts" value={startTime} onChangeText={updateStart} placeholder="09:00" hint="HH:MM" containerStyle={styles.timeField} />
        <FormField label="Ends" value={endTime} onChangeText={(value) => { setEndTime(value); setError(''); }} placeholder="10:00" hint="HH:MM" containerStyle={styles.timeField} />
      </View>

      <FormField label="Room or location" value={room} onChangeText={setRoom} placeholder="e.g. B-204 or Lab 3" hint="Starts with the subject default; you can override it for this class." containerStyle={styles.roomField} />
    </> : null}
  </BottomSheet>;
}

const styles = StyleSheet.create({
  feedback: { marginTop: spacing[4] },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  sectionLabel: { marginTop: spacing[6], marginBottom: spacing[3] },
  subjects: { gap: spacing[2] },
  subject: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.card, borderWidth: 1, borderColor: colors.neutral.border, backgroundColor: colors.neutral.surface },
  pressed: { opacity: 0.76 },
  subjectCopy: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.neutral.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  timeHeading: { marginTop: spacing[6], marginBottom: spacing[3], flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing[3] },
  timeFields: { flexDirection: 'row', gap: spacing[3] },
  timeField: { flex: 1 },
  roomField: { marginTop: spacing[5], marginBottom: spacing[2] },
});
