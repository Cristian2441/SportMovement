import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_BG       = BrandColors.pink;      
const TAB_BG_DARK  = BrandColors.pinkDark;   
const ACTIVE_CLR   = BrandColors.white;
const INACTIVE_CLR = 'rgba(255,255,255,0.5)';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <MaterialCommunityIcons name={name} size={26} color={color} />;
}

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'ios' ? 22 : insets.bottom + 8;
  const tabHeight =
    (Platform.OS === 'ios' ? 86 : 68) +
    (Platform.OS === 'android' ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_CLR,
        tabBarInactiveTintColor: INACTIVE_CLR,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          shadowColor: TAB_BG_DARK,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.5,
          shadowRadius: 14,
          elevation: 24,
        } as any,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="entrenadores"
        options={{
          title: 'Entrenadores',
          tabBarIcon: ({ color }) => <TabIcon name="account-tie" color={color} />,
          tabBarLabel: 'entrenadores',
        }}
      />

      <Tabs.Screen
        name="nutricionistas"
        options={{
          title: 'Nutricionistas',
          tabBarIcon: ({ color }) => <TabIcon name="food-apple" color={color} />,
          tabBarLabel: 'nutricionistas',
        }}
      />

      <Tabs.Screen
        name="estadisticas"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color }) => <TabIcon name="chart-bar" color={color} />,
          tabBarLabel: 'estadísticas',
        }}
      />

      <Tabs.Screen
        name="horarios"
        options={{
          title: 'Horarios',
          tabBarIcon: ({ color }) => <TabIcon name="clock-outline" color={color} />,
          tabBarLabel: 'horarios',
        }}
      />

      <Tabs.Screen
        name="equipo"
        options={{
          title: 'Panel General',
          tabBarIcon: ({ color }) => <TabIcon name="view-dashboard" color={color} />,
          tabBarLabel: 'panel general',
        }}
      />
    </Tabs>
  );
}
