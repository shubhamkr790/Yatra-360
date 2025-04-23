import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner-native';

export default function ProfileScreen() {
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    areasOfExpertise: '',
    spokenLanguages: '',
    experienceYears: '',
    hourlyRate: '',
    bio: '',
    profilePictureUrl: '',
    idProofUrl: '',
    guideLicenseUrl: '',
    certifications: '',
    preferredLocations: ''
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: guideData } = await supabase
          .from('guide_registrations')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (guideData) {
          setProfile(guideData);
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const pickImage = async (type: 'profile' | 'id' | 'license') => {
    try {
      const result = await ImagePicker.launchImagePickerAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        switch (type) {
          case 'profile':
            setFormData(prev => ({ ...prev, profilePicture: uri }));
            break;
          case 'id':
            setFormData(prev => ({ ...prev, idProof: uri }));
            break;
          case 'license':
            setFormData(prev => ({ ...prev, guideLicense: uri }));
            break;
        }
      }
    } catch (error) {
      toast.error('Error picking image');
    }
  };  const validateDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Check if date is not in the future and person is at least 18 years old
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 18);
    
    return date <= minDate;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Enhanced validation
      if (!formData.fullName || !formData.email || !formData.phoneNumber) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.dateOfBirth) {
        toast.error('Please enter your date of birth');
        return;
      }

      if (!validateDate(formData.dateOfBirth)) {
        toast.error('Please enter a valid date in YYYY-MM-DD format. You must be at least 18 years old.');
        return;
      }

      if (!formData.profilePictureUrl || !formData.idProofUrl) {
        toast.error('Please provide all required document URLs');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Authentication error. Please login again.');
        return;
      }

      const { data, error } = await supabase
        .from('guide_registrations')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          date_of_birth: formData.dateOfBirth,
          areas_of_expertise: formData.areasOfExpertise.split(',').map(item => item.trim()),
          spoken_languages: formData.spokenLanguages.split(',').map(item => item.trim()),
          experience_years: parseInt(formData.experienceYears) || 0,
          hourly_rate: parseFloat(formData.hourlyRate) || 0,
          bio: formData.bio,
          profile_picture_url: formData.profilePictureUrl,
          id_proof_url: formData.idProofUrl,
          guide_license_url: formData.guideLicenseUrl || null,
          certifications: formData.certifications ? formData.certifications.split(',').map(item => item.trim()) : [],
          preferred_locations: formData.preferredLocations ? formData.preferredLocations.split(',').map(item => item.trim()) : [],
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error submitting guide registration:', error);
        throw error;
      }

      console.log('Guide registration successful:', data);
      toast.success('Guide registration submitted for review');
      setShowGuideForm(false);
      checkProfile();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form');
    } finally {
      setIsLoading(false);
    }
  };  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGuideStatus = () => {
    if (!profile) return null;

    return (
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Guide Registration Status</Text>
        <View style={[
          styles.statusBadge,
          profile.status === 'approved' ? styles.statusApproved :
          profile.status === 'rejected' ? styles.statusRejected :
          styles.statusPending
        ]}>
          <Text style={styles.statusText}>
            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
          </Text>
        </View>
        {profile.admin_notes && (
          <Text style={styles.adminNotes}>{profile.admin_notes}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>        {renderGuideStatus()}        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.logoutHintContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.logoutHint}>
              You'll need to sign in again to access your account
            </Text>
          </View>
        </View>

        {!showGuideForm && !profile && (
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
            <TouchableOpacity 
              style={styles.guideButton}
              onPress={() => setShowGuideForm(true)}
            >
              <Ionicons name="briefcase-outline" size={24} color="#007AFF" />
              <Text style={styles.guideButtonText}>Register as Guide</Text>
            </TouchableOpacity>
          </View>
        )}

        {showGuideForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Guide Registration</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Areas of Expertise</Text>
              <TextInput
                style={styles.input}
                value={formData.areasOfExpertise}
                onChangeText={(text) => setFormData(prev => ({ ...prev, areasOfExpertise: text }))}
                placeholder="Enter areas separated by commas"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spoken Languages</Text>
              <TextInput
                style={styles.input}
                value={formData.spokenLanguages}
                onChangeText={(text) => setFormData(prev => ({ ...prev, spokenLanguages: text }))}
                placeholder="Enter languages separated by commas"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                value={formData.experienceYears}
                onChangeText={(text) => setFormData(prev => ({ ...prev, experienceYears: text }))}
                placeholder="Enter number of years"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, hourlyRate: text }))}
                placeholder="Enter your hourly rate"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            </View>              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profile Picture URL</Text>
                <TextInput
                  style={[styles.input, styles.urlInput]}
                  value={formData.profilePictureUrl}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, profilePictureUrl: text }))}
                  placeholder="Enter profile picture URL"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ID Proof URL</Text>
                <TextInput
                  style={[styles.input, styles.urlInput]}
                  value={formData.idProofUrl}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, idProofUrl: text }))}
                  placeholder="Enter ID proof document URL"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Guide License URL (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.urlInput]}
                  value={formData.guideLicenseUrl}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, guideLicenseUrl: text }))}
                  placeholder="Enter guide license URL"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Certifications</Text>
              <TextInput
                style={styles.input}
                value={formData.certifications}
                onChangeText={(text) => setFormData(prev => ({ ...prev, certifications: text }))}
                placeholder="Enter certifications separated by commas"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Locations</Text>
              <TextInput
                style={styles.input}
                value={formData.preferredLocations}
                onChangeText={(text) => setFormData(prev => ({ ...prev, preferredLocations: text }))}
                placeholder="Enter locations separated by commas"
                multiline
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowGuideForm(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}  const styles = StyleSheet.create({
    logoutContainer: {
      margin: 20,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#FF3B30',
      gap: 10,
      shadowColor: '#FF3B30',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    logoutHintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 4,
      gap: 8,
    },
    logoutHint: {
      color: '#666',
      fontSize: 14,
      flex: 1,
    },
    urlInput: {
      minHeight: 44,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    gap: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  guideButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusPending: {
    backgroundColor: '#FFA50020',
  },
  statusApproved: {
    backgroundColor: '#4CAF5020',
  },
  statusRejected: {
    backgroundColor: '#FF3B3020',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});