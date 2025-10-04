import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function ResultsScreen() {
  const router = useRouter();

  // Placeholder data (you’ll replace this with real API data)
  const feedback = {
    fluency: "Good! You spoke smoothly with minimal hesitation.",
    pronunciation: "Watch your 'th' sounds — they were slightly unclear.",
    grammar: "Mostly accurate; be careful with past tense consistency.",
    score: 86,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your SpeakFast Results 🎯</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Fluency:</Text>
        <Text style={styles.text}>{feedback.fluency}</Text>

        <Text style={styles.label}>Pronunciation:</Text>
        <Text style={styles.text}>{feedback.pronunciation}</Text>

        <Text style={styles.label}>Grammar:</Text>
        <Text style={styles.text}>{feedback.grammar}</Text>

        <Text style={styles.score}>
          Overall Score: {feedback.score}/100
        </Text>
      </View>

      <Button
        title="Back to Home"
        onPress={() => router.push("/")}
        color="#007AFF"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    color: "#444",
  },
  score: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
});
