import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📞 SpeakFast</Text>
      <Text style={styles.subtitle}>
        Practice conversational English with surprise AI calls!
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Join a Call Now"
          onPress={() => router.push("/call")}
          color="#007AFF"
        />
        <Button
          title="View My Feedback"
          onPress={() => router.push("/feedback")}
          color="#34C759"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  buttonContainer: {
    width: "80%",
    gap: 16,
  },
});




















































