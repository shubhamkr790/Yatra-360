export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
    read: boolean;
  }
  
  export interface ChatThread {
    id: string;
    participants: string[];
    lastMessage?: ChatMessage;
    unreadCount: number;
  }
  
  export interface LocalGuide {
    id: string;
    name: string;
    photo: string;
    rating: number;
    reviews: number;
    languages: string[];
    expertise: string[];
    hourlyRate: number;
    yearsOfExperience: number;
    certifications: string[];
    availability: {
      status: 'available' | 'busy' | 'offline';
      nextAvailable?: string;
    };
    location: {
      latitude: number;
      longitude: number;
    };
    bio: string;
  }
  
  export interface TourHighlight {
    id: string;
    title: string;
    description: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
  }
  
  export interface HeritageSite {
    id: string;
    name: string;
    location: string;
    region: string;
    description: string;
    period: string;
    imageUrl: string;
    panoramaUrl: string;
    rating: number;
    visitCount: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    tags: string[];
    audioNarration: string;
    tourHighlights: TourHighlight[];
  }
  
  export interface Region {
    id: string;
    name: string;
    imageUrl: string;
    siteCount: number;
  }
  
  export type NavigationParams = {
    Explore: undefined;
    ExploreHome: undefined;  SiteDetails: { 
      siteId: string;
      startTourImmediately?: boolean;
    };
    VirtualTour: { siteId: string };
    PlaceDetails: { 
      placeId: string;
      photo: string;
      name: string;
      vicinity: string;
      rating: number;
      types: string[];
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    'Virtual Tours': undefined;
    Profile: undefined;
  };