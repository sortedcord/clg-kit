import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  EmptyState,
  FormField,
  IconButton,
  InlineBanner,
  ProgressBar,
  Screen,
  StatusPill,
  SubjectBadge,
  colors,
  radius,
  spacing,
  type SemanticTone,
} from '@/components/ui';
import { currentMinutes, dateKey, formatSessionDate, timeToMinutes } from '@/lib/date';
import { attendanceMessage, attendanceTone, subjectToneFor } from '@/lib/design';
import { collegeApi, type AttendanceStatus } from '@/lib/api';

type Details = Awaited<ReturnType<typeof collegeApi.subject>>;
const initials = (value: string) => value.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').toUpperCase().slice(0, 6);
const statusConfig: Record<AttendanceStatus, { label: string; tone: SemanticTone; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Not marked', tone: 'warning', icon: 'time' },
  attended: { label: 'Attended', tone: 'success', icon: 'checkmark-circle' },
  absent: { label: 'Absent', tone: 'danger', icon: 'close-circle' },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: 'remove-circle' },
};

export default function SubjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const subjectId = Number(id);
  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [classType, setClassType] = useState('Lecture');
  const [defaultRoom, setDefaultRoom] = useState('');
  const [shortEdited, setShortEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    if (!Number.isFinite(subjectId)) return;
    setLoading(true);
    setLoadError('');
    collegeApi.subject(subjectId)
      .then((subject) => {
        setData(subject);
        setName(subject.name);
        setCode(subject.code);
        setShortName(subject.shortName || initials(subject.name));
        setClassType(subject.classType || 'Lecture');
        setDefaultRoom(subject.defaultRoom || '');
        setShortEdited(Boolean(subject.shortName));
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  const changeName = (value: string) => {
    setName(value);
    if (!shortEdited) setShortName(initials(value));
  };

  const save = async () => {
    if (!name.trim() || !code.trim() || !shortName.trim() || !classType.trim()) {
      setFormError('Name, subject code, short name, and class type are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const tone = subjectToneFor(subjectId, data?.color);
      await collegeApi.updateSubject(subjectId, { name, code, shortName, classType, defaultRoom, color: colors.subject[tone].accent });
      setEditing(false);
      load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = () => {
    Alert.alert(
      'Delete subject?',
      `Are you sure you want to delete ${data?.name}? This will remove its timetable classes and attendance records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collegeApi.deleteSubject(subjectId);
              router.back();
            } catch (err) {
              Alert.alert('Couldn’t delete subject', err instanceof Error ? err.message : 'Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && !data) return <Screen scroll={false} contentContainerStyle={styles.center}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.loadingText}>Loading subject…</AppText></Screen>;
  if (!data) return <Screen contentContainerStyle={styles.content}>
    <AppHeader compact title="Subject details" leading={<IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />} />
    <InlineBanner title="Couldn’t load subject" message={loadError || 'This subject is unavailable.'} tone="danger" action={<Button label="Retry" variant="ghost" size="compact" fullWidth={false} onPress={load} />} style={styles.error} />
  </Screen>;

  const tone = subjectToneFor(data.id, data.color);
  const palette = colors.subject[tone];
  const summaryTone = attendanceTone(data.summary.percentage, data.summary.total);
  const summaryCopy = attendanceMessage(data.summary.percentage, data.summary.total);
  const todayKey = dateKey(new Date());
  const isUpcoming = (session: Details['sessions'][number]) => session.date > todayKey || (session.date === todayKey && timeToMinutes(session.time) >= currentMinutes());
  const upcomingSession = [...data.sessions].filter(isUpcoming).sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`))[0];
  const recentSessions = data.sessions.filter((session) => !isUpcoming(session));

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader
      compact
      title="Subject details"
      leading={<IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />}
      trailing={<IconButton icon={editing ? 'close' : 'create-outline'} label={editing ? 'Cancel editing' : 'Edit subject'} onPress={() => { setEditing((value) => !value); setFormError(''); }} />}
    />

    <View style={[styles.hero, { backgroundColor: palette.surface }]}>
      <View style={styles.heroIdentity}>
        <SubjectBadge shortName={data.shortName || initials(data.name)} tone={tone} style={styles.badge} />
        <View style={styles.heroCopy}>
          <AppText variant="heading2" numberOfLines={2}>{data.name}</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.heroMeta}>{data.code} · {data.shortName || initials(data.name)}</AppText>
        </View>
      </View>
      <View style={styles.heroProgress}>
        <View>
          <AppText variant="heading1" style={styles.tabular}>{data.summary.total ? `${data.summary.percentage}%` : '—'}</AppText>
          <AppText variant="caption" color={colors.neutral.textMuted}>Attendance</AppText>
        </View>
        <View style={styles.progressWrap}><ProgressBar value={data.summary.total ? data.summary.percentage : 0} color={palette.accent} accessibilityLabel={`${data.name} attendance`} /></View>
      </View>
    </View>

    {editing ? <Card style={styles.editCard}>
      <AppText variant="heading3">Edit subject</AppText>
      {formError ? <InlineBanner title="Check the subject details" message={formError} tone="danger" style={styles.formError} /> : null}
      <View style={styles.fields}>
        <FormField label="Subject name" value={name} onChangeText={changeName} placeholder="e.g. Data Structures" autoCapitalize="words" />
        <FormField label="Subject code" value={code} onChangeText={(value) => setCode(value.toUpperCase())} placeholder="e.g. CS201" autoCapitalize="characters" />
        <FormField label="Short name" value={shortName} onChangeText={(value) => { setShortEdited(true); setShortName(value.toUpperCase().slice(0, 6)); }} placeholder="e.g. DS" hint="Up to 6 characters; used in compact schedule views." autoCapitalize="characters" />
        <FormField label="Class type" value={classType} onChangeText={setClassType} placeholder="e.g. Theory, Lab, Workshop" hint="Shown on each class card." autoCapitalize="words" />
        <FormField label="Default room or location" value={defaultRoom} onChangeText={setDefaultRoom} placeholder="e.g. B-204 or Lab 3" hint="Used automatically when you add a class." autoCapitalize="words" />
      </View>
      <Button label="Save changes" loading={saving} haptic="success" onPress={save} />
      <Button label="Delete subject" variant="ghost" onPress={deleteSubject} leading={<Ionicons name="trash-outline" size={18} color={colors.semantic.danger.text} />} style={styles.deleteButton} />
    </Card> : <>
      <InlineBanner title={summaryCopy.title} message={summaryCopy.message} tone={summaryTone} style={styles.insight} />
      <Card padding={0} style={styles.stats}>
        <Stat value={data.summary.total} label="Classes held" />
        <View style={styles.statDivider} />
        <Stat value={data.summary.attended} label="Attended" />
        <View style={styles.statDivider} />
        <Stat value={data.summary.absent} label="Missed" />
      </Card>

      {upcomingSession ? <>
        <View style={styles.sectionHeader}>
          <AppText variant="heading2">Upcoming class</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.sectionSub}>Your next scheduled lecture</AppText>
        </View>
        <LectureCard session={upcomingSession} tone={tone} onPress={() => router.push(`/classes/${upcomingSession.id}` as never)} featured />
      </> : null}

      <View style={styles.sectionHeader}>
        <AppText variant="heading2">Recent classes</AppText>
        <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.sectionSub}>Attendance history for this subject</AppText>
      </View>

      {recentSessions.length === 0 ? <EmptyState icon="calendar-outline" title="No recent classes" message="Completed classes for this subject will appear here." /> : <Card padding={0} style={styles.history}>
        {recentSessions.map((session, index) => (
          <LectureCard
            key={session.id}
            session={session}
            tone={tone}
            onPress={() => router.push(`/classes/${session.id}` as never)}
            divider={index < recentSessions.length - 1}
          />
        ))}
      </Card>}
    </>}
  </Screen>;
}

function LectureCard({ session, tone, onPress, divider = false, featured = false }: { session: Details['sessions'][number]; tone: ReturnType<typeof subjectToneFor>; onPress: () => void; divider?: boolean; featured?: boolean }) {
  const status = statusConfig[session.status];
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${formatSessionDate(session.date)}, ${session.time} to ${session.endTime}, ${status.label}`}
    onPress={onPress}
    style={({ pressed }) => [styles.session, featured && { backgroundColor: colors.subject[tone].surface, borderRadius: radius.card, borderCurve: 'continuous', padding: spacing[4] }, pressed && styles.sessionPressed]}>
    <View style={[styles.statusDot, { backgroundColor: colors.semantic[status.tone].solid }]} />
    <View style={styles.sessionCopy}>
      <AppText variant="label">{formatSessionDate(session.date)}</AppText>
      <AppText variant="caption" color={colors.neutral.textMuted} style={styles.sessionMeta}>{session.time}–{session.endTime} · {session.room}</AppText>
    </View>
    <StatusPill label={status.label} tone={status.tone} icon={status.icon} />
    {divider ? <View style={styles.divider} /> : null}
  </Pressable>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <View style={styles.stat}>
    <AppText variant="heading3" style={styles.tabular}>{value}</AppText>
    <AppText variant="caption" color={colors.neutral.textMuted} style={styles.statLabel}>{label}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[1], paddingBottom: spacing[9] },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: spacing[3] },
  error: { marginTop: spacing[4] },
  hero: { marginTop: spacing[3], borderRadius: radius.feature, borderCurve: 'continuous', padding: spacing[6] },
  heroIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  badge: { width: 52, height: 52, borderRadius: 17, borderCurve: 'continuous' },
  heroCopy: { flex: 1 },
  heroMeta: { marginTop: spacing[1] },
  heroProgress: { marginTop: spacing[6], flexDirection: 'row', alignItems: 'flex-end', gap: spacing[5] },
  progressWrap: { flex: 1, paddingBottom: spacing[2] },
  tabular: { fontVariant: ['tabular-nums'] },
  editCard: { marginTop: spacing[4] },
  formError: { marginTop: spacing[4] },
  fields: { gap: spacing[4], marginVertical: spacing[5] },
  deleteButton: { marginTop: spacing[3] },
  insight: { marginTop: spacing[4] },
  stats: { minHeight: 92, marginTop: spacing[3], flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing[5] },
  statDivider: { width: 1, height: 36, backgroundColor: colors.neutral.divider },
  statLabel: { marginTop: spacing[1], textAlign: 'center' },
  sectionHeader: { marginTop: spacing[8], marginBottom: spacing[4] },
  sectionSub: { marginTop: spacing[1] },
  history: { overflow: 'hidden' },
  session: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  sessionPressed: { backgroundColor: colors.brand.skySoft },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  sessionCopy: { flex: 1 },
  sessionMeta: { marginTop: spacing[1], fontVariant: ['tabular-nums'] },
  divider: { position: 'absolute', left: 36, right: spacing[4], bottom: 0, height: 1, backgroundColor: colors.neutral.divider },
});
