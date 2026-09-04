import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, spacing, type SemanticTone } from './tokens';

type Props = {
  label: string;
  tone?: SemanticTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function StatusPill({ label, tone = 'neutral', icon, style }: Props) {
  const palette = colors.semantic[tone];
  return <View accessibilityRole="text" style={[styles.pill, { backgroundColor: palette.soft }, style]}>
    {icon && <Ionicons name={icon} size={14} color={palette.text} />}
    <AppText variant="caption" color={palette.text}>{label}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  pill: { minHeight: 28, alignSelf: 'flex-start', alignItems: 'center', flexDirection: 'row', gap: spacing[1], borderRadius: radius.pill, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
});
