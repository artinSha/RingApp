import AudioRecorderButton from "@/components/record-button";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const BACKEND_URL = "https://ringapp-backend-production.up.railway.app";

interface GrammarError {
  error: string;
  correction: string;
}

export default function GrammarFeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{correct: boolean, attempts: number} | null>(null);
  const slideAnimations = useRef<Animated.Value[]>([]).current;
  
  // Parse grammar errors from params
  let grammarErrors: GrammarError[] = [];
  try {
    // First try to get from direct grammarErrors param
    if (params.grammarErrors) {
      grammarErrors = JSON.parse(params.grammarErrors as string);
    } else {
      // Fallback to parsing from feedbackData
      const feedbackData = params.feedbackData ? JSON.parse(params.feedbackData as string) : null;
      grammarErrors = feedbackData?.grammarErrors || feedbackData?.grammar_feedback?.issues || [];
    }
  } catch (error) {
    console.error('Error parsing grammar errors:', error);
    // Fallback data for testing
    grammarErrors = [
      {
        error: "I double checked your tracking number.",
        correction: "I double-checked your tracking number.",
      },
      {
        error: "I already send you the confirmation email.",
        correction: "I've already sent you the confirmation email.",
      },
    ];
  }

  // Initialize animations
  useEffect(() => {
    slideAnimations.length = grammarErrors.length;
    grammarErrors.forEach((_, index) => {
      if (!slideAnimations[index]) {
        slideAnimations[index] = new Animated.Value(0);
      }
    });
  }, [grammarErrors]);

  // Set up audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };
    setupAudio();
  }, []);

  const toggleExpanded = (index: number) => {
    const isExpanding = expandedIndex !== index;
    setExpandedIndex(isExpanding ? index : null);
    
    // Animate the expansion
    Animated.timing(slideAnimations[index], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const startPractice = (index: number) => {
    setPracticeMode(index);
    setIsRecording(false);
    setPronunciationResult(null);
    setIsProcessing(false);
  };

  const handleRecordingComplete = async (uri: string) => {
    if (practiceMode === null) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      const correction = grammarErrors[practiceMode]?.correction;
      if (!correction) {
        console.error('No correction text available');
        setIsProcessing(false);
        return;
      }

      // Send audio to backend for pronunciation verification
      const formData = new FormData();
      formData.append('audio', { uri, name: 'practice.m4a', type: 'audio/m4a' } as any);
      formData.append('correction_text', correction);

      const response = await fetch(`${BACKEND_URL}/process_practice`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const isCorrect = data.matched || false; // Expecting a boolean 'matched' field
      
      // Update pronunciation result
      setPronunciationResult(prev => ({
        correct: isCorrect,
        attempts: (prev?.attempts || 0) + 1
      }));
      
      // If correct, close practice after showing success for a moment
      if (isCorrect) {
        setTimeout(() => {
          setPracticeMode(null);
          setPronunciationResult(null);
        }, 2500);
      }
      
    } catch (error) {
      console.error('Error processing pronunciation:', error);
      // Show error feedback
      setPronunciationResult(prev => ({
        correct: false,
        attempts: (prev?.attempts || 0) + 1
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const closePractice = () => {
    setPracticeMode(null);
    setIsRecording(false);
    setPronunciationResult(null);
    setIsProcessing(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["rgba(239,68,68,0.15)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#e5e7eb" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrapper}>
            <Feather name="edit-3" size={28} color="#f87171" />
            <Text style={styles.headerTitle}>Grammar Feedback</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Review your mistakes and practice corrections
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {grammarErrors.length === 0 ? (
            <View style={styles.noErrorsCard}>
              <Feather name="check-circle" size={48} color="#34d399" />
              <Text style={styles.noErrorsTitle}>Perfect Grammar!</Text>
              <Text style={styles.noErrorsText}>
                You didn't make any grammar mistakes in this conversation. Keep up the excellent work!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>How to Practice</Text>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Tap any card to see the correction</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Practice speaking the correct phrase</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Record yourself to improve pronunciation</Text>
                </View>
              </View>

              {grammarErrors.map((error, index) => (
                <View key={index} style={styles.errorCard}>
                  <TouchableOpacity
                    style={styles.errorHeader}
                    onPress={() => toggleExpanded(index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.errorIconWrapper}>
                      <Feather name="x-circle" size={20} color="#f87171" />
                      <Text style={styles.errorNumber}>Error {index + 1}</Text>
                    </View>
                    <Feather 
                      name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>

                  <View style={styles.originalText}>
                    <Text style={styles.originalLabel}>What you said:</Text>
                    <Text style={styles.originalPhrase}>"{error.error}"</Text>
                  </View>

                  <Animated.View
                    style={[
                      styles.correctionContainer,
                      {
                        maxHeight: slideAnimations[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                          extrapolate: 'clamp',
                        }) || 0,
                        opacity: slideAnimations[index] || 0,
                      }
                    ]}
                  >
                    <View style={styles.correctionContent}>
                      <View style={styles.correctionHeader}>
                        <Feather name="check-circle" size={18} color="#34d399" />
                        <Text style={styles.correctionLabel}>Correct version:</Text>
                      </View>
                      <Text style={styles.correctionPhrase}>"{error.correction}"</Text>
                      
                      <TouchableOpacity
                        style={styles.practiceButton}
                        onPress={() => startPractice(index)}
                        activeOpacity={0.8}
                      >
                        <Feather name="mic" size={16} color="#fff" />
                        <Text style={styles.practiceButtonText}>Practice Speaking</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Practice Modal */}
      {practiceMode !== null && (
        <View style={styles.practiceOverlay}>
          <View style={styles.practiceModal}>
            <View style={styles.practiceHeader}>
              <Text style={styles.practiceTitle}>Practice Time!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closePractice}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.practiceContent}>
              <Text style={styles.practiceInstruction}>
                Read this phrase aloud and record yourself:
              </Text>
              
              <View style={styles.practicePhrase}>
                <Text style={styles.practicePhraseText}>
                  "{grammarErrors[practiceMode]?.correction}"
                </Text>
              </View>

              {/* Pronunciation Feedback */}
              {pronunciationResult && (
                <View style={[
                  styles.feedbackContainer,
                  pronunciationResult.correct ? styles.successFeedback : styles.errorFeedback
                ]}>
                  <Feather 
                    name={pronunciationResult.correct ? "check-circle" : "x-circle"} 
                    size={24} 
                    color={pronunciationResult.correct ? "#34d399" : "#f87171"} 
                  />
                  <Text style={[
                    styles.feedbackText,
                    { color: pronunciationResult.correct ? "#34d399" : "#f87171" }
                  ]}>
                    {pronunciationResult.correct 
                      ? "Perfect! Great pronunciation!" 
                      : `Not quite right. Try again! (Attempt ${pronunciationResult.attempts})`
                    }
                  </Text>
                </View>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <View style={styles.processingContainer}>
                  <Text style={styles.processingText}>Analyzing your pronunciation...</Text>
                </View>
              )}

              <View style={styles.recordingControls}>
                <View style={styles.practiceRecorder}>
                  <AudioRecorderButton 
                    onRecordingComplete={handleRecordingComplete}
                  />
                </View>
                <Text style={styles.recordingHint}>
                  {pronunciationResult?.correct 
                    ? "Well done! Practice completed." 
                    : "Tap to record your pronunciation"
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(31,41,55,0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.6)",
  },
  headerContent: {
    flex: 1,
  },
  headerIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f9fafb",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  noErrorsCard: {
    backgroundColor: "rgba(31,41,55,0.85)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.3)",
  },
  noErrorsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#34d399",
    marginTop: 16,
    marginBottom: 8,
  },
  noErrorsText: {
    color: "#d1d5db",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  instructionCard: {
    backgroundColor: "rgba(31,41,55,0.85)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.6)",
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fb923c",
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  stepText: {
    color: "#d1d5db",
    fontSize: 14,
    flex: 1,
  },
  errorCard: {
    backgroundColor: "rgba(31,41,55,0.85)",
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    overflow: "hidden",
  },
  errorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  errorIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f87171",
  },
  originalText: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  originalLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  originalPhrase: {
    fontSize: 16,
    color: "#fca5a5",
    fontStyle: "italic",
    lineHeight: 24,
  },
  correctionContainer: {
    overflow: "hidden",
  },
  correctionContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(75,85,99,0.4)",
  },
  correctionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  correctionLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  correctionPhrase: {
    fontSize: 16,
    color: "#bbf7d0",
    fontWeight: "500",
    lineHeight: 24,
    marginBottom: 16,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fb923c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  practiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  practiceModal: {
    backgroundColor: "rgba(31,41,55,0.95)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.6)",
  },
  practiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(55,65,81,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  practiceContent: {
    alignItems: "center",
  },
  practiceInstruction: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  practicePhrase: {
    backgroundColor: "rgba(249,115,22,0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
  },
  practicePhraseText: {
    fontSize: 18,
    color: "#fb923c",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  recordingControls: {
    alignItems: "center",
  },
  practiceRecorder: {
    marginBottom: 12,
  },
  recordingHint: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  successFeedback: {
    backgroundColor: "rgba(52,211,153,0.15)",
    borderColor: "rgba(52,211,153,0.3)",
  },
  errorFeedback: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderColor: "rgba(248,113,113,0.3)",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  processingContainer: {
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  processingText: {
    fontSize: 14,
    color: "#fb923c",
    fontStyle: "italic",
    textAlign: "center",
  },
});