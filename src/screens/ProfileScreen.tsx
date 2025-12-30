import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';
import { supabase } from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (dateOfBirth) {
      calculateAge(dateOfBirth);
    }
  }, [dateOfBirth]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setGender(data.gender || '');
        setMobileNumber(data.mobile_number || '');
        setDateOfBirth(data.date_of_birth || '');
        setProfilePicture(data.profile_picture_url || '');
        
        if (data.date_of_birth) {
          setSelectedDate(new Date(data.date_of_birth));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) {
      setAge('');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    setAge(calculatedAge.toString());
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
      setIsEditing(true);
    }
  };

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selected) {
      setSelectedDate(selected);
      const formattedDate = selected.toISOString().split('T')[0];
      setDateOfBirth(formattedDate);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          gender,
          mobile_number: mobileNumber,
          date_of_birth: dateOfBirth || null,
          profile_picture_url: profilePicture,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      loadProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePicturePlaceholderText}>
                {name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Pressable style={styles.changePictureButton} onPress={pickImage}>
            <Text style={styles.changePictureText}>Change Photo</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setIsEditing(true);
            }}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false}
            placeholder="Email address"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Other'].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.genderButton,
                  gender === option && styles.genderButtonActive,
                ]}
                onPress={() => {
                  setGender(option);
                  setIsEditing(true);
                }}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === option && styles.genderButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              setIsEditing(true);
            }}
            placeholder="Enter mobile number"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Date of Birth</Text>
          <Pressable 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.datePickerText, !dateOfBirth && styles.placeholderText]}>
              {dateOfBirth || 'Select Date of Birth'}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={age}
            editable={false}
            placeholder="Calculated from DOB"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {isEditing && (
          <Pressable
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicturePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePictureButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePictureText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: -8,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
