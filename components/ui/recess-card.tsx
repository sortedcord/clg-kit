import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, spacing } from './tokens';

type Props = {
  timeRange: string;
  isNow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A quiet timeline block for a configured recess or lunch period. */
export function RecessCard({ timeRange, isNow = false, style }: Props) {
  return <View accessibilityLabel={`Recess, ${timeRange}`} style={[styles.card, style]}>
    <View style={styles.icon}>
      <Ionicons name="cafe-outline" size={19} color={colors.neutral.textSecondary} />
    </View>
    <View style={styles.copy}>
      <View style={styles.heading}>
        <AppText variant="title">Recess</AppText>
        {isNow ? <View style={styles.now}><AppText variant="caption" color={colors.brand.ink}>Now</AppText></View> : null}
      </View>
      <AppText variant="bodySmall" color={colors.neutral.textMuted}>Time to recharge</AppText>
      <AppText variant="caption" color={colors.neutral.textSecondary} style={styles.range}>{timeRange}</AppText>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: spacing[4], borderRadius: radius.feature, borderCurve: 'continuous', padding: spacing[5], backgroundColor: colors.neutral.surfaceSubtle, borderWidth: 1, borderColor: colors.neutral.divider },
  icon: { width: 40, height: 40, borderRadius: radius.control, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.surface },
  copy: { flex: 1 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] },
  now: { borderRadius: radius.pill, backgroundColor: colors.brand.coral, paddingHorizontal: spacing[3], paddingVertical: 3 },
  range: { marginTop: spacing[2], fontVariant: ['tabular-nums'] },
});
