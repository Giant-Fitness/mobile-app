/**
 * WorkoutReminderScheduler Component
 *
 * EXAMPLE IMPLEMENTATION: Shows how to schedule daily workout reminders
 *
 * This component demonstrates:
 * 1. How to schedule recurring workout notifications
 * 2. How to manage notification preferences
 * 3. How to cancel scheduled notifications
 * 4. How to integrate with user preferences
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNotifications } from '../../hooks/useNotifications';
import { scheduleWorkoutReminder } from '../../utils/notificationHelpers';

interface WorkoutReminderSchedulerProps {
  defaultHour?: number;
  defaultMinute?: number;
}

export function WorkoutReminderScheduler({
  defaultHour = 9,
  defaultMinute = 0,
}: WorkoutReminderSchedulerProps) {
  const {
    hasPermission,
    preferences,
    requestPermissions,
    updateNotificationPreferences,
  } = useNotifications();

  const [reminderIdentifier, setReminderIdentifier] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Format time for display
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  /**
   * Schedule a daily workout reminder
   * This runs every day at the specified time
   */
  const handleScheduleReminder = async () => {
    try {
      setIsScheduling(true);

      // Request permissions if not granted
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          alert('Notification permissions are required to set reminders');
          return;
        }
      }

      // Schedule the daily reminder
      const identifier = await scheduleWorkoutReminder({
        hour: defaultHour,
        minute: defaultMinute,
        repeats: true, // Repeat daily
      });

      setReminderIdentifier(identifier);

      // Update preferences to indicate workout reminders are enabled
      updateNotificationPreferences({
        workoutReminders: true,
      });

      alert(
        `Workout reminder scheduled!\nYou'll get a notification every day at ${formatTime(defaultHour, defaultMinute)}`
      );
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      alert('Failed to schedule reminder. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  /**
   * Toggle workout reminders on/off
   */
  const handleToggleReminders = async (enabled: boolean) => {
    updateNotificationPreferences({
      workoutReminders: enabled,
    });

    if (enabled && !reminderIdentifier) {
      await handleScheduleReminder();
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              Daily Workout Reminders
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Get notified at {formatTime(defaultHour, defaultMinute)} every day
            </Text>
          </View>
          <Switch
            value={preferences.workoutReminders}
            onValueChange={handleToggleReminders}
            disabled={!hasPermission}
          />
        </View>

        {!hasPermission && (
          <View style={styles.permissionBanner}>
            <Text variant="bodySmall" style={styles.permissionText}>
              Notification permissions required
            </Text>
            <Button mode="text" onPress={requestPermissions}>
              Enable
            </Button>
          </View>
        )}

        {preferences.workoutReminders && hasPermission && (
          <View style={styles.activeReminder}>
            <Text variant="bodySmall" style={styles.activeText}>
              ✅ Reminder is active - You'll be notified daily
            </Text>
          </View>
        )}

        {!preferences.workoutReminders && hasPermission && (
          <Button
            mode="contained"
            onPress={handleScheduleReminder}
            loading={isScheduling}
            disabled={isScheduling}
            style={styles.button}
          >
            Schedule Daily Reminder
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  permissionBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  permissionText: {
    color: '#856404',
    flex: 1,
  },
  activeReminder: {
    backgroundColor: '#D4EDDA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  activeText: {
    color: '#155724',
  },
  button: {
    marginTop: 12,
  },
});

/**
 * USAGE EXAMPLE:
 *
 * Add this component to your Settings screen or Home screen:
 *
 * import { WorkoutReminderScheduler } from '@/components/notifications/WorkoutReminderScheduler';
 *
 * function SettingsScreen() {
 *   return (
 *     <ScrollView>
 *       <WorkoutReminderScheduler
 *         defaultHour={9}
 *         defaultMinute={0}
 *       />
 *     </ScrollView>
 *   );
 * }
 *
 * ADVANCED USAGE:
 *
 * For program-specific reminders:
 *
 * const identifier = await scheduleWorkoutReminder(
 *   { hour: 9, minute: 0, repeats: true },
 *   {
 *     programId: 'your-program-id',
 *     programDayIndex: 1,
 *   }
 * );
 *
 * For workout-specific reminders:
 *
 * const identifier = await scheduleWorkoutReminder(
 *   { hour: 18, minute: 30, repeats: true },
 *   {
 *     workoutId: 'your-workout-id',
 *   }
 * );
 */
