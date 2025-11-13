/**
 * Notification Helper Utilities
 *
 * Helper functions for creating and managing notifications
 */

import NotificationService from '../services/NotificationService';
import type {
  NotificationCategory,
  WorkoutReminderData,
  MeasurementReminderData,
  AchievementData,
  ContentUpdateData,
  NotificationSchedule,
} from '../types/notificationTypes';

/**
 * Schedule a daily workout reminder
 */
export async function scheduleWorkoutReminder(
  schedule: NotificationSchedule,
  options?: {
    workoutId?: string;
    programId?: string;
    programDayIndex?: number;
  }
): Promise<string> {
  const data: WorkoutReminderData = {
    category: 'workout-reminder' as NotificationCategory.WORKOUT_REMINDER,
    ...options,
  };

  const identifier = await NotificationService.scheduleNotification({
    title: "Time to Work Out! 💪",
    body: "Your workout is ready. Let's crush it!",
    data,
    trigger: {
      hour: schedule.hour,
      minute: schedule.minute,
      repeats: schedule.repeats,
    },
    categoryIdentifier: 'workout-reminders',
  });

  return identifier;
}

/**
 * Schedule a weekly measurement reminder
 */
export async function scheduleMeasurementReminder(
  measurementType: 'weight' | 'sleep' | 'body',
  schedule: NotificationSchedule
): Promise<string> {
  const titles = {
    weight: 'Weight Check-in',
    sleep: 'Log Your Sleep',
    body: 'Body Measurements',
  };

  const bodies = {
    weight: "Time to log your weight and track your progress!",
    sleep: "How did you sleep last night? Log it now!",
    body: "Update your body measurements to see your transformation!",
  };

  const data: MeasurementReminderData = {
    category: 'measurement-reminder' as NotificationCategory.MEASUREMENT_REMINDER,
    measurementType,
  };

  const identifier = await NotificationService.scheduleNotification({
    title: titles[measurementType],
    body: bodies[measurementType],
    data,
    trigger: {
      hour: schedule.hour,
      minute: schedule.minute,
      weekday: schedule.weekday,
      repeats: schedule.repeats,
    },
    categoryIdentifier: 'measurement-reminders',
  });

  return identifier;
}

/**
 * Send an achievement notification
 */
export async function sendAchievementNotification(
  achievementType: 'streak' | 'program-complete' | 'milestone' | 'pr',
  value?: number
): Promise<string> {
  let title = '';
  let body = '';

  switch (achievementType) {
    case 'streak':
      title = `${value}-Day Streak! 🔥`;
      body = `Amazing! You've worked out ${value} days in a row. Keep it up!`;
      break;
    case 'program-complete':
      title = 'Program Complete! 🎉';
      body = "Congratulations! You've completed your program. Time to start a new one!";
      break;
    case 'milestone':
      title = 'Milestone Achieved! 🏆';
      body = `You've completed ${value} workouts. You're crushing it!`;
      break;
    case 'pr':
      title = 'Personal Record! 💥';
      body = "You just hit a new PR! Keep pushing those limits!";
      break;
  }

  const data: AchievementData = {
    category: 'achievement' as NotificationCategory.ACHIEVEMENT,
    achievementType,
    value,
  };

  const identifier = await NotificationService.sendNotification({
    title,
    body,
    data,
    badge: 1,
    sound: true,
    categoryIdentifier: 'achievements',
  });

  return identifier;
}

/**
 * Send a content update notification
 */
export async function sendContentUpdateNotification(
  contentType: 'program' | 'workout',
  contentId?: string
): Promise<string> {
  const titles = {
    program: 'New Program Available! 🆕',
    workout: 'New Workout Added! 🆕',
  };

  const bodies = {
    program: 'Check out the latest program designed just for you!',
    workout: 'A fresh workout is ready for you to try!',
  };

  const data: ContentUpdateData = {
    category: 'content-update' as NotificationCategory.CONTENT_UPDATE,
    contentType,
    contentId,
  };

  const identifier = await NotificationService.sendNotification({
    title: titles[contentType],
    body: bodies[contentType],
    data,
    categoryIdentifier: 'content-updates',
  });

  return identifier;
}

