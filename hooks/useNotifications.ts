import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import NotificationService from '../services/NotificationService';
import {
  setPushToken,
  setHasPermission,
  setLastNotificationId,
  addScheduledNotification,
  removeScheduledNotification,
  updatePreferences,
} from '../store/notifications/notificationsSlice';
import type { RootState } from '../store/store';
import type {
  NotificationCategory,
  NotificationData,
  ScheduledNotificationInfo,
  LocalNotificationOptions,
  ScheduledNotificationOptions,
} from '../types/notificationTypes';

/**
 * Custom hook for managing notifications
 */
export function useNotifications() {
  const dispatch = useDispatch();
  const notificationState = useSelector((state: RootState) => state.notifications);

  /**
   * Initialize notifications and set up listeners
   */
  const initializeNotifications = useCallback(async () => {
    try {
      // Check permissions
      const hasPermission = await NotificationService.checkPermissions();
      dispatch(setHasPermission(hasPermission));

      if (hasPermission) {
        // Register for push notifications
        const token = await NotificationService.registerForPushNotifications();
        if (token) {
          dispatch(
            setPushToken({
              token: token.token,
              type: token.type,
              registeredAt: new Date().toISOString(),
            })
          );
        }
      }

      // Set up notification listeners
      NotificationService.setupNotificationListeners(
        (notification) => {
          // Handle notification received while app is in foreground
          console.log('Notification received in foreground:', notification);
          dispatch(setLastNotificationId(notification.request.identifier));
        },
        (response) => {
          // Handle notification tap
          handleNotificationResponse(response);
        }
      );

      // Check if app was opened from a notification
      const lastResponse = await NotificationService.getLastNotificationResponse();
      if (lastResponse) {
        handleNotificationResponse(lastResponse);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [dispatch]);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async () => {
    const granted = await NotificationService.requestPermissions();
    dispatch(setHasPermission(granted));

    if (granted) {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        dispatch(
          setPushToken({
            token: token.token,
            type: token.type,
            registeredAt: new Date().toISOString(),
          })
        );
      }
    }

    return granted;
  }, [dispatch]);

  /**
   * Schedule a notification
   */
  const scheduleNotification = useCallback(
    async (options: ScheduledNotificationOptions) => {
      try {
        const identifier = await NotificationService.scheduleNotification(options);

        const notificationInfo: ScheduledNotificationInfo = {
          identifier,
          title: options.title,
          body: options.body,
          trigger: JSON.stringify(options.trigger),
          data: options.data,
          createdAt: new Date().toISOString(),
        };

        dispatch(addScheduledNotification(notificationInfo));
        return identifier;
      } catch (error) {
        console.error('Error scheduling notification:', error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Send an immediate notification
   */
  const sendNotification = useCallback(async (options: LocalNotificationOptions) => {
    try {
      const identifier = await NotificationService.sendNotification(options);
      return identifier;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, []);

  /**
   * Cancel a scheduled notification
   */
  const cancelNotification = useCallback(
    async (identifier: string) => {
      try {
        await NotificationService.cancelNotification(identifier);
        dispatch(removeScheduledNotification(identifier));
      } catch (error) {
        console.error('Error cancelling notification:', error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    try {
      await NotificationService.cancelAllNotifications();
      // Don't clear from Redux as they may be re-scheduled
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }, []);

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(
    (preferences: Partial<typeof notificationState.preferences>) => {
      dispatch(updatePreferences(preferences));
    },
    [dispatch]
  );

  /**
   * Handle notification response (when user taps on notification)
   */
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as NotificationData;

      if (!data?.category) {
        return;
      }

      // Route based on notification category
      switch (data.category) {
        case 'workout-reminder':
          if (data.workoutId) {
            router.push(`/(tabs)/solos/workout/${data.workoutId}`);
          } else if (data.programId) {
            router.push(`/(tabs)/plans`);
          }
          break;

        case 'measurement-reminder':
          router.push(`/(tabs)/progress`);
          break;

        case 'achievement':
          router.push(`/(tabs)/progress`);
          break;

        case 'content-update':
          if (data.contentType === 'program') {
            router.push(`/(tabs)/plans`);
          } else if (data.contentType === 'workout') {
            router.push(`/(tabs)/solos`);
          }
          break;

        case 'program-milestone':
          router.push(`/(tabs)/plans`);
          break;

        default:
          router.push(`/(tabs)`);
      }
    },
    []
  );

  return {
    ...notificationState,
    initializeNotifications,
    requestPermissions,
    scheduleNotification,
    sendNotification,
    cancelNotification,
    cancelAllNotifications,
    updateNotificationPreferences,
  };
}

/**
 * Hook to check if notifications are enabled
 */
export function useNotificationPermission() {
  const hasPermission = useSelector(
    (state: RootState) => state.notifications.hasPermission
  );

  return hasPermission;
}

/**
 * Hook to get notification preferences
 */
export function useNotificationPreferences() {
  const preferences = useSelector(
    (state: RootState) => state.notifications.preferences
  );

  return preferences;
}

/**
 * Hook to get push token
 */
export function usePushToken() {
  const pushToken = useSelector((state: RootState) => state.notifications.pushToken);

  return pushToken;
}
