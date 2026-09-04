import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, spacing } from './tokens';

type Props = { time: string; style?: StyleProp<ViewStyle> };

export function CurrentTimeIndicator({ time, style }: Props) {
  return <View accessibilityLabel={`Current time ${time}`} style={[styles.row, style]}>
    <AppText variant="caption" color={colors.brand.coral} style={styles.time}>{time}</AppText>
    <View style={styles.triangle} />
    <View style={styles.line} />
  </View>;
}

const styles = StyleSheet.create({
  row: { height: 20, flexDirection: 'row', alignItems: 'center', marginVertical: spacing[1] },
  time: { width: 46, fontVariant: ['tabular-nums'] },
  triangle: { width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 7, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: colors.brand.coral },
  line: { flex: 1, height: 2, backgroundColor: colors.brand.coral },
});
