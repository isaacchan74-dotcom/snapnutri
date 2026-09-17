import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CameraScreen } from '../screens/main/CameraScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { JournalScreen } from '../screens/main/JournalScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { useTheme } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof MainTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Camera: { active: 'camera', inactive: 'camera-outline' },
  Journal: { active: 'book', inactive: 'book-outline' },
  Dashboard: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          height: theme.layout.tabBarHeight,
          paddingTop: theme.layout.tabBarPaddingTop,
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: theme.borderWidth.hairline,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xxs,
          fontWeight: theme.fontWeight.bold,
          letterSpacing: theme.letterSpacing.wide,
        },
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={theme.iconSize.md}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Camera" component={CameraScreen} options={{ title: 'Snap' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: 'Journal' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Stats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
