import React, { useState, useEffect, useCallback } from 'react';
import ChatUI from '../components/ChatUI';
import { toast } from 'sonner-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  useWindowDimensions,
  FlatList,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { heritageSites, localGuides } from '../data/mockData';
import { NavigationParams } from '../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GuideProfileModal from '../components/GuideProfileModal';

// Categories including guides
const categories = [
  { id: '1', name: 'All', icon: 'grid', type: '' },
  { id: '2', name: 'Historical', icon: 'business', type: 'tourist_attraction' },
  { id: '3', name: 'Religious', icon: 'people', type: 'place_of_worship' },
  { id: '4', name: 'Natural', icon: 'leaf', type: 'park' },
  { id: '5', name: 'Adventure', icon: 'bicycle', type: 'amusement_park' }
];

// Replace with your Google API key
const GOOGLE_API_KEY = '';

interface NearbyPlace {
  id: string;
  name: string;
  location: string;
  rating: number;
  photos: string[];
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

export default function HomeScreen() {  const navigation = useNavigation<NativeStackNavigationProp<NavigationParams>>();
  const { width } = useWindowDimensions();
  
  // State declarations
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);  const [showChat, setShowChat] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<LocalGuide | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'bn' | 'te' | 'ta' | 'kn' | 'ml' | 'gu' | 'mr' | 'pa'>('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);  const fetchNearbyPlaces = useCallback(async (latitude: number, longitude: number, type?: string) => {
    try {
      const radius = 5000; // 5km radius
      const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const url = `${baseUrl}?location=${latitude},${longitude}&radius=${radius}${type ? `&type=${type}` : ''}&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        const places = await Promise.all(data.results.map(async (place: any) => {
          let photoUrl = '';
          if (place.photos && place.photos[0]) {
            const photoReference = place.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
          }
          
          return {
            id: place.place_id,
            name: place.name,
            location: place.vicinity,
            rating: place.rating || 0,
            photos: [photoUrl],
            vicinity: place.vicinity,
            types: place.types,
            geometry: place.geometry
          };
        }));
        
        setNearbyPlaces(places);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      toast.error('Failed to fetch nearby places');
    }
  }, []);

  const searchGlobalPlaces = useCallback(async (query: string) => {
    if (query.length < 3) return; // Only search if query is 3+ characters

    try {
      const baseUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
      const url = `${baseUrl}?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        const places = await Promise.all(data.results.map(async (place: any) => {
          let photoUrl = '';
          if (place.photos && place.photos[0]) {
            const photoReference = place.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
          }
          
          return {
            id: place.place_id,
            name: place.name,
            location: place.formatted_address,
            rating: place.rating || 0,
            photos: [photoUrl],
            vicinity: place.formatted_address,
            types: place.types,
            geometry: place.geometry
          };
        }));
        
        setNearbyPlaces(places);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      toast.error('Failed to search places');
    }
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Fetch initial nearby places
      await fetchNearbyPlaces(
        location.coords.latitude,
        location.coords.longitude,
        selectedCategory !== 'All' ? categories.find(c => c.name === selectedCategory)?.type : undefined
      );
    })();
  }, [fetchNearbyPlaces]);

  // Fetch new places when category changes  // Add debounce for search
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchGlobalPlaces(searchQuery);
      } else if (userLocation && searchQuery.length === 0) {
        // If search is cleared, show nearby places
        fetchNearbyPlaces(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          selectedCategory !== 'All' ? categories.find(c => c.name === selectedCategory)?.type : undefined
        );
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, selectedCategory, userLocation, fetchNearbyPlaces, searchGlobalPlaces]);  const filteredPlaces = nearbyPlaces.filter(place => {    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.vicinity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.name ? '#007AFF' : '#666'} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.name && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons name={showMap ? "list" : "map"} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        style={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
      />

      {showMap ? (        <View style={styles.mapContainer}>          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Nearby Places</Text>
          </View>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation?.coords.latitude || 11.1271,
              longitude: userLocation?.coords.longitude || 78.6569,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >            {filteredPlaces.map((place) => (              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng
                }}
                title={place.name}
                description={place.vicinity}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.nearbyContainer}>
            <Text style={styles.sectionTitle}>Nearby Attractions</Text>            {filteredPlaces.map((place) => (              <TouchableOpacity 
                key={place.id}
                style={styles.nearbyCard}                onPress={() => {
                  navigation.navigate('PlaceDetails', {
                    placeId: place.id,
                    photo: place.photos[0],
                    name: place.name,
                    vicinity: place.vicinity,
                    rating: place.rating,
                    types: place.types,
                    coordinates: {
                      lat: place.geometry.location.lat,
                      lng: place.geometry.location.lng
                    }
                  });
                }}
              >
                <Image 
                  source={{ uri: place.photos[0] || 'https://via.placeholder.com/120' }}
                  style={styles.nearbyImage}
                />          <View style={styles.nearbyInfo}>
            <Text style={styles.nearbyName} numberOfLines={1}>{place.name}</Text>
            <View style={styles.nearbyDetails}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#666" style={{marginTop: 2}} />
                <Text style={styles.locationText} numberOfLines={2}>{place.vicinity}</Text>
              </View>
            </View>
                  <View style={styles.tagsContainer}>
                    {place.types.slice(0, 2).map((type, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>
                          {type.replace(/_/g, ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>      </ScrollView>      )}

      {/* Guide Profile Modal */}
      {selectedGuide && (
        <GuideProfileModal
          guide={selectedGuide}
          visible={showGuideModal}
          onClose={() => {
            setShowGuideModal(false);
            setSelectedGuide(null);
          }}
        />
      )}

      {/* Floating Chat Button */}
      <TouchableOpacity 
        style={styles.floatingChatButton}
        onPress={() => setShowChat(true)}
      >
        <Ionicons name="chatbubbles" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Modal */}
      {showChat && (
        <View style={styles.chatModal}>
          <View style={styles.chatHeader}>            <Text style={styles.chatHeaderTitle}>India Travel Guide AI</Text>
            <View style={styles.chatHeaderRight}>              <View>
                <TouchableOpacity 
                  style={styles.languageSelector}
                  onPress={() => setShowLanguageModal(!showLanguageModal)}
                >
                  <Text style={styles.selectedLanguage}>
                    {language === 'en' ? 'English' :
                     language === 'hi' ? 'हिंदी' :
                     language === 'bn' ? 'বাংলা' :
                     language === 'te' ? 'తెలుగు' :
                     language === 'ta' ? 'தமிழ்' :
                     language === 'kn' ? 'ಕನ್ನಡ' :
                     language === 'ml' ? 'മലയാളം' :
                     language === 'gu' ? 'ગુજરાતી' :
                     language === 'mr' ? 'मराठी' :
                     language === 'pa' ? 'ਪੰਜਾਬੀ' : 'English'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                {showLanguageModal && (
                  <View style={styles.languageModal}>
                    {[
                      { code: 'en', name: 'English' },
                      { code: 'hi', name: 'हिंदी' },
                      { code: 'bn', name: 'বাংলা' },
                      { code: 'te', name: 'తెలుగు' },
                      { code: 'ta', name: 'தமிழ்' },
                      { code: 'kn', name: 'ಕನ್ನಡ' },
                      { code: 'ml', name: 'മലയാളം' },
                      { code: 'gu', name: 'ગુજરાતી' },
                      { code: 'mr', name: 'मराठी' },
                      { code: 'pa', name: 'ਪੰਜਾਬੀ' }
                    ].map((lang) => (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.languageOption,
                          language === lang.code && styles.languageOptionSelected
                        ]}
                        onPress={() => {
                          setLanguage(lang.code);
                          setShowLanguageModal(false);
                        }}
                      >
                        <Text style={[
                          styles.languageOptionText,
                          language === lang.code && styles.languageOptionTextSelected
                        ]}>
                          {lang.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chatContent}>
            <ChatUI language={language} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guidesContainer: {
    padding: 20,
  },
  guidesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  guideCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  guidePhoto: {
    width: '100%',
    height: 150,
  },
  guideInfo: {
    padding: 15,
  },
  guideName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  guideStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  expertiseTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertiseText: {
    fontSize: 12,
    color: '#666',
  },
  guideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  availableBadge: {
    backgroundColor: '#4CAF5020',
  },
  busyBadge: {
    backgroundColor: '#FFA50020',
  },
  offlineBadge: {
    backgroundColor: '#99999920',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availableDot: {
    backgroundColor: '#4CAF50',
  },
  busyDot: {
    backgroundColor: '#FFA500',
  },
  offlineDot: {
    backgroundColor: '#999',
  },
  availabilityText: {
    fontSize: 12,
    color: '#666',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  floatingChatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },  chatModal: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 320,
    height: 480,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 5,
    zIndex: 1001,
  },
  languageModal: {
    position: 'absolute',
    top: '100%',
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginTop: 5,
    width: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  languageOptionSelected: {
    backgroundColor: '#007AFF20',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  languageOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedLanguage: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  chatContent: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },  mapButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },  categoriesList: {
    paddingHorizontal: 10,
    marginBottom: 8,
    maxHeight: 40,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#007AFF20',
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#007AFF',
  },  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },  mapHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  nearbyContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  nearbyCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  nearbyImage: {
    width: 120,
    height: 120,
  },
  nearbyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  nearbyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  nearbyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#666',
    fontSize: 14,
  },  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
  },  locationText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
    numberOfLines: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  toursContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  toursScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tourCard: {
    width: 200,
    height: 250,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  tourName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tourBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  tourBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});