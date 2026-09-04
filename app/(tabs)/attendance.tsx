import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  AttendanceRing,
  Button,
  Card,
  EmptyState,
  InlineBanner,
  ProgressBar,
  Screen,
  StatusPill,
  SubjectBadge,
  colors,
  spacing,
} from '@/components/ui';
import { attendanceMessage, attendanceTone, subjectToneFor } from '@/lib/design';
import { collegeApi } from '@/lib/api';

type Subject = Awaited<ReturnType<typeof collegeApi.attendanceSummary>>['subjects'][number];

export default function AttendanceScreen() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    collegeApi.attendanceSummary()
      .then(({ subjects: result }) => setSubjects(result))
      .catch((error: Error) => { setSubjects([]); setLoadError(error.message); })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalHeld = subjects.reduce((total, subject) => total + subject.total, 0);
  const totalAttended = subjects.reduce((total, subject) => total + subject.attended, 0);
  const totalMissed = subjects.reduce((total, subject) => total + subject.absent, 0);
  const overall = totalHeld ? Math.round(totalAttended / totalHeld * 100) : 0;
  const overallTone = attendanceTone(overall, totalHeld);
  const insight = attendanceMessage(overall, totalHeld);
  const sortedSubjects = [...subjects].sort((left, right) => {
    if (!left.total && right.total) return 1;
    if (left.total && !right.total) return -1;
    return left.percentage - right.percentage || left.name.localeCompare(right.name);
  });

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader title="Attendance" />

    {loadError ? <InlineBanner title="Couldn’t load attendance" message={loadError} tone="danger" action={<Button label="Retry" size="compact" variant="ghost" fullWidth={false} onPress={load} />} style={styles.firstBlock} /> : null}
    {loading ? <Card tone="skySoft" style={[styles.loading, styles.firstBlock]}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Calculating attendance…</AppText></Card> : null}

    {!loading && !loadError ? <>
      <Card tone="sky" padding={spacing[6]} style={styles.hero}>
        <AttendanceRing
          percentage={overall}
          tone={totalHeld ? (overallTone === 'neutral' ? 'brand' : overallTone) : 'brand'}
          label={totalHeld ? 'Overall' : 'No data'}
          accessibilityLabel={totalHeld ? `Overall attendance ${overall} percent` : 'No attendance data yet'}
        />
        <View style={styles.heroCopy}>
          <AppText variant="heading3">{insight.title}</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.heroMessage}>{insight.message}</AppText>
          {totalHeld ? <StatusPill
            label={overallTone === 'success' ? 'On track' : overallTone === 'warning' ? 'Close to target' : 'Below target'}
            tone={overallTone}
            icon={overallTone === 'success' ? 'shield-checkmark' : 'alert-circle'}
            style={styles.heroStatus}
          /> : null}
        </View>
      </Card>

      <Card style={styles.stats} padding={0}>
        <Stat value={totalHeld} label="Classes held" />
        <View style={styles.statDivider} />
        <Stat value={totalAttended} label="Attended" />
        <View style={styles.statDivider} />
        <Stat value={totalMissed} label="Missed" />
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="heading2">By subject</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.sectionSub}>Subjects needing attention appear first</AppText>
        </View>
      </View>

      {subjects.length === 0 ? <EmptyState icon="pie-chart-outline" title="No attendance yet" message="Add subjects and classes, then mark attendance from Today." /> : <Card padding={0} style={styles.subjectList}>
        {sortedSubjects.map((subject, index) => {
          const tone = subjectToneFor(subject.id, subject.color);
          const palette = colors.subject[tone];
          const state = attendanceTone(subject.percentage, subject.total);
          const atRisk = subject.total > 0 && state !== 'success';
          return <Pressable
            key={subject.id}
            accessibilityRole="button"
            accessibilityLabel={`${subject.name}, ${subject.percentage} percent attendance, ${subject.attended} of ${subject.total} classes attended`}
            onPress={() => router.push(`/subjects/${subject.id}` as never)}
            style={({ pressed }) => [styles.subject, pressed && styles.subjectPressed]}>
            <SubjectBadge shortName={subject.shortName || subject.code.slice(0, 3)} tone={tone} />
            <View style={styles.subjectBody}>
              <View style={styles.subjectTop}>
                <View style={styles.subjectTitleWrap}>
                  <AppText variant="title" numberOfLines={2}>{subject.name}</AppText>
                  <AppText variant="caption" color={colors.neutral.textMuted} style={styles.subjectMeta}>{subject.code} · {subject.attended}/{subject.total} attended</AppText>
                </View>
                <AppText variant="title" color={atRisk ? colors.semantic[state].text : palette.accent} style={styles.percentage}>{subject.total ? `${subject.percentage}%` : '—'}</AppText>
              </View>
              <ProgressBar value={subject.total ? subject.percentage : 0} color={palette.accent} accessibilityLabel={`${subject.name} attendance`} style={styles.progress} />
              {atRisk ? <StatusPill label={state === 'warning' ? 'Close to target' : 'Needs attention'} tone={state} icon="alert-circle" style={styles.subjectStatus} /> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral.textMuted} />
            {index < sortedSubjects.length - 1 ? <View style={styles.subjectDivider} /> : null}
          </Pressable>;
        })}
      </Card>}
    </> : null}
  </Screen>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <View style={styles.stat}>
    <AppText variant="heading3" style={styles.tabular}>{value}</AppText>
    <AppText variant="caption" color={colors.neutral.textMuted} style={styles.statLabel}>{label}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[1], paddingBottom: spacing[9] },
  firstBlock: { marginTop: spacing[6] },
  loading: { minHeight: 144, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  hero: { marginTop: spacing[6], flexDirection: 'row', alignItems: 'center', gap: spacing[6], borderRadius: 20 },
  heroCopy: { flex: 1 },
  heroMessage: { marginTop: spacing[2] },
  heroStatus: { marginTop: spacing[4] },
  stats: { minHeight: 92, marginTop: spacing[3], flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing[5] },
  statDivider: { width: 1, height: 36, backgroundColor: colors.neutral.divider },
  statLabel: { marginTop: spacing[1], textAlign: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
  sectionHeader: { marginTop: spacing[8], marginBottom: spacing[4] },
  sectionSub: { marginTop: spacing[1] },
  subjectList: { overflow: 'hidden' },
  subject: { minHeight: 100, flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  subjectPressed: { backgroundColor: colors.brand.skySoft },
  subjectBody: { flex: 1 },
  subjectTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  subjectTitleWrap: { flex: 1 },
  subjectMeta: { marginTop: spacing[1] },
  percentage: { fontVariant: ['tabular-nums'] },
  progress: { marginTop: spacing[3] },
  subjectStatus: { marginTop: spacing[3] },
  subjectDivider: { position: 'absolute', left: 72, right: spacing[4], bottom: 0, height: 1, backgroundColor: colors.neutral.divider },
});
