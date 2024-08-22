import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5, Entypo } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarShowLabel: false
      }}>
      <Tabs.Screen
        name="(top-tabs)"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon size={24} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name='dumbbell' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='nutrition'
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name='utensils' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='progress'
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Entypo name='bar-graph' size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
