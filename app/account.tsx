import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Button,
  Card,
  FormField,
  IconButton,
  InlineBanner,
  Screen,
  colors,
  radius,
  spacing,
} from '@/components/ui';
import { collegeApi, type Profile } from '@/lib/api';

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    collegeApi.profile()
      .then((result) => {
        setProfile(result);
        setName(result.name);
        setCollege(result.college);
        setProgramme(result.programme);
        setSemester(result.semester);
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!name.trim() || !college.trim()) {
      setFormError('Your name and college are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const updated = await collegeApi.updateProfile({ name, college, programme, semester });
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <Screen contentContainerStyle={styles.content}>
    <AppHeader
      compact
      title="Account"
      leading={<IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />}
      trailing={profile ? <IconButton icon={editing ? 'close' : 'create-outline'} label={editing ? 'Cancel editing' : 'Edit profile'} onPress={() => { setEditing((value) => !value); setFormError(''); }} /> : undefined}
    />

    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.brand.cobalt} /><AppText variant="bodySmall" color={colors.neutral.textSecondary}>Loading profile…</AppText></View> : null}
    {loadError ? <InlineBanner title="Couldn’t load your account" message={loadError} tone="danger" action={<Button label="Retry" variant="ghost" size="compact" fullWidth={false} onPress={load} />} style={styles.error} /> : null}

    {profile ? <>
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <AppText variant="heading2">{profile.initials || '?'}</AppText>
          <View style={styles.avatarDot} />
        </View>
        <AppText variant="heading2" style={styles.name}>{profile.name}</AppText>
        <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.college}>{profile.college}</AppText>
      </View>

      {editing ? <Card style={styles.editCard}>
        <AppText variant="heading3">Profile details</AppText>
        {formError ? <InlineBanner title="Check your details" message={formError} tone="danger" style={styles.formError} /> : null}
        <View style={styles.fields}>
          <FormField label="Your name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="name" />
          <FormField label="College or university" value={college} onChangeText={setCollege} placeholder="College or university" autoCapitalize="words" />
          <FormField label="Programme (optional)" value={programme} onChangeText={setProgramme} placeholder="e.g. B.Tech Computer Science" autoCapitalize="words" />
          <FormField label="Semester (optional)" value={semester} onChangeText={setSemester} placeholder="e.g. Semester 3" autoCapitalize="words" />
        </View>
        <Button label="Save profile" loading={saving} haptic="success" onPress={save} />
      </Card> : <>
        <AppText variant="heading3" style={styles.sectionTitle}>College details</AppText>
        <Card padding={0} style={styles.details}>
          <Info icon="school-outline" label="College" value={profile.college || 'Not added'} />
          <View style={styles.divider} />
          <Info icon="book-outline" label="Programme" value={profile.programme || 'Not added'} />
          <View style={styles.divider} />
          <Info icon="calendar-outline" label="Current semester" value={profile.semester || 'Not added'} />
        </Card>
      </>}
    </> : null}
  </Screen>;
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.info}>
    <View style={styles.infoIcon}><Ionicons name={icon} size={20} color={colors.brand.cobalt} /></View>
    <View style={styles.infoCopy}>
      <AppText variant="caption" color={colors.neutral.textMuted}>{label}</AppText>
      <AppText variant="label" style={styles.infoValue}>{value}</AppText>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing[9] },
  loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  error: { marginTop: spacing[6] },
  profileHero: { marginTop: spacing[5], alignItems: 'center', borderRadius: radius.feature, backgroundColor: colors.brand.sky, padding: spacing[7] },
  avatar: { width: 82, height: 82, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.surface },
  avatarDot: { position: 'absolute', right: 2, top: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.brand.coral, borderWidth: 3, borderColor: colors.neutral.surface },
  name: { marginTop: spacing[4], textAlign: 'center' },
  college: { marginTop: spacing[1], textAlign: 'center' },
  editCard: { marginTop: spacing[4] },
  formError: { marginTop: spacing[4] },
  fields: { gap: spacing[4], marginVertical: spacing[5] },
  sectionTitle: { marginTop: spacing[8], marginBottom: spacing[3] },
  details: { overflow: 'hidden' },
  info: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  infoIcon: { width: 40, height: 40, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand.cobaltSoft },
  infoCopy: { flex: 1 },
  infoValue: { marginTop: spacing[1] },
  divider: { height: 1, marginLeft: 68, marginRight: spacing[4], backgroundColor: colors.neutral.divider },
});
