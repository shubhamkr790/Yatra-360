import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  TextInput,
  Platform
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LocalGuide } from '../types/types';
import { toast } from 'sonner-native';

interface GuideProfileModalProps {
  guide: LocalGuide;
  visible: boolean;
  onClose: () => void;
}

export default function GuideProfileModal({ guide, visible, onClose }: GuideProfileModalProps) {  const [showBooking, setShowBooking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m interested in booking a tour.',
      senderId: 'tourist',
      receiverId: guide.id,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: true
    },
    {
      id: '2',
      text: 'Hi! I\'d be happy to help. What dates are you looking at?',
      senderId: guide.id,
      receiverId: 'tourist',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      read: true
    }
  ]);  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState<Date>(new Date());
  const [dateString, setDateString] = useState(new Date().toLocaleDateString());
  const [timeString, setTimeString] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [duration, setDuration] = useState('2');
  const [notes, setNotes] = useState('');  const handleBooking = () => {
    const now = new Date();
    if (date < now) {
      toast.error('Please select a future date');
      return;
    }

    const bookingTime = new Date(date);
    bookingTime.setHours(time.getHours(), time.getMinutes());

    if (bookingTime < now) {
      toast.error('Please select a future time');
      return;
    }

    // In a real app, this would make an API call to book the guide
    toast.success('Booking request sent successfully!');
    setShowBooking(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Guide Profile */}
          <View style={styles.profile}>            <Image              source={{ 
                uri: guide.profile_picture_url || 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg'
              }} 
              style={styles.photo}              
              defaultSource={{ uri: 'https://rldrqubkpaxnxvlktlef.supabase.co/storage/v1/object/public/profile//307ce493-b254-4b2d-8ba4-d12c080d6651.jpg' }}
            />
            <Text style={styles.name}>{guide.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{guide.rating}</Text>
              <Text style={styles.reviews}>({guide.reviews} reviews)</Text>
            </View>

            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.badgeText}>{guide.yearsOfExperience}+ years exp.</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="cash" size={16} color="#666" />
                <Text style={styles.badgeText}>₹{guide.hourlyRate}/hour</Text>
              </View>
            </View>
          </View>

          {!showBooking ? (
            <>
              {/* About Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bio}>{guide.bio}</Text>
              </View>

              {/* Expertise */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expertise</Text>
                <View style={styles.tagsContainer}>            {(guide.areas_of_expertise || []).map((exp, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{exp}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Languages */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <View style={styles.tagsContainer}>            {(guide.spoken_languages || []).map((lang, index) => (
                    <View key={index} style={styles.tag}>
                      <Ionicons name="language" size={14} color="#666" />
                      <Text style={styles.tagText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Certifications */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Certifications</Text>              {(guide.certifications || []).map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>              {/* Action Buttons */}              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => setShowBooking(true)}
                >
                  <Ionicons name="calendar-outline" size={24} color="white" />
                  <Text style={styles.bookButtonText}>Book Guide</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => setShowChat(true)}
                >
                  <View style={styles.chatButtonInner}>
                    <Ionicons name="chatbubbles-outline" size={24} color="#007AFF" />
                    <Text style={styles.chatButtonText}>Message Guide</Text>
                  </View>
                  <View style={styles.onlineIndicator}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                </TouchableOpacity>
              </View>





              {/* Chat Interface */}
              {showChat && (
                <View style={styles.chatContainer}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatHeaderText}>Chat with {guide.name}</Text>
                    <TouchableOpacity onPress={() => setShowChat(false)}>
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.chatMessages}>
                    {chatHistory.map((msg) => (
                      <View 
                        key={msg.id}
                        style={[
                          styles.messageContainer,
                          msg.senderId === 'tourist' ? styles.sentMessage : styles.receivedMessage
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          msg.senderId === 'tourist' ? styles.sentMessageText : styles.receivedMessageText
                        ]}>
                          {msg.text}
                        </Text>
                        <Text style={styles.messageTime}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.chatInputContainer}>
                    <TextInput
                      style={styles.chatInput}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Type a message..."
                      multiline
                    />
                    <TouchableOpacity 
                      style={styles.sendButton}
                      onPress={() => {
                        if (!message.trim()) return;
                        const newMessage: ChatMessage = {
                          id: Date.now().toString(),
                          text: message.trim(),
                          senderId: 'tourist',
                          receiverId: guide.id,
                          timestamp: new Date(),
                          read: false
                        };
                        setChatHistory([...chatHistory, newMessage]);
                        setMessage('');
                        // Simulate guide response after 1 second
                        setTimeout(() => {
                          const response: ChatMessage = {
                            id: (Date.now() + 1).toString(),                            text: `Thank you for your message! I'll get back to you shortly.`,
                            senderId: guide.id,
                            receiverId: 'tourist',
                            timestamp: new Date(),
                            read: false
                          };
                          setChatHistory(prev => [...prev, response]);
                        }, 1000);
                      }}
                    >
                      <Ionicons name="send" size={24} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            /* Booking Form */
            <View style={styles.bookingForm}>
              <Text style={styles.sectionTitle}>Book {guide.name}</Text>              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>                <TextInput
                  style={styles.input}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="Select date (MM/DD/YYYY)"
                  placeholderTextColor="#666"
                />                <TouchableOpacity 
                  style={styles.dateButton}                  onPress={() => {
                    if (Platform.OS === 'web') {
                      // For web, just toggle the native date input through the style
                      setShowDatePicker(true);
                    } else {
                      setShowDatePicker(true);
                    }
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {date.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>




              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {time.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Ionicons name="time" size={20} color="#666" />
                </TouchableOpacity>                <TextInput
                  style={styles.input}
                  value={selectedTime}
                  onChangeText={setSelectedTime}
                  placeholder="Select time (HH:MM)"
                  placeholderTextColor="#666"
                />                <TouchableOpacity 
                  style={styles.dateButton}                  onPress={() => {
                    if (Platform.OS === 'web') {
                      // For web, just toggle the native time input through the style
                      setShowTimePicker(true);
                    } else {
                      setShowTimePicker(true);
                    }
                  }}
                >
                  <Text style={styles.dateButtonText}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (hours)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any special requests?"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Estimate:</Text>
                <Text style={styles.totalAmount}>
                  ₹{(parseFloat(duration) * guide.hourlyRate).toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleBooking}
              >
                <Text style={styles.submitButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({  actionButtons: {
    flexDirection: 'column',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 10,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    gap: 10,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  chatContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 400,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatMessages: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 10,
    padding: 12,
    borderRadius: 15,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  profile: {
    alignItems: 'center',
    padding: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  badgeText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  certificationText: {
    fontSize: 14,
    color: '#444',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bookingForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
    fontWeight: '500',
  },  dateButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
