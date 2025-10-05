import AudioRecorderButton from "@/components/record-button";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://ringapp-backend-production.up.railway.app";

const scenarios = [
  {
    title: "🧟 Zombie Apocalypse Survival",
    context: "You're trapped in a mall during a zombie outbreak. You need to communicate with other survivors.",
    aiLines: [
       "I hear them getting closer. Do you have any weapons or supplies?",
      "There's an exit through the back. Should we make a run for it now?"
    ]
  },
  {
    title: "✈️ Airport Check-in Emergency", 
    context: "Your flight is delayed and you need to rebook. The counter agent is helping you.",
    aiLines: [
      "I'm sorry, but your flight has been cancelled due to weather. Let me help you find alternatives.",
      "We have a flight tomorrow morning at 8 AM, or tonight at 11 PM. Which would you prefer?",
      "I can offer you a hotel voucher for tonight. Will you need transportation as well?"
    ]
  },
  {
    title: "🍕 Pizza Order Mix-up",
    context: "You ordered pizza but got the wrong order. You're calling to resolve the issue.",
    aiLines: [
      "Hello, this is Mario's Pizza. How can I help you today?",
      "Oh no! I'm so sorry about the mix-up. Can you tell me what you ordered originally?",
      "I'll send the correct pizza right away and you can keep the wrong one. Sound good?"
    ]
  },
  {
    title: "🏨 Hotel Room Issue",
    context: "The hotel front desk is calling you about a complaint regarding your room (dripping faucet, broken AC, or loud neighbors). You need to describe the issue and work with them to find a solution.",
    aiLines: [
      "Good evening, this is the front desk manager. We received a complaint about your room. Can you tell me what's happening?",
      "I sincerely apologize for the inconvenience. Let me see what we can do to resolve this immediately.",
      "I can offer you a room upgrade or have maintenance fix the issue right away. What would you prefer?"
    ]
  },
  {
    title: "💼 Unexpected Job Interview Call",
    context: "A recruiter is calling you unexpectedly for a surprise phone interview about a new position. You need to show confidence and highlight your experience clearly.",
    aiLines: [
      "Hi, this is Sarah from TechCorp. I hope I'm not catching you at a bad time - do you have 10 minutes for a quick interview?",
      "Great! Can you tell me about your most significant professional achievement in your current role?",
      "That's impressive. How do you handle working under pressure and tight deadlines?"
    ]
  },
  {
    title: "🎒 Lost Luggage at the Airport",
    context: "A baggage claim agent is calling you to discuss your missing luggage after your flight arrival. You need to describe your bag and arrange for delivery or pickup.",
    aiLines: [
      "Hello, this is Delta baggage services calling about your missing luggage from flight 1205. Can you describe your bag for me?",
      "Thank you for those details. Can you tell me what items were inside so we can verify when we locate it?",
      "Perfect. We should have it located within 24 hours. Would you prefer delivery to your hotel or pickup at the airport?"
    ]
  },
  {
    title: "🩺 Doctor Follow-Up Appointment",
    context: "Your doctor is calling to discuss your recent test results and next steps. You need to understand the results and ask any clarifying questions about your health.",
    aiLines: [
      "Hi, this is Dr. Smith calling about your recent test results. Do you have a few minutes to discuss them?",
      "Your blood work came back mostly normal, but there are a couple of things I'd like to go over with you.",
      "I'd like to schedule a follow-up appointment to monitor this. Do you have any questions about what we've discussed?"
    ]
  },
];

