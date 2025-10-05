import * as Notifications from 'expo-notifications';
import { Stack, router } from "expo-router";
import { useEffect, useState } from 'react';

function useNotificationObserver() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    function redirect(notification: Notifications.Notification) {
      router.push('/call');
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const randomSeconds = 10;
    sendNoti(randomSeconds);

  }, [isMounted]);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendNoti(seconds: number) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: '📱 RING RING !!!',
      body: "Lebron is Calling!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds
    },
  });
}

export default function Layout() {
  useNotificationObserver();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="call" />
      <Stack.Screen name="results" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}
