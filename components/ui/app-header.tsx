import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, size, spacing } from './tokens';

type Props = {
  title: string;
  context?: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppHeader({ title, context, subtitle, leading, trailing, compact = false, style }: Props) {
  if (compact) return <View style={[styles.compact, style]}>
    <View style={styles.side}>{leading}</View>
    <AppText variant="title" numberOfLines={1} style={styles.compactTitle}>{title}</AppText>
    <View style={[styles.side, styles.trailing]}>{trailing}</View>
  </View>;

  return <View style={[styles.root, style]}>
    <View style={styles.copy}>
      {context ? <AppText variant="bodySmall" color={colors.neutral.textMuted}>{context}</AppText> : null}
      <AppText variant="heading1" style={context ? styles.titleWithContext : undefined}>{title}</AppText>
      {subtitle ? <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.subtitle}>{subtitle}</AppText> : null}
    </View>
    {trailing ? <View style={styles.rootTrailing}>{trailing}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  root: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[5], paddingTop: spacing[6] },
  copy: { flex: 1 },
  titleWithContext: { marginTop: spacing[1] },
  subtitle: { marginTop: spacing[1] },
  rootTrailing: { alignSelf: 'flex-start', paddingTop: spacing[1] },
  compact: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { width: size.touchTargetMin, minHeight: size.touchTargetMin, justifyContent: 'center' },
  trailing: { alignItems: 'flex-end' },
  compactTitle: { flex: 1, textAlign: 'center', paddingHorizontal: spacing[3] },
});
