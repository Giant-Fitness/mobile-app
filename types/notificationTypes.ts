/**
 * Notification Types
 *
 * Type definitions for the notification system
 */

export interface PushToken {
  token: string;
  type: 'expo' | 'apns' | 'fcm';
  registeredAt: string;
}

export interface NotificationPreferences {
  workoutReminders: boolean;
  measurementReminders: boolean;
  achievements: boolean;
  contentUpdates: boolean;
  inactivityReminders: boolean;
  restDayMotivation: boolean;
}

export interface ScheduledNotificationInfo {
  identifier: string;
  title: string;
  body: string;
  trigger: string; // Stringified trigger info
  data?: Record<string, any>;
  createdAt: string;
}

export enum NotificationCategory {
  WORKOUT_REMINDER = 'workout-reminder',
  MEASUREMENT_REMINDER = 'measurement-reminder',
  ACHIEVEMENT = 'achievement',
  CONTENT_UPDATE = 'content-update',
  INACTIVITY = 'inactivity',
  REST_DAY = 'rest-day',
  PROGRAM_MILESTONE = 'program-milestone',
}

export interface NotificationData {
  category: NotificationCategory;
  [key: string]: any;
}

/**
 * Workout reminder notification data
 */
export interface WorkoutReminderData extends NotificationData {
  category: NotificationCategory.WORKOUT_REMINDER;
  workoutId?: string;
  programId?: string;
  programDayIndex?: number;
}

/**
 * Measurement reminder notification data
 */
export interface MeasurementReminderData extends NotificationData {
  category: NotificationCategory.MEASUREMENT_REMINDER;
  measurementType: 'weight' | 'sleep' | 'body';
}

/**
 * Achievement notification data
 */
export interface AchievementData extends NotificationData {
  category: NotificationCategory.ACHIEVEMENT;
  achievementType: 'streak' | 'program-complete' | 'milestone' | 'pr';
  value?: number;
}

/**
 * Content update notification data
 */
export interface ContentUpdateData extends NotificationData {
  category: NotificationCategory.CONTENT_UPDATE;
  contentType: 'program' | 'workout';
  contentId?: string;
}

/**
 * Request body for sending push notifications via API
 */
export interface SendPushNotificationRequest {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'high' | 'max';
  ttl?: number; // Time to live in seconds
}

/**
 * Response from Expo push notification service
 */
export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: any;
}

/**
 * Notification schedule templates
 */
export interface NotificationSchedule {
  hour: number; // 0-23
  minute: number; // 0-59
  repeats: boolean;
  weekday?: number; // 1=Sunday, 2=Monday, ..., 7=Saturday (for weekly repeats)
}
