import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAudioPlayer } from 'expo-audio';
import { Audio } from 'expo-av';
import AudioRecorderButton from "@/components/record-button";

export default function CallScreen() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sound, setSound] = useState<any>(null);

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
    router.push("/feedback");
  };

  const handleRecordingComplete = async (uri: string) => {
    // Upload to backend
    const formData = new FormData();
    formData.append('audio', { uri, name: 'recording.m4a', type: 'audio/m4a' } as any);

    const response = await fetch('', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = await response.json();
    // data.audioUrl -> returned m4a
    // data.transcript -> text

    setTranscript(data.transcript);

    // Play returned audio
    const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl }, { shouldPlay: true });
    setSound(sound);
  }

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
          <AudioRecorderButton onRecordingComplete={handleRecordingComplete}/>
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
