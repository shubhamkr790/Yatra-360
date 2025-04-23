import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeritageSite } from '../types/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatUIProps {
  site?: HeritageSite;
  language?: string;
}

export default function ChatUI({ site, language = 'en' }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',      text: site 
        ? `Hello! I'm your AI guide for ${site.name}. Feel free to ask me any questions about the history, architecture, or cultural significance of this site.`
        : `Hello! I'm your AI tourism guide for India. Feel free to ask me any questions about India's heritage sites, cultural attractions, historical monuments, or travel tips from any state.`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);  const API_KEY = "API_KEY";
  
  const generateSystemMessage = () => {
    const languageInstructions = {
      'en': 'You must respond only in English.',
      'hi': 'आपको केवल हिंदी में जवाब देना है। अंग्रेजी या किसी अन्य भाषा का प्रयोग न करें।',
      'bn': 'আপনাকে শুধুমাত্র বাংলায় উত্তর দিতে হবে। ইংরেজি বা অন্য কোন ভাষা ব্যবহার করবেন না।',
      'te': 'మీరు తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి. ఇంగ్లీష్ లేదా ఇతర భాషలను ఉపయోగించవద్దు.',
      'ta': 'நீங்கள் தமிழில் மட்டுமே பதிலளிக்க வேண்டும். ஆங்கிலம் அல்லது வேறு மொழிகளைப் பயன்படுத்த வேண்டாம்.',
      'kn': 'ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಬೇಕು. ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಇತರ ಭಾಷೆಗಳನ್ನು ಬಳಸಬೇಡಿ.',
      'ml': 'നിങ്ങൾ മലയാളത്തിൽ മാത്രം മറുപടി നൽകണം. ഇംഗ്ലീഷോ മറ്റ് ഭാഷകളോ ഉപയോഗിക്കരുത്.',
      'gu': 'તમારે માત્ર ગુજરાતીમાં જ જવાબ આપવાનો છે. અંગ્રેજી કે અન્ય ભાષાનો ઉપયોગ કરશો નહીં.',
      'mr': 'तुम्ही फक्त मराठीत उत्तर द्यायचे आहे. इंग्रजी किंवा इतर भाषांचा वापर करू नका.',
      'pa': 'ਤੁਹਾਨੂੰ ਸਿਰਫ਼ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦੇਣਾ ਹੈ। ਅੰਗਰੇਜ਼ੀ ਜਾਂ ਹੋਰ ਭਾਸ਼ਾਵਾਂ ਦੀ ਵਰਤੋਂ ਨਾ ਕਰੋ।'
    };

    return `You are a knowledgeable Indian tourism guide and historian with expertise in all states and regions of India. 
    ${site ? `You are currently discussing ${site.name} located in ${site.location}.` : 'You can provide information about any tourist destination, heritage site, or cultural attraction across India - from the Himalayas to Kerala, from Gujarat to the Northeast.'} 
    ${languageInstructions[language]}
    CRITICAL: DO NOT mix languages or provide translations. Respond STRICTLY in the specified language only.
    Maintain formal and respectful tone appropriate for the selected language.`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);      try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Create chat history context
      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: m.text
      }));

      // Start chat
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Send message and get response
      const result = await chat.sendMessage(inputText);
      const response = await result.response;
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text(),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View 
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userMessageText : styles.botMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.timestamp,
              message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
            ]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}  placeholder={
    language === 'en' ? "Ask a question..." : 
    language === 'hi' ? "प्रश्न पूछें..." :
    language === 'bn' ? "প্রশ্ন জিজ্ঞাসা করুন..." :
    language === 'te' ? "ప్రశ్న అడగండి..." :
    language === 'ta' ? "கேள்வி கேளுங்கள்..." :
    language === 'kn' ? "ಪ್ರಶ್ನೆ ಕೇಳಿ..." :
    language === 'ml' ? "ചോദിക്കൂ..." :
    language === 'gu' ? "પ્રશ્ન પૂછો..." :
    language === 'mr' ? "प्रश्न विचारा..." :
    language === 'pa' ? "ਸਵਾਲ ਪੁੱਛੋ..." :
    "Ask a question..."
  }
          placeholderTextColor="#666"
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={inputText.trim() ? "#007AFF" : "#999"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    marginLeft: '20%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    marginRight: '20%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  botTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
});