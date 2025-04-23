import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { GOOGLE_CLOUD_CREDENTIALS } from '../config/credentials';

interface MonumentData {
  name: string;
  description: string;
  history: string;
  timings: string;
  accessibility: string;
  funFacts: string[];
  imageUrl: string;
  architecturalStyle?: string;
  period?: string;
  inscriptions?: string[];
  nearbyAttractions?: Array<{
    name: string;
    distance: string;
    type: string;
  }>;
  weatherRecommendation?: string;
  bestTimeToVisit?: string;
}

export default function MonumentScanScreen() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [monumentData, setMonumentData] = useState<MonumentData | null>(null);
  const [view, setView] = useState<'camera' | 'preview' | 'results'>('camera');  const pickOrCaptureImage = async () => {
    try {
      // Check camera permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Camera permission is required to scan monuments');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.assets || !result.assets[0]?.uri) {
        throw new Error('Failed to capture image');
      }

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setView('preview');
        toast.success('Photo captured successfully');
      }
    } catch (error) {
      toast.error('Error capturing photo');
    }  };  const handleProcessImage = async () => {
    if (!capturedImage) {
      toast.error('No image captured');
      return;
    }

    setIsProcessing(true);
    try {
      // Create form data
      const formData = new FormData();
      
      // Get the file extension
      const imageUri = capturedImage;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Create the file object for form data
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      console.log('Sending image to:', 'https://backend-3nss.onrender.com/analyze');
      
      // Make request to backend for image analysis
      const response = await fetch('https://backend-3nss.onrender.com/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!data.labels || !Array.isArray(data.labels)) {
        throw new Error('Invalid response format from server');
      }

      // Process labels to identify monument features
      const labels = data.labels;
      
      // Find primary monument type
      const monumentType = labels.find(label => 
        label.toLowerCase().includes('temple') || 
        label.toLowerCase().includes('monument') ||
        label.toLowerCase().includes('architecture') ||
        label.toLowerCase().includes('historic') ||
        label.toLowerCase().includes('palace') ||
        label.toLowerCase().includes('fort')
      ) || 'Historic Monument';

      // Extract architectural features
      const architecturalFeatures = labels.filter(label =>
        label.toLowerCase().includes('arch') ||
        label.toLowerCase().includes('column') ||
        label.toLowerCase().includes('dome') ||
        label.toLowerCase().includes('wall') ||
        label.toLowerCase().includes('stone')
      );

      // Create monument data with detected features
      const monumentData: MonumentData = {
        name: monumentType,
        description: `A remarkable ${monumentType.toLowerCase()} featuring ${architecturalFeatures.slice(0, 3).join(', ').toLowerCase()}.`,
        history: 'This structure showcases significant architectural and historical importance in Indian heritage.',
        timings: '6:00 AM - 6:00 PM',
        accessibility: 'Open to public with guided tours available',
        funFacts: [
          `Features ${architecturalFeatures.length} distinct architectural elements`,
          'Represents traditional Indian architecture',
          `Identified as a ${monumentType.toLowerCase()}`
        ],
        imageUrl: capturedImage,
        architecturalStyle: architecturalFeatures.length > 0 ? 
          `Traditional with ${architecturalFeatures[0].toLowerCase()} elements` : 
          'Traditional Indian Architecture',
        period: 'Historical',
        inscriptions: labels.filter(l => 
          l.toLowerCase().includes('text') || 
          l.toLowerCase().includes('writing') ||
          l.toLowerCase().includes('inscription')
        ),
        nearbyAttractions: [
          {
            name: 'Heritage Site',
            distance: 'Nearby',
            type: 'Cultural'
          }
        ]
      };

      setMonumentData(monumentData);
      setView('results');
      toast.success('Monument analysis complete');    } catch (error: any) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      
      // Enhanced error handling with specific user feedback
      if (!navigator.onLine) {
        toast.error('No internet connection. Please check your network and try again.');
        return;
      }

      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('base64')) {
        toast.error('Unable to process the image. Please try taking another photo.');
        return;
      }

      if (errorMessage.includes('vision api')) {
        toast.error('Unable to analyze the monument right now. Please try again in a few moments.');
        return;
      }

      if (errorMessage.includes('no monument') || errorMessage.includes('no landmark')) {
        toast.error('No monument was detected. Please ensure the monument is clearly visible in the frame.');
        return;
      }

      if (errorMessage.includes('incomplete')) {
        toast.error('Could not get complete information about the monument. Please try another angle.');
        return;
      }

      if (errorMessage.includes('permissions')) {
        toast.error('Camera access is required. Please enable camera permissions and try again.');
        return;
      }

      // Generic error with more context
      console.error('Monument scanning error:', error);
      toast.error('Unable to analyze the monument. Please try again with a different photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToCamera = () => {
    setCapturedImage(null);
    setMonumentData(null);
    setView('camera');
  };

  const renderCamera = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Monument Scanner</Text>
        <Text style={styles.subHeaderText}>Position monument in frame</Text>
      </View>

      <TouchableOpacity 
        style={styles.cameraButton} 
        onPress={pickOrCaptureImage}
      >
        <View style={styles.uploadPlaceholder}>
          <MaterialIcons name="add-a-photo" size={40} color="#666" />
          <Text style={styles.uploadText}>Take Photo</Text>
          <Text style={styles.uploadSubtext}>Capture monument image</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetToCamera} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Preview Photo</Text>
      </View>

      <View style={styles.previewContainer}>
        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        )}
      </View>
      
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Analyzing monument...</Text>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={resetToCamera}
          >
            <MaterialIcons name="camera" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleProcessImage}
          >
            <MaterialIcons name="search" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Analyze Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );  const getWeatherRecommendation = (weatherData: any) => {
    const temp = weatherData.main.temp;
    const conditions = weatherData.weather[0].main.toLowerCase();
    
    if (temp > 30) return "It's quite hot - bring water and sun protection";
    if (temp < 15) return "It's cool - bring appropriate clothing";
    if (conditions.includes('rain')) return "Rainy conditions - bring an umbrella";
    return "Weather conditions are good for visiting";
  };

  const getBestTimeToVisit = (weatherData: any) => {
    const sunset = new Date(weatherData.sys.sunset * 1000);
    const sunrise = new Date(weatherData.sys.sunrise * 1000);
    const now = new Date();

    if (weatherData.main.temp > 25) {
      return "Early morning or evening recommended due to temperature";
    }
    return "Current conditions are good for visiting";
  };

  const renderResults = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetToCamera} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Monument Details</Text>
      </View>

      {monumentData && (
        <View style={styles.content}>
          <Image 
            source={{ uri: monumentData.imageUrl }} 
            style={styles.resultImage} 
          />

          <Text style={styles.title}>{monumentData.name}</Text>
          <Text style={styles.description}>{monumentData.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            <Text style={styles.sectionText}>{monumentData.history}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timings</Text>
            <Text style={styles.sectionText}>{monumentData.timings}</Text>
          </View>          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fun Facts</Text>
            {monumentData.funFacts.map((fact, index) => (
              <Text key={index} style={styles.fact}>• {fact}</Text>
            ))}
          </View>

          {monumentData.architecturalStyle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Architectural Style</Text>
              <Text style={styles.sectionText}>{monumentData.architecturalStyle}</Text>
            </View>
          )}

          {monumentData.inscriptions && monumentData.inscriptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Inscriptions</Text>
              {monumentData.inscriptions.map((inscription, index) => (
                <Text key={index} style={styles.inscriptionText}>{inscription}</Text>
              ))}
            </View>
          )}          {monumentData.nearbyAttractions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Attractions</Text>
              {monumentData.nearbyAttractions.map((attraction, index) => (
                <View key={index} style={styles.nearbyItem}>
                  <MaterialIcons name="location-on" size={20} color="#666" />
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName}>{attraction.name}</Text>
                    <Text style={styles.nearbyDistance}>{attraction.distance}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Information</Text>
            <View style={styles.visitInfo}>            <MaterialIcons name="wb-sunny" size={20} color="#666" />
            <Text style={styles.visitText}>{monumentData.weatherRecommendation}</Text>
          </View>
          <View style={styles.visitInfo}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.visitText}>{monumentData.bestTimeToVisit}</Text>
          </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, styles.scanButton]}
            onPress={resetToCamera}
          >
            <MaterialIcons name="camera" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Scan Another Monument</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {view === 'camera' && renderCamera()}
      {view === 'preview' && renderPreview()}
      {view === 'results' && renderResults()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  inscriptionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  nearbyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nearbyName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  nearbyDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  visitText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cameraButton: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  previewContainer: {
    flex: 1,
    margin: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  processingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  fact: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 8,
  },
  scanButton: {
    marginTop: 20,
  }
});