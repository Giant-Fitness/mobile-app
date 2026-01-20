import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * NotificationService
 *
 * Handles all push notification functionality including:
 * - Permission requests
 * - Token registration
 * - Notification scheduling
 * - Notification handling
 */

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
}

export interface ScheduledNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
  identifier?: string;
  categoryIdentifier?: string;
}

export interface LocalNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: boolean | string;
  categoryIdentifier?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private pushToken: PushNotificationToken | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions from the user
   * Returns true if granted, false otherwise
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Ask for permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notification permissions are granted
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get the push token
   * Required for sending remote push notifications
   */
  public async registerForPushNotifications(): Promise<PushNotificationToken | null> {
    try {
      // Check if running on a physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('No Expo project ID found in config');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = {
        token: tokenData.data,
        type: 'expo',
      };

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      console.log('Push token registered:', this.pushToken.token);
      return this.pushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Setup Android notification channels
   * Required for Android 8.0+ to show notifications
   */
  private async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // Default channel for general notifications
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#45A949',
      });

      // Workout reminders channel
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Workout Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#45A949',
        sound: 'default',
        enableVibrate: true,
      });

      // Achievements channel
      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements & Milestones',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#45A949',
      });

      // Measurement reminders channel
      await Notifications.setNotificationChannelAsync('measurement-reminders', {
        name: 'Measurement Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#45A949',
      });

      // Content updates channel
      await Notifications.setNotificationChannelAsync('content-updates', {
        name: 'New Content',
        importance: Notifications.AndroidImportance.LOW,
        lightColor: '#45A949',
      });

      console.log('Android notification channels configured');
    } catch (error) {
      console.error('Error setting up Android channels:', error);
    }
  }

  /**
   * Get the current push token
   */
  public getPushToken(): PushNotificationToken | null {
    return this.pushToken;
  }

  /**
   * Schedule a local notification
   * Returns the notification identifier
   */
  public async scheduleNotification(
    options: ScheduledNotificationOptions
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          categoryIdentifier: options.categoryIdentifier,
        },
        trigger: options.trigger,
        identifier: options.identifier,
      });

      console.log('Notification scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Send an immediate local notification
   */
  public async sendNotification(options: LocalNotificationOptions): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          badge: options.badge,
          sound: options.sound,
          categoryIdentifier: options.categoryIdentifier,
        },
        trigger: null, // Send immediately
      });

      console.log('Immediate notification sent:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  public async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('Notification cancelled:', identifier);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Set up notification listeners
   * Call this in your app's initialization code
   */
  public setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );
  }

  /**
   * Remove notification listeners
   * Call this during cleanup
   */
  public removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Get the last notification response (useful for handling app launch from notification)
   */
  public async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      return response;
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  }

  /**
   * Dismiss all presented notifications
   */
  public async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('All notifications dismissed');
    } catch (error) {
      console.error('Error dismissing notifications:', error);
    }
  }

  /**
   * Set the app icon badge number (iOS)
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Get the current app icon badge number (iOS)
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export default NotificationService.getInstance();
