import { useState, useEffect } from 'react';
import { StyleSheet, Button, Alert } from 'react-native';
const BACKEND_URL = "http://172.16.202.157:5000";
import {
    useAudioRecorder, 
    AudioModule,
    RecordingPresets,
    setAudioModeAsync, 
    useAudioRecorderState,
} from 'expo-audio'

interface Props {
    onRecordingComplete: (uri: string) => void;
}

export default function AudioRecorderButton({ onRecordingComplete }: Props) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    console.log('Recording available at:', audioRecorder.uri);



  };
  const createUser = async () => {
  
  console.log("Creating user...")
  try {
    const response = await fetch(`${BACKEND_URL}/create_user`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "heman",
        email: "heman@example.com",
        dnd_start: "09:00",
        dnd_end: "17:00",
        device_token: "optional_device_token_here"
      }),
    });

    console.log("Response status:", response.status);


    const data = await response.json();
    console.log("Created user:", data); // { user_id: "..." }
  } catch (err) {
    console.error("Error creating user:", err);
  }
};


  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <Button
      title={recorderState.isRecording ? "Recording..." : "Tap to Record"}
      onPress={createUser}
 //     onPress={recorderState.isRecording ? stopRecording : record}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});