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

    let isCancelled = false;

    function scheduleRandomNotification() {
      // Random delay between 10 and 60 minutes (in seconds)
      // const minSeconds = 10 * 60;
      const minSeconds = 10; // For testing purposes, set to 10 seconds
      // const maxSeconds = 60 * 60;
      const maxSeconds = 30; // For testing purposes, set to 30 seconds
      const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
      sendNoti(randomSeconds);
      // Schedule next notification after this one triggers
      setTimeout(() => {
        if (!isCancelled) scheduleRandomNotification();
      }, randomSeconds * 1000);
    }

    scheduleRandomNotification();

    return () => {
      isCancelled = true;
    };
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
