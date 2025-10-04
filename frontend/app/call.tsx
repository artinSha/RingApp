import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function CallScreen() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startCall = async () => {
    setIsLoading(true);
    // TODO: Call backend POST /start_call here
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const endCall = () => {
    setIsConnected(false);
    router.push("/results");
  };

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <>
          <Text style={styles.title}>Incoming AI Call...</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <Button title="Start Call" onPress={startCall} color="#007AFF" />
          )}
        </>
      ) : (
        <>
          <Text style={styles.inCallText}>You’re in a call 🎧</Text>
          <View style={styles.callUI}>
            <View style={styles.circle} />
            <Text style={styles.timer}>00:36</Text>
          </View>
          <Button title="End Call" onPress={endCall} color="#FF3B30" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  inCallText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  callUI: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007AFF",
    opacity: 0.2,
    marginBottom: 16,
  },
  timer: {
    fontSize: 18,
    fontWeight: "500",
  },
});
