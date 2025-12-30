import 'react-native-gesture-handler';

import { View, StatusBar, ActivityIndicator } from 'react-native';
import BottomTabs from './src/navigation/BottomTabs';
import AuthNavigator from './src/navigation/AuthNavigator';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { getColors } from './src/theme/colors';


function AppContent() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();
  const COLORS = getColors(theme === 'dark');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {user ? <BottomTabs /> : <AuthNavigator />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
