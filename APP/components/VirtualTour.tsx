import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { toast } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';
import { HeritageSite } from '../types/types';

interface VirtualTourProps {
  site: HeritageSite;
  onClose: () => void;
}

export default function VirtualTour({ site, onClose }: VirtualTourProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Lock to landscape orientation when component mounts
    async function lockOrientation() {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (error) {
        console.error('Failed to lock orientation:', error);
      }
    }
    lockOrientation();

    // Reset orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>Failed to load virtual tour</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: site.panoramaUrl }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
              toast.error('Failed to load virtual tour');
            }}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="always"
            onShouldStartLoadWithRequest={(request) => {
              return request.url.includes('ttdconline.com');
            }}
          />
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading Virtual Tour...</Text>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.highlightsContainer}>
          {site.tourHighlights.map((highlight) => (
            <TouchableOpacity 
              key={highlight.id}
              style={styles.highlightButton}
            >
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#1a1a1a',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  highlightsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: 20,
  },
  highlightButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  highlightTitle: {
    color: 'white',
    fontSize: 14,
  },
});