/**
 * Send a rest day motivation notification
 */
export async function sendRestDayNotification(): Promise<string> {
  const messages = [
    {
      title: 'Rest Day 😌',
      body: 'Recovery is just as important as training. Enjoy your rest day!',
    },
    {
      title: 'Take It Easy Today 🛋️',
      body: "Your muscles need time to recover. You've earned this rest day!",
    },
    {
      title: 'Recovery Day 💆',
      body: 'Rest days are when the magic happens. Let your body rebuild stronger!',
    },
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  const identifier = await NotificationService.sendNotification({
    title: message.title,
    body: message.body,
    data: {
      category: 'rest-day' as NotificationCategory.REST_DAY,
    },
    categoryIdentifier: 'default',
  });

  return identifier;
}

/**
 * Send an inactivity reminder
 */
export async function sendInactivityReminder(daysInactive: number): Promise<string> {
  let title = '';
  let body = '';

  if (daysInactive === 3) {
    title = 'We Miss You! 👋';
    body: "It's been 3 days since your last workout. Ready to get back at it?";
  } else if (daysInactive === 7) {
    title = 'Come Back Stronger 💪';
    body = "It's been a week! Your fitness journey is waiting for you.";
  } else {
    title = 'Your Workout is Waiting 🏋️';
    body = `It's been ${daysInactive} days. Let's get back on track together!`;
  }

  const identifier = await NotificationService.sendNotification({
    title,
    body,
    data: {
      category: 'inactivity' as NotificationCategory.INACTIVITY,
      daysInactive,
    },
    categoryIdentifier: 'default',
  });

  return identifier;
}

/**
 * Send a program milestone notification
 */
export async function sendProgramMilestoneNotification(
  milestoneType: 'week-complete' | 'halfway' | 'almost-done',
  details?: { currentWeek?: number; totalWeeks?: number }
): Promise<string> {
  let title = '';
  let body = '';

  switch (milestoneType) {
    case 'week-complete':
      title = `Week ${details?.currentWeek} Complete! 🎯`;
      body = `Great job finishing week ${details?.currentWeek}. Keep the momentum going!`;
      break;
    case 'halfway':
      title = 'Halfway There! 🚀';
      body: "You're 50% through your program. Amazing progress!";
      break;
    case 'almost-done':
      title: "You're Almost There! 🏁";
      body = 'Just a few more workouts until you complete your program!';
      break;
  }

  const identifier = await NotificationService.sendNotification({
    title,
    body,
    data: {
      category: 'program-milestone' as NotificationCategory.PROGRAM_MILESTONE,
      milestoneType,
      ...details,
    },
    categoryIdentifier: 'achievements',
  });

  return identifier;
}

/**
 * Calculate the next workout reminder time based on user preferences
 */
export function getNextWorkoutReminderTime(preferredHour: number = 9): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(preferredHour, 0, 0, 0);
  return tomorrow;
}

/**
 * Format notification time for display
 */
export function formatNotificationTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Check if it's a good time to send a notification (not too late or too early)
 */
export function isGoodNotificationTime(hour: number = new Date().getHours()): boolean {
  // Between 8 AM and 9 PM
  return hour >= 8 && hour < 21;
}

/**
 * Get the appropriate channel ID based on notification category
 */
export function getChannelIdForCategory(category: NotificationCategory): string {
  switch (category) {
    case 'workout-reminder':
      return 'workout-reminders';
    case 'achievement':
    case 'program-milestone':
      return 'achievements';
    case 'measurement-reminder':
      return 'measurement-reminders';
    case 'content-update':
      return 'content-updates';
    default:
      return 'default';
  }
}
