import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TimerScreen from '../screens/TimerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
  },
};

export default function BottomTabs() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 70 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            paddingLeft: 0,
            paddingRight: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 0,
            marginHorizontal: 0,
          },
        }}
      >
        <Tab.Screen 
          name="Log Workout" 
          component={LogWorkoutScreen}
          options={{
            tabBarLabel: 'Workout',
          }}
        />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen 
          name="EditProfile" 
          component={ProfileScreen}
          options={{ tabBarButton: () => null }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
