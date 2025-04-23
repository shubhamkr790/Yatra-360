import React, { useState, useEffect } from 'react';
import { toast } from 'sonner-native';
import ChatUI from '../components/ChatUI';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationParams } from '../types/types';
import { heritageSites } from '../data/mockData';
import VirtualTour from '../components/VirtualTour';
import * as Location from 'expo-location';

type SiteDetailsRouteProp = RouteProp<NavigationParams, 'SiteDetails'>;

export default function SiteDetails() {
  const navigation = useNavigation();
  const route = useRoute<SiteDetailsRouteProp>();
  const { width } = useWindowDimensions();  const [showTour, setShowTour] = useState(false);
  const [showChat, setShowChat] = useState(false);  const [language, setLanguage] = useState<'en' | 'ta' | 'kn'>('en');
  
  useEffect(() => {
    if (route.params?.startTourImmediately) {
      setShowTour(true);
    }
  }, [route.params]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [routes, setRoutes] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('driving');  const site = heritageSites.find(s => s.id === route.params?.siteId);
  
  if (!site) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Site not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const GOOGLE_API_KEY = '';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        fetchRouteInfo(location, site!);
      }
    })();
  }, []);

  const fetchRouteInfo = async (userLoc: Location.LocationObject, site: any) => {
    try {
      const modes = ['driving', 'walking', 'bicycling', 'transit'];
      const routeData: any = {};

      for (const mode of modes) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${userLoc.coords.latitude},${userLoc.coords.longitude}&destination=${site.coordinates.latitude},${site.coordinates.longitude}&mode=${mode}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          routeData[mode] = {
            distance: data.routes[0].legs[0].distance.text,
            duration: data.routes[0].legs[0].duration.text,
          };
        }
      }

      setRoutes(routeData);
      setDistance(routeData.driving.distance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching route info:', error);
      setLoading(false);
    }
  };

  const openMapsApp = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:'
    });
    const url = Platform.select({
      ios: `${scheme}?q=${site?.name}&ll=${site?.coordinates.latitude},${site?.coordinates.longitude}`,
      android: `${scheme}${site?.coordinates.latitude},${site?.coordinates.longitude}?q=${site?.name}`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (!site) {
    return null;
  }  if (showTour && site) {
    return (
      <View style={{ flex: 1 }}>
        <VirtualTour site={site} onClose={() => {
          setShowTour(false);
          // Ensure we're only showing one instance
          navigation.setParams({ startTourImmediately: false });
        }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={{ uri: site.imageUrl }} 
            style={[styles.heroImage, { width }]}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{site.name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{site.rating}</Text>
            </View>
            <Text style={styles.location}>{site.location}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {site.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About</Text>          <View style={styles.locationCard}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Text style={styles.distanceText}>Distance: {distance}</Text>
                <View style={styles.travelModes}>
                  {Object.entries(routes).map(([mode, data]: [string, any]) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.modeButton,
                        selectedMode === mode && styles.selectedMode
                      ]}
                      onPress={() => setSelectedMode(mode)}
                    >
                      <Ionicons 
                        name={
                          mode === 'driving' ? 'car' :
                          mode === 'walking' ? 'walk' :
                          mode === 'bicycling' ? 'bicycle' : 'bus'
                        } 
                        size={20} 
                        color={selectedMode === mode ? '#007AFF' : '#666'} 
                      />
                      <Text style={[
                        styles.modeTime,
                        selectedMode === mode && styles.selectedModeText
                      ]}>
                        {data.duration}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity 
                  style={styles.navigationButton}
                  onPress={openMapsApp}
                >
                  <Ionicons name="navigate" size={20} color="white" />
                  <Text style={styles.navigationButtonText}>Open in Maps</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{site.description}</Text>
          
          <Text style={styles.sectionTitle}>Historical Period</Text>
          <Text style={styles.periodText}>{site.period}</Text>

          <Text style={styles.sectionTitle}>Visitor Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.tipText}>Best time to visit: Early morning or late afternoon</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="camera" size={20} color="#666" />
              <Text style={styles.tipText}>Photography is allowed in most areas</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="footsteps" size={20} color="#666" />
              <Text style={styles.tipText}>Wear comfortable walking shoes</Text>
            </View>
          </View>          <TouchableOpacity 
            style={styles.tourButton}
            onPress={() => setShowTour(true)}
          >
            <Ionicons name="videocam" size={24} color="white" />
            <Text style={styles.tourButtonText}>Start Virtual Tour</Text>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="people" size={24} color="#666" />
              <Text style={styles.statNumber}>
                {site.visitCount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Visitors</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="location" size={24} color="#666" />
              <Text style={styles.statNumber}>
                {site.tourHighlights.length}
              </Text>
              <Text style={styles.statLabel}>Highlights</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  travelModes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedMode: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  modeTime: {
    fontSize: 14,
    color: '#666',
  },
  selectedModeText: {
    color: '#007AFF',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'relative',
  },
  heroImage: {
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#666',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  periodText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  tourButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  tourButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});