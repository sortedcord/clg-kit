import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  IconButton,
  InlineBanner,
  Screen,
  StatusPill,
  SubjectBadge,
  colors,
  radius,
  spacing,
  type SemanticTone,
} from '@/components/ui';
import { formatSessionDate } from '@/lib/date';
import { collegeApi, type AttendanceStatus } from '@/lib/api';
import { subjectToneFor } from '@/lib/design';

type Lecture = Awaited<ReturnType<typeof collegeApi.session>>;

const statusConfig: Record<AttendanceStatus, { label: string; tone: SemanticTone; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Not marked', tone: 'warning', icon: 'time' },
  attended: { label: 'Attended', tone: 'success', icon: 'checkmark-circle' },
  absent: { label: 'Absent', tone: 'danger', icon: 'close-circle' },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: 'remove-circle' },
};

export default function LectureDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lectureId = Number(id);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!Number.isFinite(lectureId)) {
      setLoading(false);
      setError('This lecture is unavailable.');
      return;
    }
    setLoading(true);
    setError('');
    collegeApi.session(lectureId)
      .then((result) => {
        setLecture(result);
        setNotes(result.note || '');
      })
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [lectureId]);

  useEffect(() => { load(); }, [load]);

  const saveNotes = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await collegeApi.updateSession(lectureId, { note: notes });
      setLecture((current) => current ? { ...current, note: notes } : current);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Couldn’t save notes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !lecture) {
    return <Screen scroll={false} contentContainerStyle={styles.center}>
      <ActivityIndicator color={colors.brand.cobalt} />
      <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.loadingText}>Loading lecture…</AppText>
    </Screen>;
  }

  if (!lecture) {
    return <Screen contentContainerStyle={styles.content}>
      <AppHeader compact title="Lecture" leading={<IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />} />
      <InlineBanner title="Couldn’t load lecture" message={error || 'This lecture is unavailable.'} tone="danger" action={<Button label="Retry" variant="ghost" size="compact" fullWidth={false} onPress={load} />} />
    </Screen>;
  }

  const tone = subjectToneFor(lecture.subjectId, lecture.color);
  const status = statusConfig[lecture.status];

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader compact title="Lecture" leading={<IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />} />

    <View style={[styles.hero, { backgroundColor: colors.subject[tone].surface }]}>
      <View style={styles.heroTop}>
        <SubjectBadge shortName={lecture.code.slice(0, 4)} tone={tone} style={styles.badge} />
        <StatusPill label={status.label} tone={status.tone} icon={status.icon} />
      </View>
      <AppText variant="heading2" numberOfLines={3} style={styles.heroTitle}>{lecture.title}</AppText>
      <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.heroMeta}>{lecture.code} · {lecture.classType}</AppText>
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Ionicons name="calendar-outline" size={17} color={colors.brand.cobalt} />
          <AppText variant="bodySmall" color={colors.neutral.textSecondary}>{formatSessionDate(lecture.date)}</AppText>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={17} color={colors.brand.cobalt} />
          <AppText variant="bodySmall" color={colors.neutral.textSecondary}>{lecture.time}–{lecture.endTime}</AppText>
        </View>
        <View style={styles.detail}>
          <Ionicons name="location-outline" size={17} color={colors.brand.cobalt} />
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} numberOfLines={1}>{lecture.room}</AppText>
        </View>
      </View>
    </View>

    <Button
      label={`View ${lecture.code} course`}
      variant="secondary"
      onPress={() => router.push(`/subjects/${lecture.subjectId}` as never)}
      leading={<Ionicons name="book-outline" size={18} color={colors.brand.cobalt} />}
      style={styles.courseButton}
    />

    <View style={styles.sectionHeader}>
      <AppText variant="heading2">Notes</AppText>
      <AppText variant="bodySmall" color={colors.neutral.textMuted}>Keep a quick record for this lecture</AppText>
    </View>
    <Card style={styles.notesCard}>
      <TextInput
        accessibilityLabel="Lecture notes"
        value={notes}
        onChangeText={(value) => { setNotes(value); setSaved(false); }}
        placeholder="What do you want to remember?"
        placeholderTextColor={colors.neutral.textMuted}
        multiline
        textAlignVertical="top"
        style={styles.notesInput}
      />
      {error ? <InlineBanner title="Couldn’t save notes" message={error} tone="danger" style={styles.feedback} /> : null}
      {saved ? <InlineBanner title="Notes saved" message="Your notes are attached to this lecture." tone="success" style={styles.feedback} /> : null}
      <Button label="Save notes" loading={saving} onPress={saveNotes} style={styles.saveButton} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[1], paddingBottom: spacing[9] },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: spacing[3] },
  hero: { marginTop: spacing[3], borderRadius: radius.feature, borderCurve: 'continuous', padding: spacing[6] },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  badge: { width: 48, height: 48 },
  heroTitle: { marginTop: spacing[5] },
  heroMeta: { marginTop: spacing[1] },
  detailsRow: { marginTop: spacing[5], gap: spacing[2] },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  courseButton: { marginTop: spacing[4] },
  sectionHeader: { marginTop: spacing[8], marginBottom: spacing[3], gap: spacing[1] },
  notesCard: { padding: spacing[4] },
  notesInput: { minHeight: 150, color: colors.neutral.textPrimary, fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  feedback: { marginTop: spacing[4] },
  saveButton: { marginTop: spacing[4] },
});
