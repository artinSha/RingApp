import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SUMMARY = [
  { label: 'Scenario', value: '🧟 Zombie Mall Escape' },
  { label: 'Score', value: '92%' },
  { label: 'Feedback', value: 'Fantastic urgency and clear instructions. Keep refining your tone for anxious customers.' },
];

export default function ResultsScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Latest Results</Text>
        <Text style={styles.subtitle}>
          Review your recent scenario performance and targeted coaching notes.
        </Text>

        {SUMMARY.map(({ label, value }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/call')}
        >
          <Feather name="phone" size={18} color="#111827" />
          <Text style={styles.ctaText}>Try Another Call</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={18} color="#fb923c" />
        <Text style={styles.secondaryText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    gap: 24,
    backgroundColor: '#111827',
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1d5db',
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#9ca3af',
  },
  value: {
    fontSize: 16,
    color: '#f9fafb',
  },
  ctaButton: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fb923c',
    paddingVertical: 14,
    borderRadius: 999,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fb923c',
  },
});
