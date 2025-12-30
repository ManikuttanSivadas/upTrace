import 'react-native-gesture-handler';

import { View, StatusBar, ActivityIndicator } from 'react-native';
import BottomTabs from './src/navigation/BottomTabs';
import AuthNavigator from './src/navigation/AuthNavigator';
import { COLORS } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" />
      {user ? <BottomTabs /> : <AuthNavigator />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
