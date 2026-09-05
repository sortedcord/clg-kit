import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  FormField,
  InlineBanner,
  Screen,
  colors,
  radius,
  spacing,
} from '@/components/ui';
import { collegeApi } from '@/lib/api';

const profileInitials = (value: string) => value.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').toUpperCase().slice(0, 2);

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [recessEnabled, setRecessEnabled] = useState(true);
  const [recessStart, setRecessStart] = useState('13:00');
  const [recessEnd, setRecessEnd] = useState('14:00');
  const [weekend, setWeekend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    collegeApi.profile()
      .then((profile) => {
        setName(profile.name);
        setCollege(profile.college);
        setProgramme(profile.programme);
        setSemester(profile.semester);
        setMinutes(String(profile.lectureMinutes ?? 60));
        setRecessEnabled(Boolean(profile.recessEnabled));
        setRecessStart(profile.recessStart ?? '13:00');
        setRecessEnd(profile.recessEnd ?? '14:00');
        setWeekend(Boolean(profile.weekendSchedule));
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const duration = Number(minutes);
    if (!name.trim() || !college.trim() || !Number.isInteger(duration) || duration < 15 || duration > 360 || !/^\d{2}:\d{2}$/.test(recessStart) || !/^\d{2}:\d{2}$/.test(recessEnd) || (recessEnabled && recessStart >= recessEnd)) {
      setFormError('Add your name and college, then use a valid class length and recess time range.');
      return;
    }
    setSaving(true);
    setFormError('');
    setSaved(false);
    try {
      await Promise.all([
        collegeApi.updateProfile({ name, college, programme, semester }),
        collegeApi.updateSettings({ lectureMinutes: duration, recessEnabled, recessStart, recessEnd, weekendSchedule: weekend }),
      ]);
      setSaved(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader title="Settings" style={styles.header} />

    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Loading settings…</AppText></View> : null}
    {loadError ? <InlineBanner title="Couldn’t load settings" message={loadError} tone="danger" action={<Button label="Retry" variant="ghost" size="compact" fullWidth={false} onPress={load} />} style={styles.firstBlock} /> : null}

    {!loading && !loadError ? <>
      <AppText variant="heading3" style={styles.sectionTitle}>Profile</AppText>
      <ProfileSummary name={name} college={college} programme={programme} semester={semester} />

      <Card tone="sky" style={styles.intro}>
        <View style={styles.introIcon}><Ionicons name="time-outline" size={24} color={colors.brand.cobalt} /></View>
        <View style={styles.introCopy}>
          <AppText variant="title">Shape your class day</AppText>
          <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.introText}>These defaults make adding classes faster. You can still adjust individual times.</AppText>
        </View>
      </Card>

      {saved ? <InlineBanner title="Settings saved" message="New classes will use these defaults." tone="success" style={styles.feedback} /> : null}
      {formError ? <InlineBanner title="Check your settings" message={formError} tone="danger" style={styles.feedback} /> : null}

      <AppText variant="heading3" style={styles.sectionTitle}>Edit profile</AppText>
      <Card style={styles.card}>
        <View style={styles.fields}>
          <FormField label="Your name" value={name} onChangeText={(value) => { setName(value); setSaved(false); }} placeholder="Your name" autoCapitalize="words" />
          <FormField label="College or university" value={college} onChangeText={(value) => { setCollege(value); setSaved(false); }} placeholder="College or university" autoCapitalize="words" />
          <FormField label="Programme (optional)" value={programme} onChangeText={(value) => { setProgramme(value); setSaved(false); }} placeholder="e.g. B.Tech Computer Science" autoCapitalize="words" />
          <FormField label="Semester (optional)" value={semester} onChangeText={(value) => { setSemester(value); setSaved(false); }} placeholder="e.g. Semester 3" autoCapitalize="words" />
        </View>
      </Card>

      <AppText variant="heading3" style={styles.sectionTitle}>Class timing</AppText>
      <Card style={styles.card}>
        <View style={styles.settingHeading}>
          <View style={styles.settingIcon}><Ionicons name="hourglass-outline" size={20} color={colors.brand.cobalt} /></View>
          <View style={styles.settingCopy}>
            <AppText variant="title">Default class length</AppText>
            <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.settingSub}>Used to suggest an end time.</AppText>
          </View>
        </View>
        <FormField label="Minutes" value={minutes} onChangeText={(value) => { setMinutes(value); setSaved(false); }} keyboardType="number-pad" placeholder="60" hint="Between 15 and 360 minutes." containerStyle={styles.nestedField} />

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.settingIcon}><Ionicons name="cafe-outline" size={20} color={colors.brand.cobalt} /></View>
          <View style={styles.settingCopy}>
            <AppText variant="title">Recess or lunch</AppText>
            <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.settingSub}>Show this break in your daily timeline.</AppText>
          </View>
          <Switch
            accessibilityLabel="Recess or lunch"
            value={recessEnabled}
            onValueChange={(value) => { setRecessEnabled(value); setSaved(false); }}
            trackColor={{ false: colors.neutral.border, true: colors.brand.cobaltSoft }}
            thumbColor={recessEnabled ? colors.brand.cobalt : colors.neutral.surface}
          />
        </View>
        <View style={styles.timeFields}>
          <FormField editable={recessEnabled} label="Starts" value={recessStart} onChangeText={(value) => { setRecessStart(value); setSaved(false); }} placeholder="13:00" hint="HH:MM" containerStyle={styles.timeField} />
          <FormField editable={recessEnabled} label="Ends" value={recessEnd} onChangeText={(value) => { setRecessEnd(value); setSaved(false); }} placeholder="14:00" hint="HH:MM" containerStyle={styles.timeField} />
        </View>
      </Card>

      <AppText variant="heading3" style={styles.sectionTitle}>Schedule</AppText>
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.settingIcon}><Ionicons name="calendar-outline" size={20} color={colors.brand.cobalt} /></View>
          <View style={styles.settingCopy}>
            <AppText variant="title">Weekend schedule</AppText>
            <AppText variant="bodySmall" color={colors.neutral.textMuted} style={styles.settingSub}>Show Saturday and Sunday in week selectors.</AppText>
          </View>
          <Switch
            accessibilityLabel="Weekend schedule"
            value={weekend}
            onValueChange={(value) => { setWeekend(value); setSaved(false); }}
            trackColor={{ false: colors.neutral.border, true: colors.brand.cobaltSoft }}
            thumbColor={weekend ? colors.brand.cobalt : colors.neutral.surface}
          />
        </View>
      </Card>

      <Button label="Save settings" loading={saving} haptic="success" onPress={save} style={styles.save} />
    </> : null}
  </Screen>;
}

