import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  FormField,
  InlineBanner,
  Screen,
  SubjectBadge,
  colors,
  radius,
  spacing,
  type SubjectTone,
} from '@/components/ui';
import { collegeApi } from '@/lib/api';

type SubjectDraft = { name: string; code: string; shortName: string; tone: SubjectTone };
const tones: SubjectTone[] = ['ocean', 'aqua', 'lilac', 'sun', 'mint', 'peach'];
const makeShortName = (value: string) => value.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).join('').toUpperCase().slice(0, 6);

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [programme, setProgramme] = useState('');
  const [semester, setSemester] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjects, setSubjects] = useState<SubjectDraft[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const continueToSubjects = () => {
    if (!name.trim() || !college.trim()) {
      setFormError('Your name and college are required.');
      return;
    }
    setFormError('');
    setStep(2);
  };

  const addSubject = () => {
    const code = subjectCode.trim().toUpperCase();
    if (!subjectName.trim() || !code) {
      setFormError('Add both a subject name and code.');
      return;
    }
    if (subjects.some((subject) => subject.code === code)) {
      setFormError('That subject code is already in your list.');
      return;
    }
    setSubjects((items) => [...items, { name: subjectName.trim(), code, shortName: makeShortName(subjectName), tone: tones[items.length % tones.length] }]);
    setSubjectName('');
    setSubjectCode('');
    setFormError('');
  };

  const finish = async () => {
    setSaving(true);
    setFormError('');
    try {
      await collegeApi.updateProfile({ name, college, programme, semester });
      for (const subject of subjects) await collegeApi.createSubject({ name: subject.name, code: subject.code, shortName: subject.shortName, color: colors.subject[subject.tone].accent });
      router.replace('/');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <Screen contentContainerStyle={styles.content}>
    <View style={styles.brand}>
      <View style={styles.logo}><Ionicons name="school" size={22} color={colors.neutral.surface} /></View>
      <AppText variant="title">CLG Kit</AppText>
    </View>

    <View accessible accessibilityLabel={`Step ${step} of 2`} style={styles.progress}>
      <View style={[styles.progressSegment, styles.progressActive]} />
      <View style={[styles.progressSegment, step === 2 && styles.progressCurrent]} />
    </View>

    {step === 1 ? <>
      <View style={styles.intro}>
        <AppText variant="display">Build your college day.</AppText>
        <AppText variant="body" color={colors.neutral.textSecondary} style={styles.introCopy}>Start with the essentials. We’ll use them to organize your timetable and attendance.</AppText>
      </View>

      {formError ? <InlineBanner title="Check your details" message={formError} tone="danger" style={styles.error} /> : null}
      <View style={styles.fields}>
        <FormField label="Your name" value={name} onChangeText={setName} placeholder="e.g. Sam Taylor" autoCapitalize="words" autoComplete="name" />
        <FormField label="College or university" value={college} onChangeText={setCollege} placeholder="e.g. Northbridge University" autoCapitalize="words" />
        <FormField label="Programme (optional)" value={programme} onChangeText={setProgramme} placeholder="e.g. B.Tech Computer Science" autoCapitalize="words" />
        <FormField label="Semester (optional)" value={semester} onChangeText={setSemester} placeholder="e.g. Semester 3" autoCapitalize="words" />
      </View>
      <Button label="Continue" onPress={continueToSubjects} trailing={<Ionicons name="arrow-forward" size={18} color={colors.neutral.surface} />} />
    </> : <>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to college details" onPress={() => { setStep(1); setFormError(''); }} style={styles.back}>
        <Ionicons name="arrow-back" size={18} color={colors.brand.cobalt} />
        <AppText variant="label" color={colors.brand.cobalt}>College details</AppText>
      </Pressable>

      <View style={styles.introSubjects}>
        <AppText variant="heading1">Add your subjects.</AppText>
        <AppText variant="body" color={colors.neutral.textSecondary} style={styles.introCopy}>They’ll keep the same color throughout your timetable and attendance views.</AppText>
      </View>

      {formError ? <InlineBanner title="Couldn’t continue" message={formError} tone="danger" style={styles.error} /> : null}
      <Card tone="skySoft" style={styles.subjectForm}>
        <View style={styles.fieldsCompact}>
          <FormField label="Subject name" value={subjectName} onChangeText={setSubjectName} placeholder="e.g. Data Structures" autoCapitalize="words" />
          <FormField label="Subject code" value={subjectCode} onChangeText={(value) => setSubjectCode(value.toUpperCase())} placeholder="e.g. CS201" autoCapitalize="characters" />
        </View>
        <Button label="Add subject" variant="secondary" onPress={addSubject} leading={<Ionicons name="add" size={18} color={colors.brand.cobalt} />} />
      </Card>

      {subjects.length > 0 ? <View style={styles.subjectSection}>
        <AppText variant="heading3">Your subjects</AppText>
        <View style={styles.subjects}>
          {subjects.map((subject, index) => <Card key={`${subject.code}-${index}`} style={styles.subjectRow} padding={spacing[3]}>
            <SubjectBadge shortName={subject.shortName || subject.code.slice(0, 3)} tone={subject.tone} />
            <View style={styles.subjectCopy}>
              <AppText variant="label" numberOfLines={2}>{subject.name}</AppText>
              <AppText variant="caption" color={colors.neutral.textMuted} style={styles.subjectMeta}>{subject.code} · {subject.shortName}</AppText>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${subject.name}`} hitSlop={8} onPress={() => setSubjects((items) => items.filter((_, itemIndex) => itemIndex !== index))} style={styles.remove}>
              <Ionicons name="close" size={19} color={colors.neutral.textMuted} />
            </Pressable>
          </Card>)}
        </View>
      </View> : null}

      <Button label={subjects.length ? 'Finish setup' : 'Skip for now'} loading={saving} haptic="success" onPress={finish} trailing={<Ionicons name="checkmark" size={19} color={colors.neutral.surface} />} style={styles.finish} />
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing[5], paddingBottom: spacing[9] },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  logo: { width: 40, height: 40, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand.cobalt },
  progress: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[8] },
  progressSegment: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: colors.neutral.divider },
  progressActive: { backgroundColor: colors.brand.cobalt },
  progressCurrent: { backgroundColor: colors.brand.coral },
  intro: { marginTop: spacing[9] },
  introSubjects: { marginTop: spacing[7] },
  introCopy: { marginTop: spacing[3], maxWidth: 440 },
  error: { marginTop: spacing[5] },
  fields: { gap: spacing[5], marginVertical: spacing[7] },
  fieldsCompact: { gap: spacing[4], marginBottom: spacing[5] },
  back: { minHeight: 44, marginTop: spacing[5], flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing[2] },
  subjectForm: { marginTop: spacing[7] },
  subjectSection: { marginTop: spacing[7] },
  subjects: { gap: spacing[2], marginTop: spacing[3] },
  subjectRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  subjectCopy: { flex: 1 },
  subjectMeta: { marginTop: spacing[1] },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  finish: { marginTop: spacing[7] },
});
