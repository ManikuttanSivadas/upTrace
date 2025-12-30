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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';
import { supabase } from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo',
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export default function ProfileScreen() {
  const { user, logout, refreshUserProfile } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [extension, setExtension] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [country, setCountry] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

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
        setCountry(data.country || '');
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
          country,
          mobile_number: mobileNumber,
          date_of_birth: dateOfBirth || null,
          profile_picture_url: profilePicture,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshUserProfile();
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
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
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
          <Pressable 
            style={styles.input}
            onPress={() => setShowGenderPicker(true)}
          >
            <Text style={[styles.text, !gender && styles.placeholderText]}>
              {gender || 'Select Gender'}
            </Text>
          </Pressable>

          <Modal
            visible={showGenderPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setShowGenderPicker(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Gender</Text>
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                  <Pressable
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      setGender(option);
                      setIsEditing(true);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      gender === option && styles.modalOptionTextActive
                    ]}>
                      {option}
                    </Text>
                    {gender === option && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
                <Pressable 
                  style={styles.modalCancelButton}
                  onPress={() => setShowGenderPicker(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <Text style={styles.label}>Country</Text>
          <Pressable 
            style={styles.input}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={[styles.text, !country && styles.placeholderText]}>
              {country || 'Select Country'}
            </Text>
          </Pressable>

          <Modal
            visible={showCountryPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCountryPicker(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setShowCountryPicker(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TextInput
                  style={styles.searchInput}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  placeholder="Search country..."
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="none"
                />
                <ScrollView style={styles.modalScrollView}>
                  {COUNTRIES.filter(c => 
                    c.toLowerCase().includes(countrySearch.toLowerCase())
                  ).map((option) => (
                    <Pressable
                      key={option}
                      style={styles.modalOption}
                      onPress={() => {
                        setCountry(option);
                        setIsEditing(true);
                        setShowCountryPicker(false);
                        setCountrySearch('');
                      }}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        country === option && styles.modalOptionTextActive
                      ]}>
                        {option}
                      </Text>
                      {country === option && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowCountryPicker(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <Text style={styles.label}>Extension & Mobile Number</Text>
          <View style={styles.rowContainer}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={extension}
              onChangeText={(text) => {
                setExtension(text);
                setIsEditing(true);
              }}
              placeholder="Ext"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                setIsEditing(true);
              }}
              placeholder="Enter mobile number"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Date of Birth & Age</Text>
          <View style={styles.rowContainer}>
            <Pressable 
              style={[styles.datePickerButton, styles.inputFlex]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.datePickerText, !dateOfBirth && styles.placeholderText]}>
                {dateOfBirth || 'Select Date of Birth'}
              </Text>
            </Pressable>
            <TextInput
              style={[styles.input, styles.inputDisabled, styles.inputSmall]}
              value={age}
              editable={false}
              placeholder="Auto"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
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
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
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
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputFlex: {
    flex: 1,
  },
  inputSmall: {
    width: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