function ProfileSummary({ name, college, programme, semester }: { name: string; college: string; programme: string; semester: string }) {
  return <Card tone="sky" style={styles.profileSummary}>
    <View style={styles.profileIdentity}>
      <View style={styles.profileAvatar}>
        <AppText variant="heading2">{profileInitials(name) || '?'}</AppText>
      </View>
      <View style={styles.profileCopy}>
        <AppText variant="heading3" numberOfLines={2}>{name || 'Your profile'}</AppText>
        <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.profileCollege} numberOfLines={2}>{college || 'Add your college'}</AppText>
      </View>
    </View>
    <View style={styles.profileDetails}>
      <View style={styles.profileDetail}>
        <Ionicons name="book-outline" size={17} color={colors.brand.cobalt} />
        <View style={styles.profileDetailCopy}>
          <AppText variant="caption" color={colors.neutral.textMuted}>Programme</AppText>
          <AppText variant="label" numberOfLines={2}>{programme || 'Not added'}</AppText>
        </View>
      </View>
      <View style={styles.profileDetail}>
        <Ionicons name="calendar-outline" size={17} color={colors.brand.cobalt} />
        <View style={styles.profileDetailCopy}>
          <AppText variant="caption" color={colors.neutral.textMuted}>Semester</AppText>
          <AppText variant="label" numberOfLines={2}>{semester || 'Not added'}</AppText>
        </View>
      </View>
    </View>
  </Card>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[1], paddingBottom: spacing[9] },
  header: { paddingTop: spacing[2], minHeight: 0 },
  loading: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  firstBlock: { marginTop: spacing[4] },
  profileSummary: { marginTop: spacing[3] },
  profileIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  profileAvatar: { width: 64, height: 64, borderRadius: radius.feature, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.surface },
  profileCopy: { flex: 1 },
  profileCollege: { marginTop: spacing[1] },
  profileDetails: { marginTop: spacing[5], paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: 'rgba(6, 20, 48, 0.10)', gap: spacing[3] },
  profileDetail: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  profileDetailCopy: { flex: 1, gap: 2 },
  intro: { marginTop: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  introIcon: { width: 48, height: 48, borderRadius: radius.card, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.surface },
  introCopy: { flex: 1 },
  introText: { marginTop: spacing[1] },
  feedback: { marginTop: spacing[4] },
  sectionTitle: { marginTop: spacing[8], marginBottom: spacing[3] },
  card: { padding: spacing[5] },
  fields: { gap: spacing[4] },
  settingHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  settingIcon: { width: 40, height: 40, borderRadius: radius.control, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand.cobaltSoft },
  settingCopy: { flex: 1 },
  settingSub: { marginTop: spacing[1] },
  nestedField: { marginTop: spacing[5], marginLeft: 52 },
  divider: { height: 1, backgroundColor: colors.neutral.divider, marginVertical: spacing[6] },
  timeFields: { marginTop: spacing[5], marginLeft: 52, flexDirection: 'row', gap: spacing[3] },
  timeField: { flex: 1 },
  switchRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  save: { marginTop: spacing[7] },
});
