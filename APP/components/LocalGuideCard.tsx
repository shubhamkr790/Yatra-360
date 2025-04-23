import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalGuide } from '../types/types';

interface LocalGuideCardProps {
  guide: LocalGuide;
  onPress: (guide: LocalGuide) => void;
}

export default function LocalGuideCard({ guide, onPress }: LocalGuideCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(guide)}
    >      <Image 
        source={{          uri: guide.profile_picture_url || 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg'
        }} 
        style={styles.photo}        
        defaultSource={{ uri: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg' }}
      />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{guide.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{guide.rating}</Text>
            <Text style={styles.reviews}>({guide.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {guide.languages.slice(0, 2).map((lang, index) => (
            <View key={index} style={styles.badge}>
              <Ionicons name="language" size={12} color="#666" />
              <Text style={styles.badgeText}>{lang}</Text>
            </View>
          ))}
          <View style={styles.badge}>
            <Ionicons name="time" size={12} color="#666" />
            <Text style={styles.badgeText}>{guide.yearsOfExperience}+ yrs</Text>
          </View>
        </View>

        <View style={styles.specialties}>
          {guide.specialties.slice(0, 2).map((specialty, index) => (
            <Text key={index} style={styles.specialty}>• {specialty}</Text>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.rate}>₹{guide.hourlyRate}/hour</Text>
          <View style={[styles.status, guide.availability ? styles.available : styles.unavailable]}>
            <Text style={styles.statusText}>
              {guide.availability ? 'Available Now' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
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
    color: '#1a1a1a',
    fontWeight: '500',
  },
  reviews: {
    fontSize: 12,
    color: '#666',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
  },
  specialties: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#34C75920',
  },
  unavailable: {
    backgroundColor: '#FF3B3020',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});