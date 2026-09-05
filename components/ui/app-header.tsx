import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, size, spacing } from './tokens';

type Props = {
  title: string;
  context?: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  avatar?: { initials: string; onPress: () => void };
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppHeader({ title, context, subtitle, leading, trailing, avatar, compact = false, style }: Props) {
  if (compact) return <View style={[styles.compact, style]}>
    <View style={styles.side}>{leading}</View>
    <AppText variant="title" numberOfLines={1} style={styles.compactTitle}>{title}</AppText>
    <View style={[styles.side, styles.trailing]}>{trailing}</View>
  </View>;

  const resolvedTrailing = trailing ?? (avatar ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open account profile"
      onPress={avatar.onPress}
      style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
      <AppText variant="label" color={colors.brand.cobalt}>{avatar.initials || '?'}</AppText>
    </Pressable>
  ) : null);

  return <View style={[styles.root, style]}>
    <View style={styles.copy}>
      {context ? <AppText variant="bodySmall" color={colors.neutral.textMuted}>{context}</AppText> : null}
      <AppText variant="heading1" style={context ? styles.titleWithContext : undefined}>{title}</AppText>
      {subtitle ? <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.subtitle}>{subtitle}</AppText> : null}
    </View>
    {resolvedTrailing ? <View style={styles.rootTrailing}>{resolvedTrailing}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[5], paddingTop: spacing[4] },
  copy: { flex: 1 },
  titleWithContext: { marginTop: spacing[1] },
  subtitle: { marginTop: spacing[1] },
  rootTrailing: { alignSelf: 'flex-start', paddingTop: spacing[1] },
  avatar: { width: 40, height: 40, borderRadius: radius.control, borderCurve: 'continuous', backgroundColor: colors.brand.cobaltSoft, alignItems: 'center', justifyContent: 'center' },
  avatarPressed: { opacity: 0.78 },
  compact: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { width: size.touchTargetMin, minHeight: size.touchTargetMin, justifyContent: 'center' },
  trailing: { alignItems: 'flex-end' },
  compactTitle: { flex: 1, textAlign: 'center', paddingHorizontal: spacing[3] },
});
