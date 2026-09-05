import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './app-text';
import { colors, radius, shadow, size, spacing } from './tokens';

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
          <Ionicons name={focused ? config.activeIcon : config.icon} size={focused ? 19 : 20} color={focused ? colors.neutral.surface : colors.neutral.textSecondary} />
          <AppText variant="caption" color={focused ? colors.neutral.surface : colors.neutral.textSecondary} numberOfLines={1} style={styles.label}>{label}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  floatingArea: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing[4], paddingTop: spacing[3], backgroundColor: 'transparent' },
  bar: { minHeight: size.touchTargetMin + spacing[3], flexDirection: 'row', alignItems: 'center', gap: 2, padding: spacing[2], borderRadius: radius.sheet, borderCurve: 'continuous', borderWidth: 1, borderColor: colors.neutral.border, backgroundColor: colors.neutral.surface, ...shadow.floating },
  tab: { minHeight: size.touchTargetMin, flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: radius.pill, borderCurve: 'continuous', paddingHorizontal: spacing[1] },
  tabActive: { flexDirection: 'row', flexGrow: 1.15, gap: spacing[1] + 2, backgroundColor: colors.brand.cobalt, paddingHorizontal: spacing[3] },
  label: { textAlign: 'center', flexShrink: 0 },
  pressed: { opacity: 0.76 },
});