export default function CallScreen() {
  const router = useRouter();
  const [convID, setConvID] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [callEnded, setCallEnded] = useState(false); // Track if call was ended by user
  const [isLoading, setIsLoading] = useState(false);
  const [user_transcript, setUserTranscript] = useState("");
  const [ai_transcript, setAITranscript] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [ringtoneSound, setRingtoneSound] = useState<Audio.Sound | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userTranscriptHistory, setUserTranscriptHistory] = useState<string[]>([]);
  const [aiTranscriptHistory, setAiTranscriptHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [conversationTurns, setConversationTurns] = useState(0);
  const [maxTurns] = useState(5);
  const [isScenarioVisible, setIsScenarioVisible] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const selectedScenario = useMemo(() => {
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }, []);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;

    if (!isConnected) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
    }

    return () => {
      animation?.stop();
    };
  }, [isConnected, pulseAnim]);

  useEffect(() => {
    let timer: number;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  // Ringtone effect - plays while not connected (but only for incoming calls, not ended calls)
  useEffect(() => {
    const handleRingtone = async () => {
      if (!isConnected && !ringtoneSound && !callEnded) {
        try {
          console.log('Starting ringtone for incoming call...');
          
          // Set audio mode for ringtone playback
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
          });
          
          const { sound: newRingtone } = await Audio.Sound.createAsync(
            require('../assets/ringtone.mp3'),
            { 
              isLooping: true,
              volume: 1,
              shouldPlay: false
            }
          );
          
          setRingtoneSound(newRingtone);
          await newRingtone.playAsync();
          
        } catch (error) {
          console.error('Error playing ringtone:', error);
        }
        
      } else if ((isConnected || callEnded) && ringtoneSound) {
        try {
          console.log('Stopping ringtone...');
          
          // Check if the sound is still loaded before trying to stop it
          const status = await ringtoneSound.getStatusAsync();
          if (status.isLoaded) {
            await ringtoneSound.stopAsync();
            await ringtoneSound.unloadAsync();
          }
          setRingtoneSound(null);
          
        } catch (error) {
          console.warn('Error stopping ringtone (this is usually harmless):', error);
          // Still set ringtoneSound to null even if there was an error
          setRingtoneSound(null);
        }
      }
    };

    handleRingtone();

    // Cleanup function
    return () => {
      if (ringtoneSound) {
        // Use a safer cleanup that doesn't throw errors
        ringtoneSound.getStatusAsync().then((status) => {
          if (status.isLoaded) {
            ringtoneSound.stopAsync().catch(() => {}); // Ignore errors
            ringtoneSound.unloadAsync().catch(() => {}); // Ignore errors
          }
        }).catch(() => {}); // Ignore status check errors too
        setRingtoneSound(null);
      }
    };
  }, [isConnected, ringtoneSound, callEnded]);

  // Cleanup effect - runs when component unmounts
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up audio...');
      // Stop all audio when component unmounts with error handling
      if (ringtoneSound) {
        ringtoneSound.getStatusAsync().then((status) => {
          if (status.isLoaded) {
            ringtoneSound.stopAsync().catch(() => {});
            ringtoneSound.unloadAsync().catch(() => {});
          }
        }).catch(() => {});
      }
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  const headerScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playBase64Audio = async (base64String: string) => {
    try {
      console.log('Starting audio playback...');
      
      // Create a data URI from the base64 string
      // Assuming the backend returns MP3 format - adjust if needed
      const audioUri = `data:audio/mp3;base64,${base64String}`;
      
      console.log('Created audio data URI');
      
      // Load and play the audio using expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      console.log('Audio playing successfully');
      
      // Set up playback status update to handle cleanup
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Audio playback finished, cleaning up...');
          sound.unloadAsync();
        }
      });
      
      return sound;
      
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  const startCall = async () => {
    try {
      setIsLoading(true);
      setCallEnded(false); // Reset call ended state for new call
      setConversationTurns(0); // Reset turn counter for new call
      
      // Reset progress animation for new call
      progressAnim.setValue(0);
      
      const user_id = "68e1891a053b036af73ed31d"; 
      const scenario = selectedScenario.title;
      const response = await fetch(`${BACKEND_URL}/start_call`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, scenario})
      });
      if (!response.ok) {
        throw new Error("Failed to start call");
      }

      const data = await response.json();
      setConvID(data.conversation_id);
      console.log("Conversation ID:", data.conversation_id);

      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
        // Start with AI speaking
        setIsAiSpeaking(true);
        setTimeout(() => {
          const firstMessage = data.initial_ai_text;
          setAiTranscriptHistory([firstMessage]);
          playBase64Audio(data.initial_ai_audio_b64); // Play initial AI line audio
          setIsAiSpeaking(false);
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error starting call:", error);
      setIsLoading(false);
    }
  };

  const endCall = async () => {
    if (!hasSpoken) {
      router.push("/");
      return;
    }
    if (isEndingCall) return; // Prevent multiple clicks
    
    setIsEndingCall(true);
    console.log('Ending call...');
    
    // Always end call locally first to ensure UI responds
    setCallEnded(true);
    setIsConnected(false);
    
    try {
      // Check if we have a conversation ID
      if (!convID) {
        console.warn('No conversation ID available, ending call locally only');
        // Navigate to home instead of feedback if no convID
        router.push("/");
        return;
      }

      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // send convID to backend to get feedback data
      const response = await fetch(`${BACKEND_URL}/end_call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conv_id: convID }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("Backend error ending call:", response.status, response.statusText);
        // Still end call locally and navigate to home
        router.push("/");
        return;
      }

      // Try to parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing end call response:", parseError);
        // End call locally and navigate to home
        router.push("/");
        return;
      }

      console.log("Call ended successfully, navigating to feedback");
      
      // Navigate to feedback with data
      router.push({
        pathname: "/feedback",
        params: {
          feedbackData: JSON.stringify(data),
          scenario: selectedScenario.title,
          duration: callDuration.toString()
        }
      });
      
    } catch (error) {
      console.error("Error ending call:", error);
      
      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('End call request timed out');
      }
      
      // Always ensure user can exit the call
      // Navigate to home as fallback
      router.push("/");
    } finally {
      setIsEndingCall(false);
    }
  };

  const handleRecordingComplete = async (uri: string) => {
    if (!convID) {
      console.warn("No conversation ID available.")
      return;
    }

    setHasSpoken(true);
    setIsListening(true);

    // Upload to backend
    const formData = new FormData();
    formData.append("conv_id", convID)
    formData.append('audio', { uri, name: 'recording.m4a', type: 'audio/m4a' } as any);

    const response = await fetch(`${BACKEND_URL}/process_audio`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = await response.json();
    
    setUserTranscript(data.user_text);
    setUserTranscriptHistory(prev => [...prev, data.user_text]);
    
    // Increment conversation turns after user speaks
    const newTurnCount = conversationTurns + 1;
    setConversationTurns(newTurnCount);

    // Check if we've reached max turns - if so, end call after user's message
    if (newTurnCount >= maxTurns) {
      console.log(`Reached maximum turns (${maxTurns}), ending call after user message...`);
      setIsListening(false);
      // Small delay to show user's message, then end call
      setTimeout(() => {
        endCall();
      }, 1500);
      return; // Don't process AI response
    }
    
    // Only get AI response if we haven't reached max turns
    setAITranscript(data.ai_text);
    setAiTranscriptHistory(prev => [...prev, data.ai_text]);
      
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: newTurnCount / maxTurns,
      duration: 800,
      useNativeDriver: false,
    }).start();
    
    // console.log(data);
    var ai_b64 = data.ai_audio_b64;

    setIsListening(false);

    if (!ai_b64) {
      console.error("AI audio base64 not found in response");
      return;
    }

    // Play returned audio
    try {
      console.log("Playing AI audio...");
      setIsAiSpeaking(true);
      await playBase64Audio(ai_b64);
      setIsAiSpeaking(false);
      console.log("AI audio playback finished.");
        } catch (error) {
      console.error('Error playing audio:', error);
      setIsAiSpeaking(false);
    }
  };

  // Create interleaved messages array for chat display
  const messages: Array<{ text: string; sender: 'ai' | 'user'; timestamp: number }> = [];
  const maxLength = Math.max(aiTranscriptHistory.length, userTranscriptHistory.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (aiTranscriptHistory[i]) {
      messages.push({ text: aiTranscriptHistory[i], sender: 'ai', timestamp: i * 2 });
    }
    if (userTranscriptHistory[i]) {
      messages.push({ text: userTranscriptHistory[i], sender: 'user', timestamp: i * 2 + 1 });
    }
  }

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#020617"]} style={styles.container}>
      <View style={styles.backgroundLayer} />

      {!isConnected && !isEndingCall ? (
        <View style={styles.incomingContent}>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Incoming Practice Call</Text>
            <Text style={styles.scenarioText}>{selectedScenario.title}</Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Animated.View
                pointerEvents="none"
                style={[styles.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
              />
              <View style={styles.avatarBorder}>
                <Image
                  source={require('../assets/images/Oli.png')}
                  style={styles.avatarImage}
                />
              </View>
            </View>

            <View style={styles.avatarDetails}>
              <Text style={styles.avatarName}>Oli</Text>
              <Text style={styles.avatarRole}>AI English Tutor</Text>
              <Text style={styles.avatarTagline}>Ready for an adventure?</Text>
            </View>
          </View>

          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>Your Mission</Text>
            <Text style={styles.missionText}>{selectedScenario.context}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.circleButton, styles.declineButton]}
              onPress={() => {
                setCallEnded(true); // Stop ringtone before navigating
                router.push("/");
              }}
            >
              <Feather name="phone-off" size={32} color="#fca5a5" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.circleButton, styles.answerButton, isLoading && styles.disabledButton]}
              onPress={startCall}
              disabled={isLoading}
            >
              <Feather name="phone" size={40} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.labelsRow}>
            <Text style={styles.declineLabel}>Decline</Text>
            <Text style={styles.answerLabel}>Answer</Text>
          </View>
        </View>
      ) : (
        <View style={styles.connectedContent}>
          {/* Header */}
          <View style={styles.connectedHeader}>
            <View style={styles.headerRow}>
              <View style={styles.avatarInfo}>
                <Image
                  source={require('../assets/images/Oli.png')}
                  style={styles.smallAvatar}
                />
                <View>
                  <Text style={styles.connectedName}>Oli</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: isAiSpeaking ? '#fb923c' : '#10b981' }]} />
                    <Text style={styles.statusText}>
                      {isAiSpeaking ? 'Speaking...' : 'Active'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.callInfo}>
                <Text style={styles.connectedTimer}>{formatTime(callDuration)}</Text>
              </View>
            </View>
          </View>

          {/* Scenario Info */}
          {isScenarioVisible && (
            <View style={styles.scenarioInfo}>
              <View style={styles.scenarioHeader}>
                <View style={styles.scenarioTitleContainer}>
                  <Text style={styles.scenarioTitle}>{selectedScenario.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeScenarioButton}
                  onPress={() => setIsScenarioVisible(false)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <Text style={styles.scenarioContext}>{selectedScenario.context}</Text>
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Conversation Progress</Text>
              <Text style={styles.progressCount}>{conversationTurns}/{maxTurns}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    })
                  }
                ]} 
              />
            </View>
            <View style={styles.progressDots}>
              {Array.from({ length: maxTurns }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index < conversationTurns && styles.progressDotCompleted
                  ]}
                />
              ))}
            </View>
            {conversationTurns === maxTurns - 1 && (
              <Text style={styles.warningText}>
                ⚠️ One more turn before call ends automatically
              </Text>
            )}
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
            {messages.length === 0 && isAiSpeaking && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fb923c" />
                <Text style={styles.loadingChatText}>SpeakFast is preparing the scenario...</Text>
              </View>
            )}

            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                {message.sender === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <Text style={styles.avatarText}>AI</Text>
                  </View>
                )}
                
                <View
                  style={[
                    styles.messageBubble,
                    message.sender === 'ai' ? styles.aiBubble : styles.userBubble
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>

                {message.sender === 'user' && (
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>You</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Typing Indicator */}
            {isListening && (
              <View style={[styles.messageContainer, styles.userMessage]}>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                  </View>
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>You</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Voice Controls */}
          <View style={styles.controlsContainer}>
            <AudioRecorderButton onRecordingComplete={handleRecordingComplete} />
            <Text style={styles.recorderHint}>Tap to send your response</Text>
            
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={[styles.endCallButton, isEndingCall && styles.disabledButton]} 
              onPress={endCall}
              disabled={isEndingCall}
            >
              {isEndingCall ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="phone-off" size={20} color="#fff" />
              )}
              <Text style={styles.endCallText}>
                {isEndingCall ? 'Ending...' : 'End Call'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fb923c" />
          <Text style={styles.loadingText}>Connecting…</Text>
        </View>
      )}

      {isEndingCall && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fb923c" />
          <Text style={styles.loadingText}>Ending call…</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(251, 146, 60, 0.04)",
  },
  // Incoming call styles (preserved)
  incomingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  headerLabel: {
    color: "rgba(226, 232, 240, 0.8)",
    fontSize: 14,
    marginBottom: 16,
  },
  scenarioText: {
    fontSize: 20,
    color: "#e2e8f0",
    textAlign: "center",
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
  },
  avatarWrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(251, 146, 60, 0.45)",
  },
  avatarBorder: {
    width: 150,
    height: 150,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: "#fb923c",
    overflow: "hidden",
    shadowColor: "#fb923c",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarDetails: {
    marginTop: 10,
    alignItems: "center",
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
  },
  avatarRole: {
    fontSize: 16,
    color: "rgba(226, 232, 240, 0.7)",
    marginTop: 4,
  },
  avatarTagline: {
    fontSize: 14,
    color: "#fb923c",
    marginTop: 6,
  },
  missionCard: {
    marginTop: 20,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
  },
  missionTitle: {
    fontSize: 18,
    color: "#fb923c",
    fontWeight: "600",
    marginBottom: 12,
  },
  missionText: {
    fontSize: 14,
    color: "rgba(226, 232, 240, 0.85)",
    lineHeight: 22,
  },
  actions: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  circleButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  declineButton: {
    borderColor: "rgba(248, 113, 113, 0.4)",
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    marginRight: 36,
  },
  answerButton: {
    borderColor: "rgba(251, 146, 60, 0.8)",
    backgroundColor: "#fb923c",
    width: 104,
    height: 104,
    borderRadius: 52,
    shadowColor: "#fb923c",
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 22,
    elevation: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  labelsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  declineLabel: {
    color: "rgba(248, 113, 113, 0.8)",
    marginRight: 64,
    fontSize: 13,
  },
  answerLabel: {
    color: "#fb923c",
    fontSize: 13,
    fontWeight: "600",
  },
  // Connected call styles (new chat interface)
  connectedContent: {
    flex: 1,
    paddingTop: 60,
  },
  connectedHeader: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(251, 146, 60, 0.5)",
  },
  connectedName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "rgba(226, 232, 240, 0.7)",
    fontSize: 12,
  },
  callInfo: {
    alignItems: "flex-end",
  },
  connectedTimer: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
  },
  scenarioInfo: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(51, 65, 85, 0.3)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },
  scenarioHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scenarioTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  scenarioTitle: {
    color: "#fb923c",
    fontSize: 14,
    fontWeight: "600",
  },
  closeScenarioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(55, 65, 81, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  scenarioContext: {
    color: "rgba(226, 232, 240, 0.7)",
    fontSize: 12,
    lineHeight: 18,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.5)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
  },
  progressCount: {
    color: "#fb923c",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(51, 65, 85, 0.6)",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fb923c",
    borderRadius: 3,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(51, 65, 85, 0.6)",
    borderWidth: 2,
    borderColor: "rgba(71, 85, 105, 0.5)",
  },
  progressDotCompleted: {
    backgroundColor: "#fb923c",
    borderColor: "#fb923c",
  },
  warningText: {
    color: "#fbbf24",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingChatText: {
    color: "rgba(226, 232, 240, 0.6)",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(251, 146, 60, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#e2e8f0",
    fontSize: 10,
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: "rgba(251, 146, 60, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.3)",
  },
  userBubble: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)",
  },
  messageText: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 20,
  },
  typingBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(251, 146, 60, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.2)",
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fb923c",
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.5)",
    alignItems: "center",
  },
  recorderHint: {
    color: "rgba(226, 232, 240, 0.65)",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 16,
  },
  endCallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#f87171",
    borderRadius: 999,
    gap: 8,
    shadowColor: "#f87171",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  endCallText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#fb923c",
    fontSize: 15,
    fontWeight: "500",
  },
});