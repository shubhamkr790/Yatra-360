import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.gradient}
      />
      
      <Image
        source={{ uri: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/welcomescreen//welcomescreen.webp' }}
        style={styles.backgroundImage}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Yatra360</Text>
          <Text style={styles.subtitle}>Discover India's Heritage</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login', { userType: 'tourist' })}
          >
            <Ionicons name="person-outline" size={24} color="white" />
            <Text style={styles.buttonText}>I'm a Tourist</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.guideButton]}
            onPress={() => navigation.navigate('Login', { userType: 'guide' })}
          >
            <Ionicons name="compass-outline" size={24} color="#007AFF" />
            <Text style={[styles.buttonText, styles.guideButtonText]}>
              I'm a Local Guide
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    zIndex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 2,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  guideButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  guideButtonText: {
    color: '#007AFF',
  },
});