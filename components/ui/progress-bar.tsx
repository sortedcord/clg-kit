import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from './tokens';

type Props = {
  value: number;
  color?: string;
  height?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ value, color = colors.brand.cobalt, height = 8, accessibilityLabel, style }: Props) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));
  return <View
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={accessibilityLabel}
    accessibilityValue={{ min: 0, max: 100, now: percentage }}
    style={[styles.track, { height, borderRadius: height / 2 }, style]}>
    <View style={[styles.fill, { width: `${percentage}%`, minWidth: percentage > 0 ? Math.min(3, height) : 0, backgroundColor: color, borderRadius: height / 2 }]} />
  </View>;
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', backgroundColor: colors.neutral.surfaceSubtle },
  fill: { height: '100%' },
});
