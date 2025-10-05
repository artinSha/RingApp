import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  
  // Parse the feedback data from params
  let feedbackData = null;
  try {
    feedbackData = params.feedbackData ? JSON.parse(params.feedbackData as string) : null;
  } catch (error) {
    console.error('Error parsing feedback data:', error);
  }

  // Get additional params
  const scenario = params.scenario as string || "Practice Scenario";
  const duration = params.duration as string || "0";

  // Use real data if available, otherwise fallback to default
  const summary = feedbackData || {
    scenario: "Handling a Delayed Order",
    userTranscript: [
      "I'm so sorry to hear that your order hasn't arrived yet.",
      "Let me double-check your tracking number and see what's going on.",
      "I've requested expedited shipping on the replacement for you.",
    ],
    aiTranscript: [
      "Hi, my package is still not here and it's been two weeks.",
      "It's supposed to be a gift and I'm really disappointed.",
      "Okay, I appreciate you fixing this for me so quickly.",
    ],
    grammarErrors: [
      {
        error: "I double checked your tracking number.",
        correction: "I double-checked your tracking number.",
      },
      {
        error: "I already send you the confirmation email.",
        correction: "I've already sent you the confirmation email.",
      },
    ],
    score: 86,
    encouragement:
      "Great empathy and resolution skills! Keep refining your verb tenses and you'll reach the next level soon.",
  };

  // Override scenario with the actual one if passed
  if (scenario && scenario !== "Practice Scenario") {
    summary.scenario = scenario;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#34d399";
    if (score >= 75) return "#fb923c";
    return "#f87171";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        backgroundColor: "rgba(34,197,94,0.15)",
        borderColor: "rgba(34,197,94,0.4)",
        color: "#34d399",
        label: "Excellent",
      };
    }

    if (score >= 75) {
      return {
        backgroundColor: "rgba(249,115,22,0.15)",
        borderColor: "rgba(249,115,22,0.4)",
        color: "#fb923c",
        label: "Good",
      };
    }

    return {
      backgroundColor: "rgba(239,68,68,0.15)",
      borderColor: "rgba(239,68,68,0.4)",
      color: "#f87171",
      label: "Needs Practice",
    };
  };

  const badge = getScoreBadge(summary.score || 0);
  const participation = Math.round(
    ((summary.userTranscript?.length || 0) / (summary.aiTranscript?.length || 1)) * 100
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["rgba(249,115,22,0.25)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Feather name="check-circle" size={32} color="#34d399" />
            <Text style={styles.headerTitle}>Mission Complete!</Text>
          </View>
          <Text style={styles.headerSubtitle}>Here&apos;s how you performed</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreValue, { color: getScoreColor(summary.score || 0) }]}>
              {summary.score || 0}%
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }]}>
              <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>

          <Text style={styles.scenario}>{summary.scenario}</Text>
        </View>

        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
        >
          <View style={styles.sectionHeader}>
            <Feather name="message-square" size={20} color="#fb923c" />
            <Text style={styles.sectionTitle}>Conversation Transcript</Text>
            <View style={styles.transcriptMeta}>
              <Text style={styles.transcriptCount}>
                {Math.max((summary.aiTranscript || []).length, (summary.userTranscript || []).length)} exchanges
              </Text>
              <Feather 
                name={isTranscriptExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9ca3af" 
              />
            </View>
          </View>

          <View style={[styles.transcriptList, !isTranscriptExpanded && styles.transcriptCollapsed]}>
            {(summary.aiTranscript || []).slice(0, isTranscriptExpanded ? undefined : 2).map((aiMessage: string, index: number) => (
              <View key={index} style={styles.transcriptItem}>
                <View style={styles.messageRow}>
                  <View style={[styles.avatar, styles.avatarAi]}>
                    <Text style={styles.avatarText}>AI</Text>
                  </View>
                  <View style={styles.aiBubble}>
                    <Text style={styles.messageText}>{aiMessage}</Text>
                  </View>
                </View>

                {(summary.userTranscript || [])[index] ? (
                  <View style={[styles.messageRow, styles.messageRowUser]}>
                    <View style={styles.userBubble}>
                      <Text style={styles.messageText}>{(summary.userTranscript || [])[index]}</Text>
                    </View>
                    <View style={[styles.avatar, styles.avatarUser]}>
                      <Text style={[styles.avatarText, styles.avatarTextUser]}>You</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            ))}
            
            {!isTranscriptExpanded && (summary.aiTranscript || []).length > 2 && (
              <View style={styles.moreMessagesIndicator}>
                <Text style={styles.moreMessagesText}>
                  +{(summary.aiTranscript || []).length - 2} more exchanges...
                </Text>
                <Text style={styles.tapToExpandText}>Tap header to expand</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {(summary.grammarErrors || []).length > 0 && (
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/grammar-feedback" as any,
                params: { 
                  feedbackData: params.feedbackData,
                  grammarErrors: JSON.stringify(summary.grammarErrors || [])
                }
              });
            }}
          >
            <View style={styles.sectionHeader}>
              <Feather name="x-circle" size={20} color="#f87171" />
              <Text style={styles.sectionTitle}>Grammar Feedback</Text>
              <Feather name="chevron-right" size={20} color="#9ca3af" style={{marginLeft: 'auto'}} />
            </View>

            <View style={styles.grammarList}>
              {(summary.grammarErrors || []).map((error: any, index: number) => (
                <View key={index} style={styles.grammarItem}>
                  <View style={styles.grammarRow}>
                    <Text style={styles.grammarIcon}>❌</Text>
                    <Text style={styles.grammarError}>“{error.error}”</Text>
                  </View>
                  <View style={styles.grammarRow}>
                    <Text style={styles.grammarCheck}>✅</Text>
                    <Text style={styles.grammarCorrection}>“{error.correction}”</Text>
                  </View>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            activeOpacity={0.9}
            onPress={() => router.push("/")}
          >
            <Feather name="home" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            activeOpacity={0.85}
            onPress={() => router.push("/call")}
          >
            <Feather name="rotate-ccw" size={20} color="#e5e7eb" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Practice Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{(summary.userTranscript?.length - 1) || 0}</Text>
            <Text style={styles.statsLabel}>Your Responses</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{summary.grammarErrors?.length || 0}</Text>
            <Text style={styles.statsLabel}>Grammar Issues</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{Math.floor(parseInt(duration) / 60)}:{(parseInt(duration) % 60).toString().padStart(2, '0')}</Text>
            <Text style={styles.statsLabel}>Call Duration</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    marginTop: 50,
    marginBottom: 24,
    alignItems: "center",
  },
  headerIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f9fafb",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  card: {
    backgroundColor: "rgba(31,41,55,0.85)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.6)",
  },
  scoreBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scenario: {
    textAlign: "center",
    color: "#fb923c",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  encouragement: {
    color: "#d1d5db",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flex: 1,
  },
  sectionTitle: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  transcriptList: {
    gap: 20,
  },
  transcriptItem: {
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarAi: {
    backgroundColor: "rgba(249,115,22,0.25)",
  },
  avatarUser: {
    backgroundColor: "rgba(55,65,81,0.8)",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fb923c",
  },
  avatarTextUser: {
    color: "rgba(116, 169, 255, 0.81)",
  },
  aiBubble: {
    flex: 1,
    backgroundColor: "rgba(249,115,22,0.2)",
    borderRadius: 12,
    padding: 12,
  },
  userBubble: {
    flex: 1,
    maxWidth: "80%",
    backgroundColor: "rgba(55,65,81,0.8)",
    borderRadius: 12,
    padding: 12,
  },
  messageText: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 20,
  },
  grammarList: {
    gap: 12,
  },
  grammarItem: {
    backgroundColor: "rgba(55,65,81,0.6)",
    borderRadius: 12,
    padding: 14,
    paddingRight: 35,
    gap: 8,
  },
  grammarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grammarIcon: {
    fontSize: 16,
    color: "#f87171",
  },
  grammarError: {
    color: "#fca5a5",
    fontSize: 13,
  },
  grammarCheck: {
    fontSize: 16,
    color: "#34d399",
  },
  grammarCorrection: {
    color: "#bbf7d0",
    fontSize: 13,
  },
  actions: {
    gap: 12,
    marginTop: 4,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: "#f97316",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(107,114,128,0.7)",
    backgroundColor: "rgba(17,24,39,0.6)",
  },
  secondaryButtonText: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(31,41,55,0.7)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(75,85,99,0.5)",
  },
  statsValue: {
    color: "#fb923c",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statsLabel: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  transcriptMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
    flexShrink: 0,
  },
  transcriptCount: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  transcriptCollapsed: {
    maxHeight: 300,
    overflow: "hidden",
  },
  moreMessagesIndicator: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(75,85,99,0.3)",
    marginTop: 12,
  },
  moreMessagesText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  tapToExpandText: {
    color: "#6b7280",
    fontSize: 12,
    fontStyle: "italic",
  },
});
