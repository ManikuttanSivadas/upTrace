import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TimerScreen from '../screens/TimerScreen';
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
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      >
        <Tab.Screen name="Log Workout" component={LogWorkoutScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
