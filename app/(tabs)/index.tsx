import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddClassModal } from '@/components/add-class-modal';
import {
  AppHeader,
  AppText,
  AttendanceRing,
  BottomSheet,
  Button,
  Card,
  CurrentTimeIndicator,
  EmptyState,
  IconButton,
  InlineBanner,
  RecessCard,
  ScheduleEventCard,
  Screen,
  WeekStrip,
  colors,
  radius,
  size,
  spacing,
  type WeekDay,
} from '@/components/ui';
import {
  addDays,
  currentMinutes,
  dateKey,
  formatCurrentTime,
  formatDayHeading,
  formatHeaderDate,
  formatMonthYear,
  mondayOfWeek,
  timeToMinutes,
} from '@/lib/date';
import { attendanceTone, subjectToneFor } from '@/lib/design';
import { collegeApi, type AttendanceStatus, type Profile, type Session } from '@/lib/api';

type DayMarker = WeekDay['marker'];

type AttendanceSummary = { total: number; attended: number; percentage: number };

const emptySummary: AttendanceSummary = { total: 0, attended: 0, percentage: 0 };
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export default function TodayScreen() {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [classes, setClasses] = useState<Session[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary>(emptySummary);
  const [weekendSchedule, setWeekendSchedule] = useState(false);
  const [weekMarkers, setWeekMarkers] = useState<Record<string, DayMarker>>({});
  const [monthMarkers, setMonthMarkers] = useState<Record<string, DayMarker>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Session | null>(null);

  const today = new Date();
  const todayKey = dateKey(today);
  const selectedDateKey = dateKey(activeDate);
  const weekStart = useMemo(() => mondayOfWeek(activeDate), [activeDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  useFocusEffect(useCallback(() => {
    let active = true;
    collegeApi.profile().then((result) => {
      if (!active) return;
      setProfile(result);
      setWeekendSchedule(Boolean(result.weekendSchedule));
      if (!result.weekendSchedule) setActiveDate((current) => current.getDay() === 0 || current.getDay() === 6 ? mondayOfWeek(current) : current);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []));

  const loadSchedule = useCallback(() => {
    setLoading(true);
    setLoadError('');
    collegeApi.schedule(selectedDateKey)
      .then(({ sessions }) => setClasses(sessions))
      .catch((error: Error) => { setClasses([]); setLoadError(error.message); })
      .finally(() => setLoading(false));
  }, [selectedDateKey]);

  useEffect(() => { loadSchedule(); }, [loadSchedule, refresh]);

  useEffect(() => {
    collegeApi.attendanceSummary().then(({ subjects }) => {
      const total = subjects.reduce((value, subject) => value + subject.total, 0);
      const attended = subjects.reduce((value, subject) => value + subject.attended, 0);
      setSummary({ total, attended, percentage: total ? Math.round(attended / total * 100) : 0 });
    }).catch(() => setSummary(emptySummary));
  }, [refresh]);

  useEffect(() => {
    Promise.all(weekDates.map((date) => collegeApi.schedule(dateKey(date)).then(({ sessions }) => ({ date, sessions })).catch(() => ({ date, sessions: [] as Session[] }))))
      .then((results) => {
        const markers: Record<string, DayMarker> = {};
        results.forEach(({ date, sessions }) => {
          const key = dateKey(date);
          if (key > todayKey) return;
          const held = sessions.filter((session) => session.status !== 'cancelled');
          if (!held.length) return;
          if (held.every((session) => session.status === 'attended')) markers[key] = 'success';
          else if (held.some((session) => session.status === 'absent')) markers[key] = 'danger';
          else if (held.some((session) => session.status === 'pending')) markers[key] = 'warning';
          else markers[key] = 'neutral';
        });
        setWeekMarkers(markers);
      });
  }, [refresh, todayKey, weekDates]);

  const visibleDays: WeekDay[] = weekDates
    .filter((date) => weekendSchedule || (date.getDay() !== 0 && date.getDay() !== 6))
    .map((date) => ({ date, marker: weekMarkers[dateKey(date)] ?? 'none' }));

  const calendarMonthKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`;
  useEffect(() => {
    collegeApi.attendanceMarkers(calendarMonthKey)
      .then(({ markers }) => setMonthMarkers(markers))
      .catch(() => setMonthMarkers({}));
  }, [calendarMonthKey, refresh]);

  const updateStatus = (session: Session, status: AttendanceStatus) => {
    const previous = classes;
    setClasses((items) => items.map((item) => item.id === session.id ? { ...item, status } : item));
    collegeApi.markAttendance(session.id, status)
      .then(() => {
        if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRefresh((v) => v + 1);
      })
      .catch((error: Error) => {
        setClasses(previous);
        Alert.alert('Couldn’t save attendance', error.message);
      });
  };

  const removeClass = (session: Session) => {
    Alert.alert('Remove this class?', 'This removes only this occurrence. Your recurring timetable will not change.', [
      { text: 'Keep class', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setSelectedClass(null);
        setClasses((items) => items.filter((item) => item.id !== session.id));
        collegeApi.removeClass(session.id).then(() => setRefresh((value) => value + 1)).catch((error: Error) => {
          Alert.alert('Couldn’t remove class', error.message);
          setRefresh((value) => value + 1);
        });
      } },
    ]);
  };

  const isToday = selectedDateKey === todayKey;
  const insightTone = attendanceTone(summary.percentage, summary.total);
  const now = currentMinutes();
  const recessEnabled = Boolean(profile && profile.recessEnabled && timeToMinutes(profile.recessStart) >= 0 && timeToMinutes(profile.recessStart) < timeToMinutes(profile.recessEnd));
  const timelineItems = [
    ...classes.map((item) => ({ type: 'class' as const, start: item.time, end: item.endTime, item })),
    ...(recessEnabled ? [{ type: 'recess' as const, start: profile!.recessStart, end: profile!.recessEnd }] : []),
  ].sort((left, right) => left.start.localeCompare(right.start) || (left.type === 'recess' ? -1 : 1));
  const activeTimelineIndex = isToday ? timelineItems.findIndex((item) => timeToMinutes(item.start) <= now && now < timeToMinutes(item.end)) : -1;
  const insertionIndex = isToday ? (activeTimelineIndex >= 0 ? activeTimelineIndex : timelineItems.findIndex((item) => timeToMinutes(item.start) > now)) : -1;
  const currentTimeLabel = formatCurrentTime();
  const pendingCount = classes.filter((item) => item.status === 'pending').length;
  const metricTone = summary.total ? (insightTone === 'neutral' ? 'brand' : insightTone) : 'brand';

  return <Screen scroll={false} contentContainerStyle={styles.content}>
    <View style={styles.stickyHeader}>
    <View style={styles.headerRow}>
      <AppHeader
        title={formatHeaderDate(activeDate)}
        style={styles.headerTitle}
      />
      {profile?.name ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open account profile"
          onPress={() => router.push('/account' as never)}
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
          <AppText variant="label" color={colors.brand.cobalt}>{profile.initials || '?'}</AppText>
        </Pressable>
      ) : null}
    </View>

    <View style={styles.attendanceOverview}>
      <View style={styles.overviewPrimary}>
        <AttendanceRing
          percentage={summary.percentage}
          tone={metricTone}
          size={76}
          strokeWidth={8}
          label=""
          accessibilityLabel={summary.total ? `Overall attendance ${summary.percentage} percent` : 'No attendance data yet'}
        />
        <View style={styles.overviewCopy}>
          <AppText variant="title">{summary.total ? `${summary.percentage}% overall` : 'No attendance yet'}</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.overviewMessage}>
            {summary.total ? `${summary.attended} of ${summary.total} classes attended` : 'Mark a class to begin tracking.'}
          </AppText>
        </View>
      </View>
      <View style={styles.overviewTarget}>
        <AppText variant="caption" color={colors.neutral.textMuted}>Target</AppText>
        <AppText variant="title" color={colors.brand.cobalt} style={styles.overviewTargetValue}>75%</AppText>
      </View>
    </View>

    <View style={styles.pickerContainer}>
      {calendarExpanded ? (
        <InlineCalendarWidget
          month={calendarMonth}
          selectedDateKey={selectedDateKey}
          todayKey={todayKey}
          markers={monthMarkers}
          allowWeekends={weekendSchedule}
          onMonthChange={setCalendarMonth}
          onSelect={(date) => {
            setActiveDate(date);
            setCalendarExpanded(false);
          }}
        />
      ) : (
        <WeekStrip days={visibleDays} selectedDateKey={selectedDateKey} todayDateKey={todayKey} onSelect={setActiveDate} style={styles.weekStrip} />
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={calendarExpanded ? 'Collapse calendar' : 'Expand calendar'}
        onPress={() => {
          if (!calendarExpanded) {
            setCalendarMonth(startOfMonth(activeDate));
          }
          setCalendarExpanded((v) => !v);
        }}
        style={({ pressed }) => [styles.extendBar, pressed && styles.extendBarPressed]}>
        <View style={styles.extendHandle} />
      </Pressable>
    </View>

    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <AppText variant="heading2">{isToday ? 'Today’s classes' : `${formatDayHeading(activeDate).split(',')[0]}’s classes`}</AppText>
        <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.sectionSubtitle}>
          {classes.length ? `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}${pendingCount ? ` · ${pendingCount} to mark` : ''}` : 'Your agenda for this date'}
        </AppText>
      </View>
      <IconButton icon="add" label="Add a class" onPress={() => setAddClassOpen(true)} />
    </View>

    </View>

    <ScrollView style={styles.classList} contentContainerStyle={styles.classListContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    {loadError ? <InlineBanner title="Couldn’t load this day" message={loadError} tone="danger" action={<Button label="Retry" size="compact" variant="ghost" fullWidth={false} onPress={loadSchedule} />} /> : null}
    {loading ? <Card tone="skySoft" style={styles.loading}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Loading your classes…</AppText></Card> : null}
    {!loading && !loadError && classes.length === 0 && !recessEnabled ? <EmptyState icon="calendar-clear-outline" title="No classes scheduled" message="Enjoy the break, or add a one-off class for this date." action={<Button label="Add a class" variant="secondary" onPress={() => setAddClassOpen(true)} leading={<Ionicons name="add" size={18} color={colors.brand.cobalt} />} />} /> : null}

    {!loading && !loadError && timelineItems.length > 0 ? <View style={styles.timeline}>
      {timelineItems.map((entry, index) => {
        const isNow = index === activeTimelineIndex;
        const key = entry.type === 'class' ? `class-${entry.item.id}` : `recess-${entry.start}`;
        return <View key={key}>
          {index === insertionIndex ? <CurrentTimeIndicator time={currentTimeLabel} /> : null}
          <View style={styles.classRow}>
            <View style={styles.timeRail}>
              <AppText variant="label" style={styles.timeText}>{entry.start}</AppText>
              {index < timelineItems.length - 1 ? <View style={styles.railLine} /> : null}
            </View>
            {entry.type === 'recess' ? <RecessCard timeRange={`${entry.start}–${entry.end}`} isNow={isNow} style={styles.event} /> : <ScheduleEventCard
              title={entry.item.title}
              kind={entry.item.code}
              classType={entry.item.classType}
              timeRange={`${entry.start}–${entry.end}`}
              room={entry.item.room}
              subjectTone={subjectToneFor(entry.item.subjectId || entry.item.code, entry.item.color)}
              state={entry.item.status}
              isNow={isNow}
              style={styles.event}
              topAction={<IconButton icon="ellipsis-horizontal" label={`Options for ${entry.item.title}`} tone="ghost" onPress={() => setSelectedClass(entry.item)} />}
              footer={entry.item.status !== 'cancelled' ? <AttendanceActions tone={subjectToneFor(entry.item.subjectId || entry.item.code, entry.item.color)} status={entry.item.status} onAttended={() => updateStatus(entry.item, 'attended')} onAbsent={() => updateStatus(entry.item, 'absent')} /> : null}
            />}
          </View>
        </View>;
      })}
      {isToday && insertionIndex === -1 && activeTimelineIndex === -1 ? <CurrentTimeIndicator time={currentTimeLabel} /> : null}
    </View> : null}
    </ScrollView>

    <AddClassModal visible={addClassOpen} date={selectedDateKey} onClose={() => setAddClassOpen(false)} onAdded={() => setRefresh((value) => value + 1)} />

    <BottomSheet visible={Boolean(selectedClass)} title="Class options" onClose={() => setSelectedClass(null)}>
      {selectedClass ? <>
        <Card tone="skySoft" style={styles.selectedClassSummary}>
          <AppText variant="title">{selectedClass.title}</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.sectionSubtitle}>{selectedClass.code} · {selectedClass.time}–{selectedClass.endTime} · {selectedClass.room}</AppText>
        </Card>
        <View style={styles.sheetButtons}>
          <Button label="View subject" variant="secondary" disabled={!selectedClass.subjectId} onPress={() => { const id = selectedClass.subjectId; setSelectedClass(null); if (id) router.push(`/subjects/${id}` as never); }} leading={<Ionicons name="book-outline" size={18} color={colors.brand.cobalt} />} />
          {selectedClass.status !== 'cancelled' ? <Button label="Cancel class" variant="ghost" onPress={() => { updateStatus(selectedClass, 'cancelled'); setSelectedClass(null); }} leading={<Ionicons name="remove-circle-outline" size={18} color={colors.semantic.danger.text} />} /> : null}
          <Button label="Remove from this day" variant="ghost" onPress={() => removeClass(selectedClass)} leading={<Ionicons name="trash-outline" size={18} color={colors.semantic.danger.text} />} />
        </View>
      </> : null}
    </BottomSheet>
  </Screen>;
}

function AttendanceActions({ tone, status, onAttended, onAbsent }: { tone: keyof typeof colors.subject; status?: AttendanceStatus; onAttended: () => void; onAbsent: () => void }) {
  const palette = colors.subject[tone];
  const isAttended = status === 'attended';
  const isAbsent = status === 'absent';
  return <View style={styles.attendanceActions}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mark attended"
      onPress={onAttended}
      style={({ pressed }) => [
        styles.attendanceButton,
        { borderColor: isAttended ? colors.semantic.success.solid : palette.accent },
        isAttended && { backgroundColor: colors.semantic.success.solid },
        pressed && styles.actionPressed,
      ]}>
      <Ionicons name="checkmark" size={18} color={isAttended ? colors.neutral.surface : palette.accent} />
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mark absent"
      onPress={onAbsent}
      style={({ pressed }) => [
        styles.attendanceButton,
        { borderColor: isAbsent ? colors.semantic.danger.solid : palette.accent },
        isAbsent && { backgroundColor: colors.semantic.danger.solid },
        pressed && styles.actionPressed,
      ]}>
      <Ionicons name="close" size={18} color={isAbsent ? colors.neutral.surface : palette.accent} />
    </Pressable>
  </View>;
}

const markerColorMap = {
  none: 'transparent',
  success: colors.semantic.success.solid,
  warning: colors.semantic.warning.solid,
  danger: colors.semantic.danger.solid,
  neutral: colors.neutral.textMuted,
} as const;

function InlineCalendarWidget({
  month,
  selectedDateKey,
  todayKey,
  markers = {},
  allowWeekends = false,
  onMonthChange,
  onSelect,
}: {
  month: Date;
  selectedDateKey: string;
  todayKey: string;
  markers?: Record<string, DayMarker>;
  allowWeekends?: boolean;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const offset = (month.getDay() + 6) % 7;
  const dates = Array.from({ length: offset + daysInMonth(month) }, (_, index) => (index < offset ? null : index - offset + 1));
  const weekdayLabels = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <View style={styles.calendarWidget}>
      <View style={styles.monthNavigation}>
        <IconButton icon="chevron-back" label="Previous month" tone="ghost" onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
        <AppText variant="title">{formatMonthYear(month)}</AppText>
        <IconButton icon="chevron-forward" label="Next month" tone="ghost" onPress={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
      </View>
      <View style={styles.calendarWeekdays}>
        {weekdayLabels.map((label, index) => {
          const isWeekendCol = index >= 5;
          const disabledCol = isWeekendCol && !allowWeekends;
          return (
            <AppText
              key={`${label}-${index}`}
              variant="caption"
              color={disabledCol ? colors.neutral.textDisabled : colors.neutral.textMuted}
              style={[styles.calendarWeekday, disabledCol && styles.calendarDisabledText]}>
              {label}
            </AppText>
          );
        })}
      </View>
      <View style={styles.calendarGrid}>
        {dates.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.calendarCell} />;
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const key = dateKey(date);
          const dayOfWeek = date.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isDisabled = isWeekend && !allowWeekends;
          const selected = key === selectedDateKey;
          const isToday = key === todayKey;
          const marker = markers[key] ?? 'none';

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={formatDayHeading(date)}
              accessibilityState={{ selected, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => onSelect(date)}
              style={({ pressed }) => [
                styles.calendarCell,
                selected && styles.calendarSelected,
                isToday && !selected && styles.calendarToday,
                isDisabled && styles.calendarCellDisabled,
                pressed && !isDisabled && styles.actionPressed,
              ]}>
              <AppText
                variant="label"
                color={selected ? colors.brand.ink : isDisabled ? colors.neutral.textDisabled : colors.neutral.textPrimary}
                style={[styles.timeText, isDisabled && styles.calendarDisabledText]}>
                {day}
              </AppText>
              <View style={styles.indicatorRow}>
                <View
                  style={[
                    styles.dot,
                    isToday && !selected && styles.todayDot,
                    marker !== 'none' && !isDisabled && { backgroundColor: markerColorMap[marker] },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bottom padding belongs to the scrollable class content, not this fixed shell.
  content: { paddingTop: spacing[1], paddingBottom: 0 },

  stickyHeader: { flexShrink: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[2], marginBottom: spacing[3] },
  headerTitle: { flex: 1, minHeight: 0 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingTop: spacing[1] },
  avatar: { width: 40, height: 40, borderRadius: radius.control, borderCurve: 'continuous', backgroundColor: colors.brand.cobaltSoft, alignItems: 'center', justifyContent: 'center' },
  avatarPressed: { opacity: 0.78 },
  attendanceOverview: {
    marginTop: spacing[3],
    marginBottom: spacing[3],
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.feature,
    borderCurve: 'continuous',
    backgroundColor: colors.brand.skySoft,
    borderWidth: 1,
    borderColor: '#DCEEF8',
  },
  overviewPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  overviewCopy: { flex: 1 },
  overviewMessage: { marginTop: spacing[1] },
  overviewTarget: { alignItems: 'flex-end', gap: 2, paddingRight: spacing[1] },
  overviewTargetValue: { fontVariant: ['tabular-nums'] },
  pickerContainer: {
    marginTop: spacing[1],
    borderRadius: radius.feature,
    borderCurve: 'continuous',
    backgroundColor: colors.brand.skySoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2F0FA',
  },
  weekStrip: {
    width: '100%',
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  calendarWidget: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  extendBar: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E2EEF8',
  },
  extendHandle: {
    width: 36,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: colors.neutral.textDisabled,
    opacity: 0.7,
  },
  extendBarPressed: { opacity: 0.6 },
  calendarCellDisabled: { opacity: 0.28 },
  calendarDisabledText: { textDecorationLine: 'none' },
  indicatorRow: { height: 5, marginTop: 1, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  todayDot: { width: 4.5, height: 4.5, borderRadius: 2.5, backgroundColor: colors.brand.cobalt },
  sectionHeader: { marginTop: spacing[8], marginBottom: spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4] },
  sectionCopy: { flex: 1 },
  sectionSubtitle: { marginTop: spacing[1] },
  loading: { minHeight: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  timeline: { gap: spacing[2] },
  classRow: { flexDirection: 'row', alignItems: 'stretch' },
  timeRail: { width: 50, alignItems: 'flex-start', paddingTop: spacing[4], position: 'relative' },
  timeText: { fontVariant: ['tabular-nums'], fontSize: 13, lineHeight: 17, fontWeight: '700', color: colors.neutral.textSecondary },
  railLine: { position: 'absolute', top: 38, bottom: -10, left: 4, width: 1, backgroundColor: colors.neutral.divider },
  classList: { flex: 1, minHeight: 0 },
  classListContent: { paddingTop: spacing[4], paddingBottom: size.tabBar + spacing[6] },
  event: { flex: 1, marginBottom: spacing[2] },
  attendanceActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  attendanceButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, backgroundColor: 'rgba(255, 255, 255, 0.62)' },
  actionPressed: { opacity: 0.72 },
  sheetButtons: { gap: spacing[2], marginTop: spacing[5] },
  selectedClassSummary: { marginTop: spacing[2] },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[5] },
  calendarWeekdays: { flexDirection: 'row', marginBottom: spacing[2] },
  calendarWeekday: { width: '14.2857%', textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control, borderCurve: 'continuous' },
  calendarSelected: { backgroundColor: colors.brand.coral },
  calendarToday: { borderWidth: 2, borderColor: colors.brand.cobalt },
  calendarButton: { marginTop: spacing[5] },
});
