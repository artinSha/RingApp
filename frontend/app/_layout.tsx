import { Stack, router } from "expo-router";
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

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
}

export default function Layout() {
  useNotificationObserver();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="call" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
