import { ArrowLeft, Bell, BellOff, Calendar, Clock, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';

interface CallScheduleScreenProps {
  onBack: () => void;
}

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
  { key: 'low', label: 'Low', description: '1-2 calls per hour', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
  { key: 'medium', label: 'Medium', description: '2-4 calls per hour', color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
  { key: 'high', label: 'High', description: '4-6 calls per hour', color: 'bg-red-500/20 text-red-400 border-red-500/50' }
];

export function CallScheduleScreen({ onBack }: CallScheduleScreenProps) {
  const [settings, setSettings] = useState<ScheduleSettings>(() => {
    const saved = localStorage.getItem('callScheduleSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      callFrequency: 'medium'
    };
  });

  const [nextCallTime, setNextCallTime] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('callScheduleSettings', JSON.stringify(settings));
    
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
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    return settings.days.includes(currentDay) && 
           currentTime >= settings.startTime && 
           currentTime <= settings.endTime;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-transparent"></div>
      </div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="pt-8 pb-6 relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-8 right-4 border-gray-600 text-gray-300 hover:bg-gray-800/50"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 mb-4 pr-16">
            <Clock className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl text-white">Call Schedule</h1>
          </div>
          <p className="text-gray-400">Set when you want to receive practice calls</p>
        </div>

        {/* Quick Status */}
        <Card className="p-4 mb-6 bg-gray-900/70 backdrop-blur-sm border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {settings.enabled ? (
                <Bell className="w-5 h-5 text-orange-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-500" />
              )}
              <h3 className="text-white">Random Calls</h3>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <Badge
                variant="outline"
                className={settings.enabled 
                  ? isWithinSchedule() 
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                }
              >
                {settings.enabled 
                  ? isWithinSchedule() 
                    ? 'Active Now' 
                    : 'Scheduled'
                  : 'Disabled'
                }
              </Badge>
            </div>
            
            {settings.enabled && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next possible call</span>
                <span className="text-orange-400">{nextCallTime}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Time Range */}
        <Card className="p-6 mb-6 bg-gray-900/70 backdrop-blur-sm border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg text-white">Time Range</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Time</label>
              <input
                type="time"
                value={settings.startTime}
                onChange={(e) => updateSettings({ startTime: e.target.value })}
                className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Time</label>
              <input
                type="time"
                value={settings.endTime}
                onChange={(e) => updateSettings({ endTime: e.target.value })}
                className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </Card>

        {/* Days of Week */}
        <Card className="p-6 mb-6 bg-gray-900/70 backdrop-blur-sm border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg text-white">Days</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => (
              <Button
                key={day.key}
                variant="outline"
                size="sm"
                className={`h-12 ${
                  settings.days.includes(day.key)
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'border-gray-700 text-gray-400 hover:bg-gray-800/50'
                }`}
                onClick={() => toggleDay(day.key)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Call Frequency */}
        <Card className="p-6 mb-6 bg-gray-900/70 backdrop-blur-sm border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg text-white">Call Frequency</h3>
          </div>
          
          <div className="space-y-3">
            {frequencyOptions.map(option => (
              <div
                key={option.key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.callFrequency === option.key
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                }`}
                onClick={() => updateSettings({ callFrequency: option.key as 'low' | 'medium' | 'high' })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white mb-1">{option.label}</h4>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                  <Badge variant="outline" className={option.color}>
                    {option.label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-lg text-white mb-4">Schedule Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Active Days:</span>
              <span className="text-orange-400">
                {settings.days.length === 7 ? 'Every day' : 
                 settings.days.length === 0 ? 'No days selected' :
                 `${settings.days.length} day${settings.days.length > 1 ? 's' : ''} selected`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time Window:</span>
              <span className="text-orange-400">{settings.startTime} - {settings.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Frequency:</span>
              <span className="text-orange-400">{settings.callFrequency}</span>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            📱 Random practice calls will only come during your selected time windows.
            <br />You can always manually start a call from the home screen.
          </p>
        </div>
      </div>
    </div>
  );
}