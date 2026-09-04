import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AddClassModal } from '@/components/add-class-modal';
import {
  AppHeader,
  AppText,
  Button,
  Card,
  EmptyState,
  IconButton,
  InlineBanner,
  RecessCard,
  ScheduleEventCard,
  Screen,
  WeekStrip,
  colors,
  spacing,
  type WeekDay,
} from '@/components/ui';
import { addDays, dateKey, formatDayHeading, mondayOfWeek } from '@/lib/date';
import { subjectToneFor } from '@/lib/design';
import { collegeApi } from '@/lib/api';

type TimetableClass = Awaited<ReturnType<typeof collegeApi.timetable>>['classes'][number];

export default function TimetableScreen() {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState(() => {
    const today = new Date();
    return today.getDay() === 0 || today.getDay() === 6 ? mondayOfWeek(today) : today;
  });
  const [schedule, setSchedule] = useState<TimetableClass[]>([]);
  const [weekendSchedule, setWeekendSchedule] = useState(false);
  const [recess, setRecess] = useState<{ enabled: boolean; start: string; end: string }>({ enabled: false, start: '13:00', end: '14:00' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const selectedDateKey = dateKey(activeDate);
  const todayKey = dateKey(new Date());
  const weekStart = useMemo(() => mondayOfWeek(activeDate), [activeDate]);
  const weekDays: WeekDay[] = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
    .filter((date) => weekendSchedule || (date.getDay() !== 0 && date.getDay() !== 6))
    .map((date) => ({ date })), [weekStart, weekendSchedule]);

  useFocusEffect(useCallback(() => {
    let active = true;
    collegeApi.profile().then((profile) => {
      if (!active) return;
      setWeekendSchedule(Boolean(profile.weekendSchedule));
      setRecess({ enabled: Boolean(profile.recessEnabled), start: profile.recessStart, end: profile.recessEnd });
    }).catch(() => undefined);
    return () => { active = false; };
  }, []));

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    collegeApi.timetable(selectedDateKey)
      .then(({ classes }) => setSchedule(classes))
      .catch((error: Error) => { setSchedule([]); setLoadError(error.message); })
      .finally(() => setLoading(false));
  }, [selectedDateKey]);

  useEffect(() => { load(); }, [load, refresh]);

  const moveWeek = (amount: number) => setActiveDate(addDays(activeDate, amount * 7));
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(activeDate);
  const showRecess = recess.enabled && recess.start < recess.end;
  const timelineItems = [
    ...schedule.map((item) => ({ type: 'class' as const, start: item.startTime, end: item.endTime, item })),
    ...(showRecess ? [{ type: 'recess' as const, start: recess.start, end: recess.end }] : []),
  ].sort((left, right) => left.start.localeCompare(right.start) || (left.type === 'recess' ? -1 : 1));

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader title="Timetable" />

    <View style={styles.weekToolbar}>
      <IconButton icon="chevron-back" label="Previous week" tone="ghost" onPress={() => moveWeek(-1)} />
      <View style={styles.weekCopy}>
        <AppText variant="label">Week of {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(weekStart)}</AppText>
        <AppText variant="caption" color={colors.neutral.textMuted}>{new Intl.DateTimeFormat(undefined, { year: 'numeric' }).format(activeDate)}</AppText>
      </View>
      <View style={styles.toolbarActions}>
        {todayKey !== selectedDateKey ? <Button label="This week" variant="ghost" size="compact" fullWidth={false} onPress={() => setActiveDate(new Date())} /> : null}
        <IconButton icon="chevron-forward" label="Next week" tone="ghost" onPress={() => moveWeek(1)} />
      </View>
    </View>
    <WeekStrip days={weekDays} selectedDateKey={selectedDateKey} todayDateKey={todayKey} onSelect={setActiveDate} />

    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <AppText variant="heading2">{weekday}</AppText>
        <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.sectionSub}>{formatDayHeading(activeDate)} · {schedule.length} {schedule.length === 1 ? 'class' : 'classes'}</AppText>
      </View>
      <IconButton icon="add" label={`Add a recurring class on ${weekday}`} onPress={() => setAddClassOpen(true)} />
    </View>

    {loadError ? <InlineBanner title="Couldn’t load the timetable" message={loadError} tone="danger" action={<Button label="Retry" size="compact" variant="ghost" fullWidth={false} onPress={load} />} /> : null}
    {loading ? <Card tone="skySoft" style={styles.loading}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Loading timetable…</AppText></Card> : null}
    {!loading && !loadError && schedule.length === 0 && !showRecess ? <EmptyState icon="calendar-outline" title={`No classes on ${weekday}`} message="Add a recurring class to build this day’s timetable." action={<Button label="Add recurring class" variant="secondary" onPress={() => setAddClassOpen(true)} leading={<Ionicons name="add" size={18} color={colors.brand.cobalt} />} />} /> : null}

    {!loading && !loadError && timelineItems.length > 0 ? <View style={styles.timeline}>
      {timelineItems.map((entry, index) => <View key={entry.type === 'class' ? `class-${entry.item.id}` : `recess-${entry.start}`} style={styles.classRow}>
        <View style={styles.timeRail}>
          <AppText variant="label" style={styles.tabular}>{entry.start}</AppText>
          <AppText variant="caption" color={colors.neutral.textMuted} style={styles.tabular}>{entry.end}</AppText>
          {index < timelineItems.length - 1 ? <View style={styles.railLine} /> : null}
        </View>
        {entry.type === 'recess' ? <RecessCard timeRange={`${entry.start}–${entry.end}`} style={styles.event} /> : <ScheduleEventCard
          title={entry.item.subjectName}
          kind={entry.item.code}
          classType={entry.item.classType}
          timeRange={`${entry.start}–${entry.end}`}
          room={entry.item.room}
          subjectTone={subjectToneFor(entry.item.subjectId, entry.item.color)}
          style={styles.event}
          onPress={() => router.push(`/subjects/${entry.item.subjectId}` as never)}
        />}
      </View>)}
    </View> : null}

    <InlineBanner
      title="Recurring changes start in the future"
      message="Past classes and attendance records stay unchanged. Make one-day changes from Today."
      tone="neutral"
      style={styles.note}
    />

    <AddClassModal
      visible={addClassOpen}
      regular
      date={selectedDateKey}
      weekday={activeDate.getDay()}
      onClose={() => setAddClassOpen(false)}
      onAdded={() => setRefresh((value) => value + 1)}
    />
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[1], paddingBottom: spacing[9] },
  weekToolbar: { marginTop: spacing[6], marginBottom: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  weekCopy: { flex: 1, alignItems: 'center' },
  toolbarActions: { flexDirection: 'row', alignItems: 'center' },
  sectionHeader: { marginTop: spacing[8], marginBottom: spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4] },
  sectionCopy: { flex: 1 },
  sectionSub: { marginTop: spacing[1] },
  loading: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  timeline: { gap: spacing[2] },
  classRow: { flexDirection: 'row', alignItems: 'stretch' },
  timeRail: { width: 54, alignItems: 'flex-start', paddingTop: spacing[4], position: 'relative' },
  tabular: { fontVariant: ['tabular-nums'] },
  railLine: { position: 'absolute', top: 58, bottom: -10, left: 4, width: 1, backgroundColor: colors.neutral.divider },
  event: { flex: 1, marginBottom: spacing[2] },
  note: { marginTop: spacing[6] },
});
