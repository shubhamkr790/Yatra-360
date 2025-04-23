import React, { useState, useEffect } from 'react';
import { toast } from 'sonner-native';
import * as Location from 'expo-location';
import { supabase } from '../utils/supabase';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { localGuides } from '../data/mockData';
import GuideProfileModal from '../components/GuideProfileModal';
import { LocalGuide } from '../types/types';

export default function GuidesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<LocalGuide | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);
  const [filterExpertise, setFilterExpertise] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);  const [guides, setGuides] = useState<any[]>([]);

  useEffect(() => {
    fetchGuides();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
  };  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('guide_registrations')
        .select(`
          id,
          full_name,
          areas_of_expertise,
          spoken_languages,
          experience_years,
          hourly_rate,
          bio,
          profile_picture_url,
          rating,
          review_count,
          status
        `)
        .eq('status', 'approved')
        .order('rating', { ascending: false });      if (error) throw error;

      if (data) {
        setGuides(data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      toast.error('Failed to load guides');
    }
  };

  // Get unique languages and expertise areas for filters
  const languages = Array.from(new Set(localGuides.flatMap(guide => guide.languages)));
  const expertiseAreas = Array.from(new Set(localGuides.flatMap(guide => guide.expertise)));

  // Calculate distances and sort guides when user location changes
  useEffect(() => {
    if (userLocation) {
      const guidesWithDistance = localGuides.map(guide => {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          guide.location.latitude,
          guide.location.longitude
        );
        return { ...guide, distance };
      });
      
      guidesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setSortedGuides(guidesWithDistance);
    }
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };  const filteredGuides = guides.filter(guide => {
    const matchesSearch = 
      guide.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.areas_of_expertise.some((exp: string) => 
        exp.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Local Guides</Text>
        <Text style={styles.subtitle}>Connect with expert historians and guides</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides by name or expertise..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>        <FlatList
          data={filteredGuides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.guideCard}
              onPress={() => {
                setSelectedGuide(item);
                setShowGuideModal(true);
              }}
            >
              <View style={styles.guideInfo}>
                <View style={styles.guideHeader}>
                  <Text style={styles.guideName}>{item.full_name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{item.rating?.toFixed(1) || 'New'}</Text>
                    <Text style={styles.reviews}>
                      ({item.review_count || 0})
                    </Text>
                  </View>
                </View>

                <View style={styles.expertiseContainer}>
                  {item.areas_of_expertise.slice(0, 3).map((exp: string, index: number) => (
                    <View key={index} style={styles.expertiseTag}>
                      <Text style={styles.expertiseText}>{exp}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.languagesContainer}>
                  {item.spoken_languages.map((lang: string, index: number) => (
                    <View key={index} style={styles.languageTag}>
                      <Ionicons name="language" size={14} color="#666" />
                      <Text style={styles.languageText}>{lang}</Text>
                    </View>
                  ))}
                </View>

              <View style={styles.footer}>                <View style={[styles.availabilityBadge, styles.availableBadge]}>
                  <View style={[styles.statusDot, styles.availableDot]} />
                  <Text style={styles.availabilityText}>Available for Booking</Text>
                </View>
                <Text style={styles.rate}>₹{item.hourly_rate}/hr</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.guidesList}
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },  filtersContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 5,
  },  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.02 }],
  },
  filterText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  filterTextActive: {
    color: 'white',
  },
  guidesList: {
    padding: 15,
  },
  guideCard: {
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
  guideInfo: {
    padding: 15,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  expertiseTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expertiseText: {
    fontSize: 14,
    color: '#666',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
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
  rate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});