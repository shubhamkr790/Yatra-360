import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { heritageSites } from '../data/mockData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationParams, HeritageSite } from '../types/types';
import { toast } from 'sonner-native';

export default function VirtualToursScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<NavigationParams>>();  const handleTourPress = (site: HeritageSite) => {
    navigation.navigate('SiteDetails', {
      siteId: site.id,
      startTourImmediately: false
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Tours</Text>
        <Text style={styles.subtitle}>Experience heritage sites in 360°</Text>
      </View>

      <ScrollView style={styles.content}>
        {heritageSites.map((site) => (
          <TouchableOpacity 
            key={site.id}
            style={styles.tourCard}            onPress={() => handleTourPress(site)}
          >
            <Image source={{ uri: site.imageUrl }} style={styles.tourImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.tourGradient}
            >
              <View style={styles.tourInfo}>
                <Text style={styles.tourName}>{site.name}</Text>
                <Text style={styles.tourLocation}>{site.location}</Text>
                
                <View style={styles.tourStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.statText}>{site.rating}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="eye" size={16} color="#fff" />
                    <Text style={styles.statText}>
                      {site.visitCount.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.tourBadge}>
                  <Ionicons name="videocam" size={14} color="white" />
                  <Text style={styles.tourBadgeText}>360° Tour</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  content: {
    padding: 20,
  },
  tourCard: {
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
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
    height: '70%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  tourInfo: {
    gap: 5,
  },
  tourName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  tourLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  tourStats: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: 'white',
    fontSize: 14,
  },
  tourBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  tourBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});