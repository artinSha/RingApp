import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

type Highlight = {
  icon: FeatherName;
  title: string;
  description: string;
};

type Scenario = {
  title: string;
  score: string;
  tone: 'green' | 'orange';
};

type Stat = {
  label: string;
  value: string;
};

type HomeScreenProps = {
  onStartCall?: () => void;
  onMoreInfo?: () => void;
  onSchedule?: () => void;
};

const TUTOR_IMAGE = require('../assets/images/Oli.png');

const LOGO_IMAGE = require('../assets/images/logo.png');

const HIGHLIGHTS: Highlight[] = [
  {
    icon: 'zap',
    title: 'Surprise Calls',
    description: 'Get random calls that drop you into challenging scenarios.',
  },
  {
    icon: 'target',
    title: 'Survive Scenarios',
    description: 'Navigate zombie attacks, airport emergencies, and more!',
  },
  {
    icon: 'trending-up',
    title: 'Get Instant Feedback',
    description: 'See your transcript, grammar corrections, and scores.',
  },
];

const RECENT_SCENARIOS: Scenario[] = [
  { title: '🧟 Zombie Mall Escape', score: '92%', tone: 'green' },
  { title: '✈️ Flight Delay Crisis', score: '78%', tone: 'orange' },
  { title: '🍕 Pizza Order Chaos', score: '95%', tone: 'green' },
];

const STATS: Stat[] = [
  { label: 'Scenarios', value: '23' },
  { label: 'Practice Time', value: '2h 15m' },
  { label: 'Avg Score', value: '87%' },
];




export function HomeScreen({ onStartCall, onMoreInfo, onSchedule }: HomeScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={onSchedule}
        >
          <Feather name="settings" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <View style={styles.logoRow}>
          {/* 
          <View style={styles.logoBadge}>
            <Image source={LOGO_IMAGE} style={styles.logoImage} />
          </View> 
          */}
          <Text style={styles.appName}>SpeakFast</Text>
        </View>
        <Text style={styles.tagline}>
          Master English through surprise AI conversations.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Random calls incoming!</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.tutorRow}>
          <Image source={TUTOR_IMAGE} style={styles.tutorImage} />
          <View style={styles.tutorCopy}>
            <View style={styles.tutorHeader}>
              <Text style={styles.tutorName}>Oli</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>AI Scenario Master</Text>
              </View>
            </View>
            <Text style={styles.tutorSubtitle}>
              Your personal English challenge partner. Ready to throw you into
              exciting scenarios!
            </Text>
            <View style={styles.tutorMeta}>
              <View style={styles.metaItem}>
                <Feather name="star" size={14} color="#fb923c" />
                <Text style={styles.metaText}>4.9</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color="#9ca3af" />
                <Text style={styles.metaText}>Available 24/7</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onStartCall}>
          <Feather name="phone" size={18} color="#fff" />
          <Text style={styles.ctaText}>Challenge Me Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        {HIGHLIGHTS.map(({ icon, title, description }) => (
          <View key={title} style={styles.highlightCard}>
            <View style={styles.iconCircle}>
              <Feather name={icon} size={20} color="#fb923c" />
            </View>
            <View style={styles.highlightCopy}>
              <Text style={styles.highlightTitle}>{title}</Text>
              <Text style={styles.highlightDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Scenarios</Text>
        {RECENT_SCENARIOS.map(({ title, score, tone }) => (
          <View key={title} style={styles.scenarioRow}>
            <Text style={styles.scenarioTitle}>{title}</Text>
            <View
              style={[
                styles.badge,
                tone === 'green' ? styles.successBadge : styles.alertBadge,
              ]}
            >
              <Text style={styles.badgeText}>{score}</Text>
            </View>
          </View>
        ))}
      </View> 

      <View style={styles.card}>
        <Text style={styles.sectionHint}>Your Progress</Text>
        <View style={styles.statsRow}>
          {STATS.map(({ label, value }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
          <TouchableOpacity style={styles.ctaButton} onPress={() => onMoreInfo?.()}>
            <Feather name="menu" size={18} color="#fff" />
            <Text style={styles.ctaText}>More Info</Text>
          </TouchableOpacity>
      </View> 

      <View style={styles.warning}>
        <Text style={styles.warningText}>
          🚨 Stay alert! Random practice calls can come at any time.{'\n'}Be
          ready to handle any scenario thrown your way!
        </Text>
      </View>
    </ScrollView>
  );
}

export default function HomeRoute() {
  const router = useRouter();
  return (
    <HomeScreen
      onStartCall={() => router.push('/call')}
      onMoreInfo={() => router.push('/results')}
      onSchedule={() => router.push('/schedule')}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
    backgroundColor: '#111827',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  logoRow: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // gap: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fb923c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    color: '#d1d5db',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.5)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fb923c',
    textAlign: 'center',
  },
  smallBadge: {
    alignSelf: 'flex-start',
    flexShrink: 1,
    maxWidth: '50%',
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  tutorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tutorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  tutorCopy: {
    flex: 1,
    gap: 8,
  },
  tutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tutorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    flex: 1,
  },
  tutorSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
  },
  tutorMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  ctaButton: {
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
    color: '#f9fafb',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f9fafb',
  },
  highlightCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.4)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightCopy: {
    flex: 1,
    gap: 4,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
  },
  highlightDescription: {
    fontSize: 12,
    color: '#d1d5db',
  },
  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scenarioTitle: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  successBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  alertBadge: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderColor: 'rgba(251, 146, 60, 0.4)',
  },
  sectionHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fb923c',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  warning: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(75, 85, 99, 0.4)',
  },
  warningText: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 18,
  },
});