import { Feather } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef } from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
const BACKEND_URL = "https://ringapp-backend-production.up.railway.app";

interface Props {
    onRecordingComplete: (uri: string) => void;
}

export default function AudioRecorderButton({ onRecordingComplete }: Props) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
    const { uri } = audioRecorder
    console.log('Recording available at:', uri);
    if (uri) {
      onRecordingComplete(uri);
    }
  };

  // Start recording animations
  useEffect(() => {
    if (recorderState.isRecording) {
      // Pulsing animation for the button
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      // Glow effect animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Scale down slightly when pressed
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }).start();

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      // Reset animations when not recording
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [recorderState.isRecording]);

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

  const buttonOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect rings */}
      {recorderState.isRecording && (
        <>
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRing1,
              {
                transform: [{ scale: pulseAnim }],
                opacity: glowOpacity,
              }
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRing2,
              {
                transform: [{ scale: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [1.1, 1.4],
                }) }],
                opacity: glowOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              }
            ]}
          />
        </>
      )}
      
      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          recorderState.isRecording && styles.recordingButton,
        ]}
        onPress={recorderState.isRecording ? stopRecording : record}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonInner,
            {
              transform: [{ scale: scaleAnim }],
              opacity: buttonOpacity,
            }
          ]}
        >
          <Feather
            name="mic"
            size={28}
            color={recorderState.isRecording ? "#fff" : "#fb923c"}
          />
          
          {/* Recording indicator dots */}
          {recorderState.isRecording && (
            <View style={styles.recordingDots}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: glowAnim,
                    transform: [{ scale: glowAnim }],
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                    transform: [{ scale: glowAnim }],
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                    transform: [{ scale: glowAnim }],
                  }
                ]}
              />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 106, 0, 0.34)',
    borderWidth: 2,
    borderColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#f87171',
    borderColor: '#f87171',
    shadowColor: '#f87171',
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fb923c',
  },
  glowRing1: {
    width: 100,
    height: 100,
  },
  glowRing2: {
    width: 120,
    height: 120,
    borderColor: '#fbbf24',
  },
  recordingDots: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});