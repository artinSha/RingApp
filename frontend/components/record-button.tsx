import { useState, useEffect } from 'react';
import { StyleSheet, Button, Alert } from 'react-native';
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
      onPress={recorderState.isRecording ? stopRecording : record}
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