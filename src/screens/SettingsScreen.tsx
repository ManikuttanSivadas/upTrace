import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getColors } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../config/supabase';

function SettingsScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const COLORS = getColors(theme === 'dark');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setProfilePicture(data.profile_picture_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your workout data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account deletion will be implemented soon');
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({
    title,
    value,
    onPress,
    showArrow = true,
  }: {
    title: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && <Text style={styles.arrow}>›</Text>}
      </View>
    </Pressable>
  );

  const SettingToggle = ({
    title,
    value,
    onValueChange,
  }: {
    title: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
    },
    headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: COLORS.surface,
      marginHorizontal: 16,
      marginBottom: 24,
      borderRadius: 12,
    },
    profilePicture: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    profilePicturePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profilePicturePlaceholderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    profileInfo: {
      flex: 1,
      marginLeft: 16,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    editButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    editButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: 8,
      paddingHorizontal: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValue: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginRight: 8,
    },
    arrow: {
      fontSize: 24,
      color: COLORS.textSecondary,
    },
    logoutButton: {
      backgroundColor: COLORS.surface,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: COLORS.surface,
      padding: 16,
      marginHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: COLORS.danger,
      fontSize: 16,
      fontWeight: '600',
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    appInfoText: {
      fontSize: 12,
      color: COLORS.textSecondary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Text style={styles.profilePicturePlaceholderText}>
              {name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
        <Pressable style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      {/* General Settings */}
      <SettingSection title="General">
        <SettingToggle
          title="Notifications"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SettingToggle
          title="Sound Effects"
          value={soundEnabled}
          onValueChange={setSoundEnabled}
        />
        <SettingToggle
          title="Dark Mode"
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </SettingSection>

      {/* Workout Settings */}
      <SettingSection title="Workout">
        <SettingItem
          title="Default Weight Unit"
          value="kg"
          onPress={() => Alert.alert('Info', 'Weight unit selection coming soon')}
        />
        <SettingItem
          title="Rest Timer Default"
          value="60s"
          onPress={() => Alert.alert('Info', 'Rest timer settings coming soon')}
        />
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection title="Data & Privacy">
        <SettingItem
          title="Export Workout Data"
          onPress={() => Alert.alert('Info', 'Data export coming soon')}
        />
        <SettingItem
          title="Privacy Policy"
          onPress={() => Alert.alert('Privacy Policy', 'Your data is stored securely in Supabase')}
        />
      </SettingSection>

      {/* Account */}
      <SettingSection title="Account">
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </Pressable>
      </SettingSection>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>upTrace v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

export default SettingsScreen;
