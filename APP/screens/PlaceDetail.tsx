import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationParams } from '../types/types';
import * as Location from 'expo-location';
import { toast } from 'sonner-native';

type PlaceDetailsRouteProp = RouteProp<NavigationParams, 'PlaceDetails'>;

const GOOGLE_API_KEY = '';

interface RouteInfo {
  distance: string;
  duration: string;
}

interface PlaceDetails {
  name: string;
  photos: string[];
  rating: number;
  vicinity: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text: string[];
  };
  reviews?: Array<{
    rating: number;
    text: string;
    author_name: string;
  }>;
  types: string[];
}

export default function PlaceDetails() {
  const navigation = useNavigation();
  const route = useRoute<PlaceDetailsRouteProp>();
  const { placeId, photo, name, vicinity, rating, types, coordinates } = route.params;

  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [routeInfo, setRouteInfo] = useState<{[key: string]: RouteInfo}>({});
  const [selectedMode, setSelectedMode] = useState('driving');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    fetchPlaceDetails();
    getCurrentLocation();
  }, []);

  const fetchPlaceDetails = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,opening_hours,reviews,photos,types,vicinity&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.result) {
        setPlaceDetails(data.result);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast.error('Failed to load place details');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      fetchRouteInfo(location);
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get current location');
    }
  };

  const fetchRouteInfo = async (userLoc: Location.LocationObject) => {
    try {
      const modes = ['driving', 'walking', 'bicycling', 'transit'];
      const routeData: {[key: string]: RouteInfo} = {};

      for (const mode of modes) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${userLoc.coords.latitude},${userLoc.coords.longitude}&destination=${coordinates.lat},${coordinates.lng}&mode=${mode}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          routeData[mode] = {
            distance: data.routes[0].legs[0].distance.text,
            duration: data.routes[0].legs[0].duration.text,
          };
        }
      }

      setRouteInfo(routeData);
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
      ios: `${scheme}?q=${name}&ll=${coordinates.lat},${coordinates.lng}`,
      android: `${scheme}${coordinates.lat},${coordinates.lng}?q=${name}`
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        toast.error('Unable to open maps');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image 
            source={{ uri: photo }} 
            style={styles.heroImage}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{rating}</Text>
            </View>
            <Text style={styles.location}>{vicinity}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {types.slice(0, 3).map((type, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>
                  {type.replace(/_/g, ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </View>
            ))}
          </View>

          {/* Route Information */}
          <View style={styles.routeCard}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Text style={styles.sectionTitle}>Getting There</Text>
                <Text style={styles.distanceText}>
                  Distance: {routeInfo[selectedMode]?.distance}
                </Text>
                
                <View style={styles.travelModes}>
                  {Object.entries(routeInfo).map(([mode, data]) => (
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

          {/* Place Details */}
          {placeDetails && (
            <>
              {placeDetails.opening_hours && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Opening Hours</Text>
                  {placeDetails.opening_hours.weekday_text.map((hours, index) => (
                    <Text key={index} style={styles.hoursText}>{hours}</Text>
                  ))}
                </View>
              )}

              {placeDetails.reviews && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Visitor Reviews</Text>
                  {placeDetails.reviews.slice(0, 3).map((review, index) => (
                    <View key={index} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color="#FFD700" />
                          <Text style={styles.reviewRating}>{review.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{review.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visitor Tips</Text>
                <View style={styles.tipsContainer}>
                  <View style={styles.tipItem}>
                    <Ionicons name="time" size={20} color="#666" />
                    <Text style={styles.tipText}>
                      Best to visit during off-peak hours to avoid crowds
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="sunny" size={20} color="#666" />
                    <Text style={styles.tipText}>
                      Check weather forecast before visiting
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="camera" size={20} color="#666" />
                    <Text style={styles.tipText}>
                      Great photo opportunities during golden hour
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
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
  header: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
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
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  routeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  distanceText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 15,
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
    marginTop: 10,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewRating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
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
});