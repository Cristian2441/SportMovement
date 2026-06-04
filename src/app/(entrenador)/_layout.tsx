import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const PURPLE_TAB   = BrandColors.purple;       // #4B1FA8
const PURPLE_DARK  = BrandColors.purpleDark;   // #2E0A7A
const ACTIVE_COLOR = BrandColors.white;
const INACTIVE_COLOR = 'rgba(255,255,255,0.55)';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <MaterialCommunityIcons name={name} size={26} color={color} />;
}

export default function EntrenadorLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'ios' ? 22 : insets.bottom + 8;
  const tabHeight =
    (Platform.OS === 'ios' ? 86 : 68) +
    (Platform.OS === 'android' ? insets.bottom : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: PURPLE_TAB,
          borderTopWidth: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          shadowColor: PURPLE_DARK,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.45,
          shadowRadius: 12,
          elevation: 22,
        } as any,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.35,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="personas"
        options={{
          title: 'Personas asignadas',
          tabBarIcon: ({ color }) => <TabIcon name="account-group" color={color} />,
          tabBarLabel: 'Personas',
        }}
      />
      <Tabs.Screen
        name="rutinas"
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color }) => <TabIcon name="dumbbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="horario"
        options={{
          title: 'Horario',
          tabBarIcon: ({ color }) => <TabIcon name="calendar-month" color={color} />,
        }}
      />
    </Tabs>
  );
}

const _styles = StyleSheet.create({});
