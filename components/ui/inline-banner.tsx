import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, spacing, type SemanticTone } from './tokens';

type Props = {
  title: string;
  message?: string;
  tone?: SemanticTone;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const icon = { success: 'checkmark-circle', warning: 'alert-circle', danger: 'alert-circle', neutral: 'information-circle' } as const;

/** Concise, data-backed feedback for save states and attendance insights. */
export function InlineBanner({ title, message, tone = 'neutral', action, style }: Props) {
  const palette = colors.semantic[tone];
  return <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: palette.soft }, style]}>
    <Ionicons name={icon[tone]} size={20} color={palette.text} />
    <View style={styles.copy}>
      <AppText variant="label" color={palette.text}>{title}</AppText>
      {message ? <AppText variant="bodySmall" color={colors.neutral.textSecondary} style={styles.message}>{message}</AppText> : null}
    </View>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], borderRadius: radius.card, padding: spacing[4] },
  copy: { flex: 1 },
  message: { marginTop: spacing[1] },
  action: { alignSelf: 'center' },
});
