import { useEffect, useMemo, useRef } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AppText } from './app-text';
import { IconButton } from './icon-button';
import { colors, radius, spacing } from './tokens';
import { dateKey, formatDayHeading, formatMonthYear, formatWeekdayShort } from '@/lib/date';
import type { WeekDay } from './week-strip';

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

const COLLAPSED_HEIGHT = 92;

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
  // progress: 0 = collapsed (Day Picker), 1 = expanded (Month Calendar)
  const progress = useSharedValue(expanded ? 1 : 0);
  const handleScale = useSharedValue(1);

  // Calculate dynamic expanded height based on number of weeks in current month
  const offset = (calendarMonth.getDay() + 6) % 7;
  const totalDays = daysInMonth(calendarMonth);
  const numRows = Math.ceil((offset + totalDays) / 7);
  // Header: 48, Weekdays: 24, Rows: numRows * 42, Handle bar: 22, Padding: 16
  const expandedHeight = 48 + 24 + numRows * 42 + 22 + 16;

  // Keep progress in sync with expanded prop
  useEffect(() => {
    progress.value = withSpring(expanded ? 1 : 0, {
      damping: 20,
      stiffness: 190,
      mass: 0.8,
    });
  }, [expanded, progress]);

  const triggerHaptic = (style: 'medium' | 'light') => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(
        style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      );
    }
  };

  // Container height animation
  const containerAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const height = interpolate(
      progress.value,
      [0, 1],
      [COLLAPSED_HEIGHT, expandedHeight],
      Extrapolation.CLAMP
    );
    return {
      height,
    };
  });

  // 1. Month Header Row:
  // - Height expands from 0 to 46
  // - Month title fades in and scales
  // - Left arrow slides in from left
  // - Right arrow slides in from right
  const monthHeaderRowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const height = interpolate(progress.value, [0, 1], [0, 46], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0.15, 0.85], [0, 1], Extrapolation.CLAMP);
    return {
      height,
      opacity,
    };
  });

  const prevArrowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const translateX = interpolate(progress.value, [0.1, 1], [-35, 0], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0.2, 0.9], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const nextArrowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const translateX = interpolate(progress.value, [0.1, 1], [35, 0], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0.2, 0.9], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const monthTitleAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(progress.value, [0.25, 0.9], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0.1, 1], [0.82, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // 2. Weekday Header Row ("mon, tue, wed, thu, fri, sat, sun"):
  // Slides upward into place and fades in
  const weekdayHeaderRowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const height = interpolate(progress.value, [0, 1], [0, 22], Extrapolation.CLAMP);
    const opacity = interpolate(progress.value, [0.3, 0.9], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0, 1], [-8, 0], Extrapolation.CLAMP);
    return {
      height,
      opacity,
      transform: [{ translateY }],
    };
  });

  // 3. Day picker shrink animation:
  // As user pulls down, the days shrink slightly and fade out
  const weekStripAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0, 0.8], [1, 0.88], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0, 0.8], [0, -6], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  // 4. Month Grid animation:
  // As it expands, the calendar numbers scale smoothly from 1.1 down to 1.0 into their exact grid slots
  const monthGridAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(progress.value, [0.35, 0.95], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0.2, 1], [1.08, 1], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0.2, 1], [14, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  // Handle spring animation on tap
  const handleAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: handleScale.value }],
    };
  });

  // Interactive Dragging Gestures:
  // The user can drag open or drag closed from anywhere on the component with smooth 60fps tracking
  const startProgressRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gs) => {
          // Detect intentional vertical drag
          return Math.abs(gs.dy) > 7 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.3;
        },
        onMoveShouldSetPanResponderCapture: (_, gs) => {
          return Math.abs(gs.dy) > 7 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.3;
        },
        onPanResponderGrant: () => {
          startProgressRef.current = progress.value;
        },
        onPanResponderMove: (_, gs) => {
          const range = expandedHeight - COLLAPSED_HEIGHT;
          const delta = gs.dy / range;
          const next = Math.max(0, Math.min(1, startProgressRef.current + delta));
          progress.value = next;
        },
        onPanResponderRelease: (_, gs) => {
          const current = progress.value;
          const vy = gs.vy;
          let target = expanded;
          if (vy > 0.5) {
            target = true;
          } else if (vy < -0.5) {
            target = false;
          } else {
            target = current > 0.45;
          }

          progress.value = withSpring(target ? 1 : 0, {
            damping: 18,
            stiffness: 190,
            mass: 0.8,
          });

          if (target !== expanded) {
            runOnJS(triggerHaptic)(target ? 'medium' : 'light');
            runOnJS(onToggleExpand)();
          }
        },
      }),
    [expanded, expandedHeight, onToggleExpand, progress]
  );

  const dates = Array.from(
    { length: offset + totalDays },
    (_, index) => (index < offset ? null : index - offset + 1)
  );
  const weekdayLabels = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <Animated.View
      style={[styles.pickerContainer, containerAnimStyle]}
      onTouchStart={(event) => event.stopPropagation()}
      {...panResponder.panHandlers}>
      {/* 1. Month Header Row */}
      <Animated.View style={[styles.monthHeaderRow, monthHeaderRowAnimStyle]}>
        <Animated.View style={prevArrowAnimStyle}>
          <IconButton
            icon="chevron-back"
            label="Previous month"
            tone="ghost"
            onPress={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
          />
        </Animated.View>
        <Animated.View style={monthTitleAnimStyle}>
          <AppText variant="title" style={styles.monthTitleText}>
            {formatMonthYear(calendarMonth)}
          </AppText>
        </Animated.View>
        <Animated.View style={nextArrowAnimStyle}>
          <IconButton
            icon="chevron-forward"
            label="Next month"
            tone="ghost"
            onPress={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
          />
        </Animated.View>
      </Animated.View>

      {/* 2. Weekday Header Row */}
      <Animated.View style={[styles.calendarWeekdaysRow, weekdayHeaderRowAnimStyle]}>
        {weekdayLabels.map((label, index) => {
          const isWeekendCol = index >= 5;
          const disabledCol = isWeekendCol && !weekendSchedule;
          return (
            <AppText
              key={`${label}-${index}`}
              variant="caption"
              color={disabledCol ? colors.neutral.textDisabled : colors.neutral.textMuted}
              style={[styles.calendarWeekdayLabel, disabledCol && styles.calendarDisabledText]}>
              {label}
            </AppText>
          );
        })}
      </Animated.View>

      {/* 3. Main Content Layer */}
      <View style={styles.contentArea}>
        {/* Collapsed Day Picker */}
        <Animated.View
          style={[styles.weekStripWrapper, weekStripAnimStyle]}
          pointerEvents={expanded ? 'none' : 'auto'}>
          <View style={styles.weekStripRow}>
            {visibleDays.map(({ date, disabled = false, marker = 'none' }) => {
              const key = dateKey(date);
              const selected = key === selectedDateKey;
              const today = key === todayKey;
              const weekday = formatWeekdayShort(date).slice(0, 3).toLowerCase();
              const fullDate = formatDayHeading(date);

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={fullDate}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => {
                    if (Platform.OS !== 'web') void Haptics.selectionAsync();
                    onSelectDate(date);
                  }}
                  style={styles.weekDayPressable}>
                  <View
                    style={[
                      styles.weekDayCell,
                      selected && styles.weekDaySelected,
                      disabled && styles.weekDayDisabled,
                    ]}>
                    <AppText
                      variant="caption"
                      color={selected ? colors.brand.ink : colors.neutral.textMuted}
                      style={styles.weekDayLabel}>
                      {weekday}
                    </AppText>
                    <AppText
                      variant="title"
                      color={selected ? colors.brand.ink : colors.neutral.textPrimary}
                      style={styles.weekDayNumber}>
                      {date.getDate()}
                    </AppText>
                    <View style={styles.indicatorRow}>
                      <View
                        style={[
                          styles.dot,
                          today && !selected && styles.todayDot,
                          marker !== 'none' && { backgroundColor: markerColorMap[marker] },
                        ]}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Expanded Month Grid */}
        <Animated.View
          style={[styles.calendarGridContainer, monthGridAnimStyle]}
          pointerEvents={expanded ? 'auto' : 'none'}>
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
                    style={[styles.calendarDayNum, isDisabled && styles.calendarDisabledText]}>
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
      </View>

      {/* 4. Bottom Extend Handle Bar */}
      <View style={styles.extendBarArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse calendar' : 'Expand calendar'}
          onPressIn={() => {
            handleScale.value = withSpring(0.88, { damping: 12, stiffness: 260 });
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
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    overflow: 'hidden',
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral.textPrimary,
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[3],
    overflow: 'hidden',
  },
  calendarWeekdayLabel: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarDisabledText: {
    opacity: 0.35,
  },
  calendarGridContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    bottom: 0,
    paddingHorizontal: spacing[3],
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
  calendarDayNum: {
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    fontWeight: '700',
  },
  weekStripWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 4,
    paddingHorizontal: spacing[2],
  },
  weekStripRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  weekDayPressable: {
    flex: 1,
  },
  weekDayCell: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderCurve: 'continuous',
    paddingVertical: spacing[1],
  },
  weekDaySelected: {
    backgroundColor: colors.brand.coral,
  },
  weekDayDisabled: {
    opacity: 0.4,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  weekDayNumber: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
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
  extendBarArea: {
    height: 20,
    justifyContent: 'flex-end',
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
  actionPressed: {
    opacity: 0.72,
  },
});
