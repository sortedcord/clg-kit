import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

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
import { dateFromKey, formatDayHeading, formatWeekdayLong, timeToMinutes } from '@/lib/date';
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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [existingRanges, setExistingRanges] = useState<TimeRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

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
        setStartTime(nextStart);
        setEndTime(addMinutes(nextStart, minutes));
        setIsPickerOpen(false);
        setSearchQuery('');
        setSelectedType('All');
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [visible, date, regular]);

  const currentSubject = subjects.find((s) => s.id === subjectId) ?? subjects[0] ?? null;

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    subjects.forEach((s) => {
      if (s.classType && s.classType.trim()) types.add(s.classType.trim());
    });
    return Array.from(types);
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subjects.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        (s.shortName && s.shortName.toLowerCase().includes(query));
      const matchesType = selectedType === 'All' || s.classType === selectedType;
      return matchesQuery && matchesType;
    });
  }, [subjects, searchQuery, selectedType]);

  const selectSubject = (subj: Subject) => {
    setSubjectId(subj.id);
    if (!room || subjects.some((s) => s.defaultRoom === room)) {
      setRoom(subj.defaultRoom ?? '');
    }
    setIsPickerOpen(false);
    setSearchQuery('');
    setError('');
  };

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
    ? `Repeats on ${formatWeekdayLong(dateFromKey(date))}. Recurring changes begin in the future.`
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
      {subjects.length === 0 ? (
        <InlineBanner title="No subjects available" message="Add a subject from onboarding or your subject list before scheduling a class." tone="warning" />
      ) : currentSubject ? (
        <View style={styles.subjectSelectorWrap}>
          {/* Selected Subject Card / Trigger */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Selected subject: ${currentSubject.name}, ${currentSubject.code}. Tap to change subject.`}
            onPress={() => setIsPickerOpen((prev) => !prev)}
            style={({ pressed }) => {
              const tone = subjectToneFor(currentSubject.id, currentSubject.color);
              const palette = colors.subject[tone];
              return [
                styles.selectedSubjectCard,
                { backgroundColor: palette.surface, borderColor: palette.accent },
                pressed && styles.pressed,
              ];
            }}>
            <View style={styles.selectedSubjectInner}>
              <SubjectBadge shortName={subjectShortName(currentSubject)} tone={subjectToneFor(currentSubject.id, currentSubject.color)} size="medium" />
              <View style={styles.selectedSubjectCopy}>
                <AppText variant="title" numberOfLines={1} style={{ color: colors.subject[subjectToneFor(currentSubject.id, currentSubject.color)].accent }}>
                  {currentSubject.name}
                </AppText>
                <View style={styles.selectedSubjectMetaRow}>
                  <AppText variant="caption" color={colors.neutral.textSecondary}>
                    {currentSubject.code}
                  </AppText>
                  {currentSubject.classType ? (
                    <>
                      <AppText variant="caption" color={colors.neutral.textMuted}> · </AppText>
                      <AppText variant="caption" color={colors.neutral.textSecondary}>
                        {currentSubject.classType}
                      </AppText>
                    </>
                  ) : null}
                </View>
              </View>
              <View style={[styles.changeBadge, { backgroundColor: colors.subject[subjectToneFor(currentSubject.id, currentSubject.color)].accent }]}>
                <AppText variant="caption" color={colors.neutral.surface} style={styles.changeBadgeText}>
                  {isPickerOpen ? 'Done' : 'Change'}
                </AppText>
                <Ionicons
                  name={isPickerOpen ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.neutral.surface}
                />
              </View>
            </View>
          </Pressable>

          {/* Expandable Subject Picker Drawer */}
          {isPickerOpen ? (
            <View style={styles.pickerDrawer}>
              {subjects.length > 4 ? (
                <View style={styles.searchWrap}>
                  <Ionicons name="search" size={16} color={colors.neutral.textMuted} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search courses by name or code..."
                    placeholderTextColor={colors.neutral.textMuted}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={colors.neutral.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {availableTypes.length > 1 ? (
                <View style={styles.typeFilterRow}>
                  {['All', ...availableTypes].map((type) => {
                    const active = selectedType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setSelectedType(type)}
                        style={[styles.typeChip, active && styles.typeChipActive]}>
                        <AppText
                          variant="caption"
                          color={active ? colors.neutral.surface : colors.neutral.textSecondary}
                          style={styles.typeChipText}>
                          {type}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <ScrollView
                style={styles.pickerScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled">
                {filteredSubjects.map((subj) => {
                  const isSelected = subj.id === subjectId;
                  const tone = subjectToneFor(subj.id, subj.color);
                  const palette = colors.subject[tone];
                  return (
                    <Pressable
                      key={subj.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`${subj.name}, ${subj.code}`}
                      onPress={() => selectSubject(subj)}
                      style={({ pressed }) => [
                        styles.pickerRow,
                        isSelected && { backgroundColor: palette.surface },
                        pressed && styles.pressed,
                      ]}>
                      <SubjectBadge shortName={subjectShortName(subj)} tone={tone} size="small" />
                      <View style={styles.pickerRowCopy}>
                        <AppText variant="label" numberOfLines={1}>
                          {subj.name}
                        </AppText>
                        <AppText variant="caption" color={colors.neutral.textMuted}>
                          {subj.code}{subj.classType ? ` · ${subj.classType}` : ''}
                        </AppText>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color={palette.accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={14} color={colors.neutral.textDisabled} />
                      )}
                    </Pressable>
                  );
                })}
                {filteredSubjects.length === 0 ? (
                  <View style={styles.emptySearch}>
                    <AppText variant="caption" color={colors.neutral.textMuted}>
                      No courses found matching &ldquo;{searchQuery}&rdquo;
                    </AppText>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.timeHeading}>
        <AppText variant="label" color={colors.neutral.textSecondary}>Time</AppText>
        <View style={styles.durationPresets}>
          {[45, 50, 60, 90, 120].map((mins) => {
            const currentDur = timeToMinutes(endTime) - timeToMinutes(startTime);
            const isMatch = currentDur === mins;
            return (
              <Pressable
                key={mins}
                onPress={() => {
                  if (validTime(startTime)) {
                    setEndTime(addMinutes(startTime, mins));
                  }
                }}
                style={[styles.durationChip, isMatch && styles.durationChipActive]}>
                <AppText
                  variant="caption"
                  color={isMatch ? colors.brand.cobalt : colors.neutral.textMuted}
                  style={isMatch ? styles.durationChipTextActive : styles.durationChipText}>
                  {mins}m
                </AppText>
              </Pressable>
            );
          })}
        </View>
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
  sectionLabel: { marginTop: spacing[5], marginBottom: spacing[2] },
  subjectSelectorWrap: { gap: spacing[2] },
  selectedSubjectCard: {
    borderRadius: radius.card,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  selectedSubjectInner: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.card,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  selectedSubjectCopy: { flex: 1 },
  selectedSubjectMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
  },
  changeBadgeText: { fontWeight: '700', fontSize: 11 },
  pickerDrawer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing[3],
    gap: spacing[2],
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: colors.neutral.surfaceSubtle,
    borderRadius: radius.control,
    borderCurve: 'continuous',
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  searchIcon: { marginRight: 2 },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: colors.neutral.textPrimary,
    paddingVertical: 0,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingVertical: 2,
  },
  typeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  typeChipActive: {
    backgroundColor: colors.brand.cobalt,
  },
  typeChipText: {
    fontWeight: '600',
    fontSize: 11,
  },
  pickerScroll: {
    maxHeight: 180,
  },
  pickerRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.control,
    borderCurve: 'continuous',
    marginVertical: 1,
  },
  pickerRowCopy: { flex: 1 },
  emptySearch: {
    paddingVertical: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.76 },
  timeHeading: {
    marginTop: spacing[5],
    marginBottom: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPresets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1] + 2,
  },
  durationChip: {
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.neutral.surfaceSubtle,
  },
  durationChipActive: {
    backgroundColor: colors.brand.cobaltSoft,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  durationChipTextActive: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeFields: { flexDirection: 'row', gap: spacing[3] },
  timeField: { flex: 1 },
  roomField: { marginTop: spacing[4], marginBottom: spacing[2] },
});
