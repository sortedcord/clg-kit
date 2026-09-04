import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from './app-text';
import { colors, type SemanticTone } from './tokens';

type Props = {
  percentage: number;
  tone?: Extract<SemanticTone, 'success' | 'warning' | 'danger'> | 'brand';
  size?: number;
  strokeWidth?: number;
  label?: string;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** An accessible determinate progress ring for real attendance values. */
export function AttendanceRing({ percentage, tone = 'brand', size = 112, strokeWidth = 10, label = 'Attendance', accessibilityLabel, style }: Props) {
  const value = Math.max(0, Math.min(100, Math.round(percentage)));
  const center = size / 2;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - value / 100);
  const accent = tone === 'brand' ? colors.brand.cobalt : colors.semantic[tone].solid;

  return <View
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={accessibilityLabel}
    accessibilityValue={{ min: 0, max: 100, now: value }}
    style={[styles.container, { width: size, height: size }, style]}>
    <Svg width={size} height={size} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={center} cy={center} r={ringRadius} stroke={colors.neutral.surfaceSubtle} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={center}
        cy={center}
        r={ringRadius}
        stroke={accent}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        rotation="-90"
        origin={`${center}, ${center}`}
      />
    </Svg>
    <View pointerEvents="none" style={styles.copy}>
      <AppText variant="heading2" style={styles.value}>{value}%</AppText>
      <AppText variant="caption" color={colors.neutral.textMuted} numberOfLines={1}>{label}</AppText>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  copy: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  value: { fontVariant: ['tabular-nums'] },
});
