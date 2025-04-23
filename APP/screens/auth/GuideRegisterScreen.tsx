import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

const languages = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 
  'Malayalam', 'Bengali', 'Gujarati', 'Marathi', 'Punjabi'
];

const expertiseAreas = [
  'Ancient Architecture',
  'Temple History',
  'Cultural Heritage',
  'Local Customs',
  'Art History',
  'Religious Sites',
  'Historical Monuments',
  'Archaeological Sites',
  'Traditional Arts',
  'Folk Culture'
];

export default function GuideRegisterScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    expertise: [] as string[],
    languages: [] as string[],
    bio: '',
    experience: '',
    certifications: '',
    hourlyRate: '',
    profilePicture: '',
    idProof: '',
    guideLicense: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const pickImage = async (type: 'profile' | 'id' | 'license') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission to access gallery was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        switch (type) {
          case 'profile':
            setUploadingImage(true);
            await uploadImage(uri, 'profile');
            setUploadingImage(false);
            break;
          case 'id':
            setUploadingId(true);
            await uploadImage(uri, 'id');
            setUploadingId(false);
            break;
          case 'license':
            setUploadingLicense(true);
            await uploadImage(uri, 'license');
            setUploadingLicense(false);
            break;
        }
      }
    } catch (error) {
      toast.error('Error picking image');
      console.error(error);
    }
  };

  const uploadImage = async (uri: string, type: 'profile' | 'id' | 'license') => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const path = `${Date.now()}-${filename}`;

      const { data, error } = await supabase.storage
        .from('guide-documents')
        .upload(path, blob);

      if (error) throw error;

      if (data) {
        const publicUrl = supabase.storage
          .from('guide-documents')
          .getPublicUrl(path).data.publicUrl;

        setFormData(prev => ({
          ...prev,
          [type === 'profile' ? 'profilePicture' : 
           type === 'id' ? 'idProof' : 'guideLicense']: publicUrl
        }));

        toast.success(`${type} image uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.profilePicture || !formData.idProof || !formData.guideLicense) {
      toast.error('Please upload all required documents');
      return;
    }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;      if (authData.user) {
        // Create user profile with proper user_type and auth_id
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            user_type: 'guide',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        // Create guide profile
        const { error: guideError } = await supabase
          .from('guides')
          .insert({
            user_id: authData.user.id,
            areas_of_expertise: formData.expertise,
            spoken_languages: formData.languages,
            bio: formData.bio,
            experience_years: parseInt(formData.experience),
            certifications: [formData.certifications],
            hourly_rate: parseFloat(formData.hourlyRate),
            id_proof_url: formData.idProof,
            guide_license_url: formData.guideLicense,
            profile_picture_url: formData.profilePicture,
            verification_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (guideError) {
          console.error('Guide profile creation error:', guideError);
          throw new Error('Failed to create guide profile');
        }

        toast.success('Registration successful! Please wait for verification.');
        navigation.navigate('Login', { userType: 'guide' });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Guide Registration</Text>
          <Text style={styles.subtitle}>Join as a Local Guide</Text>
        </View>

        <View style={styles.form}>
          {/* Profile Picture Upload */}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => pickImage('profile')}
          >
            {formData.profilePicture ? (
              <Image 
                source={{ uri: formData.profilePicture }} 
                style={styles.uploadedImage} 
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                {uploadingImage ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color="#666" />
                    <Text style={styles.uploadText}>Upload Profile Picture</Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Basic Information */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>

          {/* Expertise */}
          <Text style={styles.sectionTitle}>Areas of Expertise</Text>
          <View style={styles.tagsContainer}>
            {expertiseAreas.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.tag,
                  formData.expertise.includes(area) && styles.selectedTag
                ]}
                onPress={() => toggleExpertise(area)}
              >
                <Text style={[
                  styles.tagText,
                  formData.expertise.includes(area) && styles.selectedTagText
                ]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Languages */}
          <Text style={styles.sectionTitle}>Languages Spoken</Text>
          <View style={styles.tagsContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.tag,
                  formData.languages.includes(language) && styles.selectedTag
                ]}
                onPress={() => toggleLanguage(language)}
              >
                <Text style={[
                  styles.tagText,
                  formData.languages.includes(language) && styles.selectedTagText
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bio */}
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself and your experience..."
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={4}
          />

          {/* Experience and Rate */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <TextInput
                style={styles.input}
                placeholder="Years of Experience"
                value={formData.experience}
                onChangeText={(text) => setFormData(prev => ({ ...prev, experience: text }))}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="Hourly Rate (₹)"
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, hourlyRate: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Certifications */}
          <View style={styles.inputContainer}>
            <Ionicons name="ribbon-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Certifications (comma separated)"
              value={formData.certifications}
              onChangeText={(text) => setFormData(prev => ({ ...prev, certifications: text }))}
            />
          </View>

          {/* Document Uploads */}
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          <TouchableOpacity 
            style={styles.documentUpload}
            onPress={() => pickImage('id')}
          >
            {uploadingId ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons 
                  name={formData.idProof ? "checkmark-circle" : "cloud-upload"} 
                  size={24} 
                  color={formData.idProof ? "#4CAF50" : "#666"} 
                />
                <Text style={styles.documentText}>
                  {formData.idProof ? "ID Proof Uploaded" : "Upload ID Proof"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentUpload}
            onPress={() => pickImage('license')}
          >
            {uploadingLicense ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons 
                  name={formData.guideLicense ? "checkmark-circle" : "cloud-upload"} 
                  size={24} 
                  color={formData.guideLicense ? "#4CAF50" : "#666"} 
                />
                <Text style={styles.documentText}>
                  {formData.guideLicense ? "Guide License Uploaded" : "Upload Guide License"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 20,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
    gap: 15,
  },
  uploadButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  uploadedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTag: {
    backgroundColor: '#007AFF',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTagText: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  documentUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  documentText: {
    fontSize: 16,
    color: '#666',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});