import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, size, spacing } from './tokens';

const tabConfig = {
  index: { label: 'Today', icon: 'today-outline', activeIcon: 'today' },
  timetable: { label: 'Timetable', icon: 'calendar-outline', activeIcon: 'calendar' },
  attendance: { label: 'Attendance', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  settings: { label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
} as const;

/** Floating, label-forward dock that keeps the active destination prominent without covering the page in a solid bar. */
export function BottomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return <View pointerEvents="box-none" style={[styles.floatingArea, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}>
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = tabConfig[route.name as keyof typeof tabConfig];
        if (!config) return null;
        const options = descriptors[route.key].options;
        const label = options.tabBarLabel === undefined || typeof options.tabBarLabel === 'string' ? options.tabBarLabel ?? config.label : config.label;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            if (Platform.OS !== 'web') void Haptics.selectionAsync();
            navigation.navigate(route.name);
          }
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
        return <Pressable
          key={route.key}
          accessibilityRole="button"
          accessibilityLabel={typeof label === 'string' ? label : config.label}
          accessibilityState={{ selected: focused }}
          onPress={onPress}
          onLongPress={onLongPress}
          style={({ pressed }) => [styles.tab, focused && styles.tabActive, pressed && styles.pressed]}>
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons
              name={focused ? config.activeIcon : config.icon}
              size={20}
              color={focused ? colors.brand.cobalt : colors.neutral.textMuted}
            />
          </View>
          <AppText
            variant="caption"
            color={focused ? colors.brand.cobalt : colors.neutral.textMuted}
            numberOfLines={1}
            style={[styles.label, focused && styles.labelActive]}>
            {label}
          </AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  floatingArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bar: {
    minHeight: size.tabBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    paddingTop: spacing[2],
    paddingHorizontal: spacing[4],
  },
  tab: {
    minHeight: size.touchTargetMin,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing[1],
  },
  tabActive: {
    // Active tab keeps the clean columnar structure with color prominence
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderCurve: 'continuous',
  },
  iconWrapActive: {
    backgroundColor: colors.brand.cobaltSoft,
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
