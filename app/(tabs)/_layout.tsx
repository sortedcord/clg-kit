import { Tabs } from 'expo-router';

import { GlobalAddClassProvider } from '@/components/global-add-class';
import { BottomTabBar } from '@/components/ui/bottom-tab-bar';

export default function TabLayout() {
  return (
    <GlobalAddClassProvider>
      <Tabs
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          // The visible dock is independently absolute; this removes React Navigation's reserved tab-bar scene area.
          tabBarStyle: { position: 'absolute', height: 0, backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="timetable" options={{ title: 'Timetable' }} />
        <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </GlobalAddClassProvider>
  );
}
