import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { useGlobalAddClass } from '@/components/global-add-class';
import { colors, radius, shadow, size, spacing } from './tokens';

const tabConfig = {
  index: { label: 'Today', icon: 'today-outline', activeIcon: 'today' },
  timetable: { label: 'Timetable', icon: 'calendar-outline', activeIcon: 'calendar' },
  attendance: { label: 'Attendance', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  settings: { label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
} as const;

/** Compact floating navigation group paired with a persistent global add action. */
export function BottomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { openAddClass } = useGlobalAddClass();
  const feedback = () => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
  };

  const addClass = () => {
    feedback();
    navigation.navigate('index');
    // Defer until the Today scene is active so the modal is not dismissed by the tab transition.
    setTimeout(openAddClass, 0);
  };

  return (
    <View pointerEvents="box-none" style={[styles.floatingArea, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}>
      <View style={styles.navigationGroup}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = tabConfig[route.name as keyof typeof tabConfig];
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              feedback();
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tab, focused && styles.tabActive, pressed && styles.pressed]}>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                size={21}
                color={focused ? colors.brand.ink : colors.neutral.textSecondary}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a class"
        onPress={addClass}
        style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}>
        <Ionicons name="add" size={26} color={colors.brand.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    backgroundColor: 'transparent',
  },
  navigationGroup: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: radius.feature,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#DCEEF8',
    backgroundColor: colors.brand.skySoft,
    ...shadow.floating,
  },
  tab: {
    minWidth: size.touchTargetMin,
    minHeight: size.touchTargetMin,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderCurve: 'continuous',
  },
  tabActive: {
    backgroundColor: colors.brand.coral,
  },
  addButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.feature,
    borderCurve: 'continuous',
    backgroundColor: colors.brand.coral,
    ...shadow.floating,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },
  addPressed: {
    backgroundColor: colors.brand.coralSoft,
    transform: [{ scale: 0.96 }],
  },
});
