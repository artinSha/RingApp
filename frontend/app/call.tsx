import AudioRecorderButton from "@/components/record-button";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";

import { File, cacheDirectory} from 'expo-file-system';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BACKEND_URL = "https://ringapp-backend-production.up.railway.app";

export default function CallScreen() {
  const router = useRouter();
  const [convID, setConvID] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user_transcript, setUserTranscript] = useState("");
  const [ai_transcript, setAITranscript]  = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const selectedScenario = useMemo(() => {
    const scenarios = [
      "🧟 Zombie Apocalypse Survival",
      "✈️ Airport Check-in Emergency",
      "🍕 Pizza Order Mix-up",
      "🏥 Doctor's Appointment",
      "🚗 Car Rental Problem",
      "🏨 Hotel Complaint",
      "📞 Wrong Number Confusion",
    ];

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
    return () => {
      if (sound) {
        sound.unloadAsync();
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

  const playBase64Audio = async (base64String: string) => {
    try {
      console.log('Starting audio');

      // Create a temporary file in the cache folder
      const file = new File(cacheDirectory + 'temp_audio.mp3', 'audio/mp3');

      // Write the Base64 content
      await file.write(base64String, { encoding: 'base64' });

      // Load and play with Expo AV
      const { sound } = await Audio.Sound.createAsync({ uri: file.uri });
      await sound.playAsync();

      console.log('Audio playing');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const startCall = async () => {
    try {
      setIsLoading(true);
      const user_id = "68e1891a053b036af73ed31d"; 
      const scenario = selectedScenario;
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

      setIsConnected(true);
    } catch (error) {
      console.error("Error starting call:", error);
    } finally {
      setIsLoading(false);
    }
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const endCall = () => {
    setIsConnected(false);
    router.push("/feedback");
  };

  const handleRecordingComplete = async (uri: string) => {
    if (!convID) {
      console.warn("No conversation ID available.")
      return;
    }

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
    // data.audioUrl -> returned m4a
    // data.transcript -> text

    setUserTranscript(data.user_text);
    setAITranscript(data.ai_text);
    console.log(data);
    var ai_b64 = data.ai_audio_b64;

    if (!ai_b64) {
      console.error("AI audio base64 not found in response");
      return;
    }

    // Play returned audio
    try {
      console.log("Playing AI audio...");
      await playBase64Audio(ai_b64);
      console.log("AI audio playback finished.");
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };



  return (
    <LinearGradient colors={["#0f172a", "#111827", "#020617"]} style={styles.container}>
      <View style={styles.backgroundLayer} />

      {!isConnected ? (
        <View style={styles.incomingContent}>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Incoming Practice Call</Text>
            <Text style={styles.scenarioText}>{selectedScenario}</Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Animated.View
                pointerEvents="none"
                style={[styles.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
              />
              <View style={styles.avatarBorder}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1622169804256-0eb6873ff441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTk1NTI2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                  }}
                  style={styles.avatarImage}
                />
              </View>
            </View>

            <View style={styles.avatarDetails}>
              <Text style={styles.avatarName}>Lebron</Text>
              <Text style={styles.avatarRole}>AI English Tutor</Text>
              <Text style={styles.avatarTagline}>Ready for an adventure?</Text>
            </View>
          </View>

          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>Your Mission</Text>
            <Text style={styles.missionText}>
              You'll be dropped into a challenging scenario where you must communicate effectively in English. Are you ready
              to test your skills?
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.circleButton, styles.declineButton]}
              onPress={router.back}
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
          <View style={styles.connectedHeader}>
            <Text style={styles.connectedTitle}>You’re in a call 🎧</Text>
            <Text style={styles.connectedTimer}>00:36</Text>
          </View>

          <View style={styles.connectedCard}>
            <Text style={styles.connectedBadge}>AI English Tutor</Text>
            <Text style={styles.connectedName}>Sarah</Text>
            <Text style={styles.connectedScenario}>{selectedScenario}</Text>
          </View>

          <View style={styles.recorderSection}>
            <AudioRecorderButton onRecordingComplete={handleRecordingComplete} />
            <Text style={styles.recorderHint}>Tap to send your response</Text>
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.endCallButton} onPress={endCall}>
            <Feather name="phone-off" size={20} color="#fff" />
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fb923c" />
          <Text style={styles.loadingText}>Connecting…</Text>
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
  challengeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(251, 146, 60, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.25)",
    marginBottom: 12,
  },
  challengeText: {
    color: "#fb923c",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
  connectedContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
    justifyContent: "space-between",
  },
  connectedHeader: {
    alignItems: "center",
  },
  connectedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
  },
  connectedTimer: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(248, 250, 252, 0.75)",
  },
  connectedCard: {
    marginTop: 24,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.6)",
  },
  connectedBadge: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#fb923c",
    backgroundColor: "rgba(251, 146, 60, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  connectedName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  connectedScenario: {
    fontSize: 16,
    color: "rgba(226, 232, 240, 0.85)",
  },
  recorderSection: {
    alignItems: "center",
    marginTop: 32,
  },
  recorderHint: {
    marginTop: 16,
    color: "rgba(226, 232, 240, 0.65)",
    fontSize: 13,
  },
  endCallButton: {
    marginTop: 32,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
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
    marginLeft: 8,
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
