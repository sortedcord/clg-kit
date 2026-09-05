import { PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  LinearTransition,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { colors, radius, spacing } from './tokens';
import { WeekStrip, type WeekDay } from './week-strip';
import { dateKey, formatDayHeading, formatMonthYear } from '@/lib/date';

type DayMarker = WeekDay['marker'];

const markerColorMap = {
  none: 'transparent',
  success: colors.semantic.success.solid,
  warning: colors.semantic.warning.solid,
  danger: colors.semantic.danger.solid,
  neutral: colors.neutral.textMuted,
} as const;

const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

type Props = {
  expanded: boolean;
  onToggleExpand: () => void;
  visibleDays: WeekDay[];
  selectedDateKey: string;
  todayKey: string;
  calendarMonth: Date;
  monthMarkers: Record<string, DayMarker>;
  weekendSchedule: boolean;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onSwipeWeek: (direction: -1 | 1) => void;
};

export function MorphingDayCalendarPicker({
  expanded,
  onToggleExpand,
  visibleDays,
  selectedDateKey,
  todayKey,
  calendarMonth,
  monthMarkers,
  weekendSchedule,
  onSelectDate,
  onMonthChange,
  onSwipeWeek,
}: Props) {
  const handleScale = useSharedValue(1);

  const handleAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: handleScale.value }],
    };
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      // If user drags handle downward when collapsed -> expand!
      if (!expanded && gestureState.dy > 12 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
        return true;
      }
      // If user drags handle upward when expanded -> collapse!
      if (expanded && gestureState.dy < -12 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
        return true;
      }
      return false;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!expanded && gestureState.dy > 20) {
        if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onToggleExpand();
      } else if (expanded && gestureState.dy < -20) {
        if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggleExpand();
      }
    },
  });

  const offset = (calendarMonth.getDay() + 6) % 7;
  const dates = Array.from(
    { length: offset + daysInMonth(calendarMonth) },
    (_, index) => (index < offset ? null : index - offset + 1)
  );
  const weekdayLabels = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(190)}
      style={styles.pickerContainer}
      onTouchStart={(event) => event.stopPropagation()}>
      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(240)}
          exiting={FadeOut.duration(160)}
          style={styles.calendarWidget}>
          <View style={styles.monthNavigation}>
            <IconButton
              icon="chevron-back"
              label="Previous month"
              tone="ghost"
              onPress={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            />
            <AppText variant="title">{formatMonthYear(calendarMonth)}</AppText>
            <IconButton
              icon="chevron-forward"
              label="Next month"
              tone="ghost"
              onPress={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            />
          </View>
          <View style={styles.calendarWeekdays}>
            {weekdayLabels.map((label, index) => {
              const isWeekendCol = index >= 5;
              const disabledCol = isWeekendCol && !weekendSchedule;
              return (
                <AppText
                  key={`${label}-${index}`}
                  variant="caption"
                  color={disabledCol ? colors.neutral.textDisabled : colors.neutral.textMuted}
                  style={[styles.calendarWeekday, disabledCol && styles.calendarDisabledText]}>
                  {label}
                </AppText>
              );
            })}
          </View>
          <View style={styles.calendarGrid}>
            {dates.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.calendarCell} />;
              const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
              const key = dateKey(date);
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isDisabled = isWeekend && !weekendSchedule;
              const selected = key === selectedDateKey;
              const isToday = key === todayKey;
              const marker = (monthMarkers[key] ?? 'none') as keyof typeof markerColorMap;

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={formatDayHeading(date)}
                  accessibilityState={{ selected, disabled: isDisabled }}
                  disabled={isDisabled}
                  onPress={() => onSelectDate(date)}
                  style={({ pressed }) => [
                    styles.calendarCell,
                    selected && styles.calendarSelected,
                    isToday && !selected && styles.calendarToday,
                    isDisabled && styles.calendarCellDisabled,
                    pressed && !isDisabled && styles.actionPressed,
                  ]}>
                  <AppText
                    variant="label"
                    color={
                      selected
                        ? colors.brand.ink
                        : isDisabled
                        ? colors.neutral.textDisabled
                        : colors.neutral.textPrimary
                    }
                    style={[styles.timeText, isDisabled && styles.calendarDisabledText]}>
                    {day}
                  </AppText>
                  <View style={styles.indicatorRow}>
                    <View
                      style={[
                        styles.dot,
                        isToday && !selected && styles.todayDot,
                        marker !== 'none' && !isDisabled && { backgroundColor: markerColorMap[marker] },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)}>
          <WeekStrip
            days={visibleDays}
            selectedDateKey={selectedDateKey}
            todayDateKey={todayKey}
            onSelect={onSelectDate}
            onSwipeWeek={onSwipeWeek}
            style={styles.weekStrip}
          />
        </Animated.View>
      )}

      {/* Pull down / tap to extend bar */}
      <View {...panResponder.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse calendar' : 'Expand calendar'}
          onPressIn={() => {
            handleScale.value = withSpring(0.92, { damping: 12, stiffness: 260 });
          }}
          onPressOut={() => {
            handleScale.value = withSpring(1, { damping: 12, stiffness: 260 });
          }}
          onPress={onToggleExpand}
          style={styles.extendBar}>
          <Animated.View style={[styles.extendHandle, handleAnimStyle]} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    marginTop: spacing[1],
    position: 'relative',
    zIndex: 30,
    elevation: 30,
    borderRadius: radius.feature,
    borderCurve: 'continuous',
    backgroundColor: colors.brand.skySoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2F0FA',
  },
  weekStrip: {
    width: '100%',
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  calendarWidget: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  extendBar: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E2EEF8',
  },
  extendHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.cobalt,
    opacity: 0.5,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  calendarWeekday: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarDisabledText: {
    opacity: 0.4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderCurve: 'continuous',
  },
  calendarCellDisabled: {
    opacity: 0.28,
  },
  calendarSelected: {
    backgroundColor: colors.brand.coral,
  },
  calendarToday: {
    borderWidth: 2,
    borderColor: colors.brand.cobalt,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
    fontSize: 14,
    fontWeight: '700',
  },
  indicatorRow: {
    height: 5,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  todayDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: colors.brand.cobalt,
  },
  actionPressed: {
    opacity: 0.72,
  },
});
