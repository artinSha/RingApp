import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';

interface ScheduleSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: string[];
  callFrequency: 'low' | 'medium' | 'high';
}

const daysOfWeek = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' }
];

const frequencyOptions = [
  { 
    key: 'low', 
    label: 'Low', 
    description: '1-2 calls per hour', 
    variant: 'success' as const 
  },
  { 
    key: 'medium', 
    label: 'Medium', 
    description: '2-4 calls per hour', 
    variant: 'warning' as const 
  },
  { 
    key: 'high', 
    label: 'High', 
    description: '4-6 calls per hour', 
    variant: 'destructive' as const 
  }
];

export function CallScheduleScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<ScheduleSettings>({
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    callFrequency: 'medium'
  });

  const [nextCallTime, setNextCallTime] = useState<string>('');

  useEffect(() => {
    // Calculate next possible call time
    if (settings.enabled) {
      const now = new Date();
      let nextCall = new Date();
      
      // Simple logic to show next possible call time
      const [startHour, startMin] = settings.startTime.split(':').map(Number);
      const [endHour, endMin] = settings.endTime.split(':').map(Number);
      
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      if (currentHour < startHour || (currentHour === startHour && currentMin < startMin)) {
        // Before start time today
        nextCall.setHours(startHour, startMin, 0, 0);
      } else if (currentHour > endHour || (currentHour === endHour && currentMin > endMin)) {
        // After end time today, set to tomorrow's start time
        nextCall.setDate(nextCall.getDate() + 1);
        nextCall.setHours(startHour, startMin, 0, 0);
      } else {
        // Within range, next call could be soon
        const randomMinutes = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
        nextCall = new Date(now.getTime() + randomMinutes * 60000);
      }
      
      setNextCallTime(nextCall.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [settings]);

  const updateSettings = (updates: Partial<ScheduleSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleDay = (day: string) => {
    const newDays = settings.days.includes(day)
      ? settings.days.filter(d => d !== day)
      : [...settings.days, day];
    updateSettings({ days: newDays });
  };

  const isWithinSchedule = () => {
    if (!settings.enabled) return false;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return settings.days.includes(currentDay) && 
           currentTime >= settings.startTime && 
           currentTime <= settings.endTime;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    if (type === 'start') {
      updateSettings({ startTime: time });
    } else {
      updateSettings({ endTime: time });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#d1d5db" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Feather name="clock" size={24} color="#fb923c" />
            <Text style={styles.title}>Call Schedule</Text>
          </View>
          <Text style={styles.subtitle}>Set when you want to receive practice calls</Text>
        </View>
      </View>

      {/* Quick Status */}
      <Card style={styles.card}>
        <View style={styles.statusHeader}>
          <View style={styles.statusTitleRow}>
            <Feather 
              name={settings.enabled ? "bell" : "bell-off"} 
              size={20} 
              color={settings.enabled ? "#fb923c" : "#9ca3af"} 
            />
            <Text style={styles.cardTitle}>Random Calls</Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(enabled) => updateSettings({ enabled })}
          />
        </View>
        
        <View style={styles.statusContent}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Badge
              variant={settings.enabled 
                ? isWithinSchedule() 
                  ? 'success'
                  : 'warning'
                : 'outline'
              }
            >
              {settings.enabled 
                ? isWithinSchedule() 
                  ? 'Active Now' 
                  : 'Scheduled'
                : 'Disabled'
              }
            </Badge>
          </View>
          
          {settings.enabled && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Next possible call</Text>
              <Text style={styles.nextCallTime}>{nextCallTime}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Time Range */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="clock" size={20} color="#fb923c" />
          <Text style={styles.cardTitle}>Time Range</Text>
        </View>
        
        <View style={styles.timeInputContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.inputLabel}>Start Time</Text>
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>{formatTime(settings.startTime)}</Text>
              <TouchableOpacity 
                style={styles.timeEditButton}
                onPress={() => {
                  Alert.prompt(
                    'Start Time',
                    'Enter start time (HH:MM)',
                    (text) => {
                      if (text && /^\d{2}:\d{2}$/.test(text)) {
                        handleTimeChange('start', text);
                      }
                    },
                    'plain-text',
                    settings.startTime
                  );
                }}
              >
                <Feather name="edit-2" size={16} color="#fb923c" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.timeInputGroup}>
            <Text style={styles.inputLabel}>End Time</Text>
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>{formatTime(settings.endTime)}</Text>
              <TouchableOpacity 
                style={styles.timeEditButton}
                onPress={() => {
                  Alert.prompt(
                    'End Time',
                    'Enter end time (HH:MM)',
                    (text) => {
                      if (text && /^\d{2}:\d{2}$/.test(text)) {
                        handleTimeChange('end', text);
                      }
                    },
                    'plain-text',
                    settings.endTime
                  );
                }}
              >
                <Feather name="edit-2" size={16} color="#fb923c" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>

      {/* Days of Week */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="calendar" size={20} color="#fb923c" />
          <Text style={styles.cardTitle}>Days</Text>
        </View>
        
        <View style={styles.daysContainer}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayButton,
                settings.days.includes(day.key) && styles.dayButtonActive
              ]}
              onPress={() => toggleDay(day.key)}
            >
              <Text style={[
                styles.dayButtonText,
                settings.days.includes(day.key) && styles.dayButtonTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Call Frequency */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="settings" size={20} color="#fb923c" />
          <Text style={styles.cardTitle}>Call Frequency</Text>
        </View>
        
        <View style={styles.frequencyContainer}>
          {frequencyOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.frequencyOption,
                settings.callFrequency === option.key && styles.frequencyOptionActive
              ]}
              onPress={() => updateSettings({ callFrequency: option.key as 'low' | 'medium' | 'high' })}
            >
              <View style={styles.frequencyContent}>
                <View style={styles.frequencyText}>
                  <Text style={styles.frequencyLabel}>{option.label}</Text>
                  <Text style={styles.frequencyDescription}>{option.description}</Text>
                </View>
                <Badge variant={option.variant}>
                  {option.label}
                </Badge>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Preview */}
      <Card style={StyleSheet.flatten([styles.card, styles.previewCard])}>
        <Text style={styles.cardTitle}>Schedule Preview</Text>
        <View style={styles.previewContent}>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Active Days:</Text>
            <Text style={styles.previewValue}>
              {settings.days.length === 7 ? 'Every day' : 
               settings.days.length === 0 ? 'No days selected' :
               `${settings.days.length} day${settings.days.length > 1 ? 's' : ''} selected`}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Time Window:</Text>
            <Text style={styles.previewValue}>
              {formatTime(settings.startTime)} - {formatTime(settings.endTime)}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Frequency:</Text>
            <Text style={styles.previewValue}>{settings.callFrequency}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📱 Random practice calls will only come during your selected time windows.{'\n'}
          You can always manually start a call from the home screen.
        </Text>
      </View>
    </ScrollView>
  );
}

export default function ScheduleRoute() {
  return <CallScheduleScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
  },
  header: {
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  headerContent: {
    paddingRight: 60,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  card: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  nextCallTime: {
    fontSize: 14,
    color: '#fb923c',
    fontWeight: '500',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 85, 99, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeDisplay: {
    flex: 1,
    fontSize: 16,
    color: '#f9fafb',
  },
  timeEditButton: {
    padding: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    minWidth: 40,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderColor: 'rgba(251, 146, 60, 0.5)',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  dayButtonTextActive: {
    color: '#fb923c',
  },
  frequencyContainer: {
    gap: 12,
  },
  frequencyOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(75, 85, 99, 0.6)',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  frequencyOptionActive: {
    borderColor: 'rgba(251, 146, 60, 0.5)',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  frequencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frequencyText: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  previewCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  previewContent: {
    gap: 8,
    marginTop: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  previewValue: {
    fontSize: 14,
    color: '#fb923c',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});