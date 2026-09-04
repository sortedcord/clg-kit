import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, type SubjectTone } from './tokens';

type Props = { shortName: string; tone: SubjectTone; size?: 'small' | 'medium'; style?: StyleProp<ViewStyle> };

/** Stable subject identifier. Use the same tone for a subject everywhere in the product. */
export function SubjectBadge({ shortName, tone, size = 'medium', style }: Props) {
  const subject = colors.subject[tone];
  return <View accessibilityRole="text" style={[styles.base, size === 'small' ? styles.small : styles.medium, { backgroundColor: subject.surface }, style]}>
    <AppText variant={size === 'small' ? 'caption' : 'label'} color={subject.accent} numberOfLines={1}>{shortName}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.control },
  small: { minWidth: 32, height: 32, paddingHorizontal: 6 },
  medium: { minWidth: 44, height: 44, paddingHorizontal: 8, borderRadius: 14 },
});
