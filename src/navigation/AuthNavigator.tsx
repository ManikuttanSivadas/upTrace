import React, { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

export default function AuthNavigator() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <LoginScreen onNavigateToSignup={() => setShowLogin(false)} />;
  }

  return <SignupScreen onNavigateToLogin={() => setShowLogin(true)} />;
}
