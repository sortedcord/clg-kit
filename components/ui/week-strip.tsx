import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, spacing } from './tokens';

export type WeekDay = { date: Date; disabled?: boolean; marker?: 'none' | 'success' | 'warning' | 'danger' | 'neutral' };
type Props = {
  days: WeekDay[];
  selectedDateKey: string;
  onSelect: (date: Date) => void;
  todayDateKey?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const markerColor = { none: 'transparent', success: colors.semantic.success.solid, warning: colors.semantic.warning.solid, danger: colors.semantic.danger.solid, neutral: colors.neutral.textMuted } as const;

/** The shared selected-date control: coral selection, cobalt today signal, semantic status dot. */
export function WeekStrip({ days, selectedDateKey, onSelect, todayDateKey, style, accessibilityLabel = 'Choose a day' }: Props) {
  return <View accessibilityLabel={accessibilityLabel} style={[styles.strip, style]}>
    {days.map(({ date, disabled = false, marker = 'none' }) => {
      const key = dateKey(date);
      const selected = key === selectedDateKey;
      const today = key === todayDateKey;
      const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(date);
      const fullDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
      return <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityLabel={fullDate}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={() => { if (Platform.OS !== 'web') void Haptics.selectionAsync(); onSelect(date); }}
        style={({ pressed }) => [styles.day, selected && styles.selected, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
        <AppText variant="caption" color={selected ? colors.brand.ink : colors.neutral.textSecondary}>{weekday}</AppText>
        <AppText variant="title" color={selected ? colors.brand.ink : colors.neutral.textPrimary} style={styles.number}>{date.getDate()}</AppText>
        <View style={styles.indicatorRow}>
          <View style={[styles.dot, today && !selected && styles.todayDot, marker !== 'none' && { backgroundColor: markerColor[marker] }]} />
        </View>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', gap: spacing[1], padding: spacing[2], borderRadius: radius.feature, backgroundColor: colors.brand.sky },
  day: { flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control, paddingVertical: spacing[1] },
  selected: { backgroundColor: colors.brand.coral },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.78 },
  number: { marginTop: 1, fontVariant: ['tabular-nums'] },
  indicatorRow: { height: 5, marginTop: 2, justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.cobalt },
});
