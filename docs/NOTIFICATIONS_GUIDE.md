# Push Notifications Guide

This guide explains how to send push notifications in the Kyn fitness app, both manually and via automated rules.

## Table of Contents

1. [Overview](#overview)
2. [Manual Notifications (Local)](#manual-notifications-local)
3. [Push Notifications (Remote)](#push-notifications-remote)
4. [Automated Notification Rules](#automated-notification-rules)
5. [Best Practices](#best-practices)
6. [Testing Notifications](#testing-notifications)

---

## Overview

The app supports two types of notifications:

1. **Local Notifications**: Scheduled and sent directly from the device
2. **Remote Push Notifications**: Sent from a server to specific users

**Key Components:**
- `NotificationService` - Core notification functionality
- `notificationsSlice` - Redux state management
- `useNotifications` hook - React hook for components
- Notification helpers in `utils/notificationHelpers.ts`

---

## Manual Notifications (Local)

Local notifications are scheduled and delivered by the device itself, without needing a server.

### Immediate Notification

Send a notification right now:

```typescript
import NotificationService from '@/services/NotificationService';

// Simple immediate notification
await NotificationService.sendNotification({
  title: 'Workout Complete! 🎉',
  body: 'Great job on completing your workout!',
  badge: 1,
  sound: true,
});
```

### Scheduled Notification

Schedule a notification for a specific time:

```typescript
// Schedule for a specific date/time
await NotificationService.scheduleNotification({
  title: 'Time to Workout!',
  body: 'Your workout is waiting',
  trigger: {
    date: new Date(Date.now() + 3600000), // 1 hour from now
  },
});

// Schedule daily at 9:00 AM
await NotificationService.scheduleNotification({
  title: 'Morning Workout Reminder',
  body: "Let's start the day strong!",
  trigger: {
    hour: 9,
    minute: 0,
    repeats: true, // Repeats daily
  },
});

// Schedule weekly on Monday at 6:00 PM
await NotificationService.scheduleNotification({
  title: 'Week Start Reminder',
  body: 'Time to kick off the week!',
  trigger: {
    weekday: 2, // 1=Sunday, 2=Monday, ..., 7=Saturday
    hour: 18,
    minute: 0,
    repeats: true, // Repeats weekly
  },
});
```

### Using Helper Functions

The app provides pre-built helper functions for common notifications:

```typescript
import {
  scheduleWorkoutReminder,
  sendAchievementNotification,
  scheduleMeasurementReminder,
  sendProgramMilestoneNotification,
} from '@/utils/notificationHelpers';

// Workout reminder (daily at 9 AM)
await scheduleWorkoutReminder(
  { hour: 9, minute: 0, repeats: true },
  { programId: 'abc123' }
);

// Achievement notification
await sendAchievementNotification('streak', 7); // 7-day streak

// Measurement reminder (weekly on Sunday at 8 AM)
await scheduleMeasurementReminder('weight', {
  hour: 8,
  minute: 0,
  weekday: 1, // Sunday
  repeats: true,
});

// Program milestone
await sendProgramMilestoneNotification('week-complete', {
  currentWeek: 1,
  totalWeeks: 8,
});
```

### Managing Scheduled Notifications

```typescript
// Get all scheduled notifications
const scheduled = await NotificationService.getScheduledNotifications();
console.log('Scheduled notifications:', scheduled);

// Cancel a specific notification
await NotificationService.cancelNotification('notification-id');

// Cancel all scheduled notifications
await NotificationService.cancelAllNotifications();

// Dismiss all presented notifications
await NotificationService.dismissAllNotifications();
```

---

## Push Notifications (Remote)

Remote push notifications are sent from your server to users' devices using Expo's push notification service.

### Prerequisites

1. User must have granted notification permissions
2. App must have registered a push token
3. Push token must be saved to your backend

### Getting the Push Token

```typescript
import { usePushToken } from '@/hooks/useNotifications';

function MyComponent() {
  const pushToken = usePushToken();

  // Send this token to your backend
  if (pushToken) {
    console.log('Expo Push Token:', pushToken.token);
    // POST to your API: /users/{userId}/push-token
  }
}
```

### Sending from Your Backend

**Method 1: Using Expo's Push API Directly**

```javascript
// Node.js example
const fetch = require('node-fetch');

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
    channelId: 'default', // Android channel
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();
  console.log('Push notification sent:', result);
  return result;
}

// Usage
await sendPushNotification(
  'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  'New Workout Available',
  'Check out the latest workout added just for you!',
  { category: 'content-update', contentType: 'workout', contentId: 'workout-123' }
);
```

**Method 2: Using Expo SDK (Recommended)**

```javascript
// Install: npm install expo-server-sdk
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotifications(tokens, title, body, data = {}) {
  // Create messages
  let messages = [];
  for (let pushToken of tokens) {
    // Check that all tokens are valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
    });
  }

  // Send in chunks
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending chunk:', error);
    }
  }

  return tickets;
}

// Usage - Send to multiple users
await sendPushNotifications(
  ['ExponentPushToken[xxx]', 'ExponentPushToken[yyy]'],
  'Workout Reminder',
  'Your workout starts in 1 hour!',
  { category: 'workout-reminder' }
);
```

### Sending to Specific User Segments

```javascript
// Example: Send to all users with active programs
async function notifyActiveProgramUsers() {
  // Get users from your database
  const users = await db.users.find({
    hasActiveProgram: true,
    pushToken: { $exists: true }
  });

  const tokens = users.map(u => u.pushToken);

  await sendPushNotifications(
    tokens,
    'Keep the Momentum Going! 🔥',
    "Don't forget to complete today's workout!",
    { category: 'workout-reminder' }
  );
}

// Example: Send to users who haven't logged in recently
async function sendReengagementNotifications() {
  const inactiveUsers = await db.users.find({
    lastLoginDate: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    pushToken: { $exists: true }
  });

  const tokens = inactiveUsers.map(u => u.pushToken);

  await sendPushNotifications(
    tokens,
    'We Miss You! 👋',
    "It's been a week! Come back and crush your fitness goals.",
    { category: 'inactivity', daysInactive: 7 }
  );
}
```

---

## Automated Notification Rules

Set up automated notifications that trigger based on user actions or time-based rules.

### Rule 1: Daily Workout Reminder

**Trigger:** Every day at user's preferred time
**Condition:** User has an active program

```typescript
// In your backend cron job (runs daily at 8 AM)
async function sendDailyWorkoutReminders() {
  const users = await db.users.find({
    hasActiveProgram: true,
    notificationPreferences: { workoutReminders: true }
  });

  for (const user of users) {
    // Get user's preferred notification time (default 9 AM)
    const hour = user.reminderTime?.hour || 9;

    // Calculate when to send today
    const now = new Date();
    const notificationTime = new Date(now);
    notificationTime.setHours(hour, 0, 0, 0);

    // Only send if time hasn't passed yet today
    if (notificationTime > now && user.pushToken) {
      await sendPushNotification(
        user.pushToken,
        'Time to Work Out! 💪',
        'Your workout is ready. Let\\'s crush it!',
        {
          category: 'workout-reminder',
          programId: user.activeProgramId
        }
      );
    }
  }
}
```

### Rule 2: Achievement on Workout Completion

**Trigger:** User completes a workout
**Condition:** Check for milestones (streaks, totals)

```typescript
// In your workout completion API endpoint
async function handleWorkoutCompletion(userId, workoutId) {
  // ... existing workout completion logic ...

  // Check achievements
  const userStats = await getUserStats(userId);

  // Streak achievement
  if ([3, 7, 14, 30, 60, 100].includes(userStats.currentStreak)) {
    await sendAchievementNotification('streak', userStats.currentStreak);
  }

  // Total workouts milestone
  if (userStats.totalWorkouts % 10 === 0) {
    await sendAchievementNotification('milestone', userStats.totalWorkouts);
  }
}
```

### Rule 3: Weekly Measurement Reminder

**Trigger:** Every Sunday at 8 AM
**Condition:** User hasn't logged weight this week

```typescript
// Backend cron job (runs every Sunday at 8 AM)
async function sendWeeklyWeightReminders() {
  const users = await db.users.find({
    notificationPreferences: { measurementReminders: true }
  });

  for (const user of users) {
    // Check if user logged weight this week
    const lastWeightLog = await db.weightMeasurements.findOne({
      userId: user.id,
      timestamp: { $gte: getStartOfWeek() }
    });

    if (!lastWeightLog && user.pushToken) {
      await sendPushNotification(
        user.pushToken,
        'Weight Check-in 📊',
        'Time to log your weight and track your progress!',
        { category: 'measurement-reminder', measurementType: 'weight' }
      );
    }
  }
}
```

### Rule 4: Program Milestone Notifications

**Trigger:** User completes a program week
**Condition:** Specific weeks (e.g., 1, 4, 8)

```typescript
async function checkProgramMilestones(userId, programId, completedDayIndex) {
  const program = await db.programs.findById(programId);
  const daysPerWeek = program.days / program.weeks;
  const currentWeek = Math.ceil((completedDayIndex + 1) / daysPerWeek);

  // Just completed a week
  if ((completedDayIndex + 1) % daysPerWeek === 0) {
    const user = await db.users.findById(userId);

    if (user.pushToken) {
      // Check for specific milestones
      if (currentWeek === Math.ceil(program.weeks / 2)) {
        // Halfway point
        await sendProgramMilestoneNotification('halfway', {
          currentWeek,
          totalWeeks: program.weeks
        });
      } else if (currentWeek === program.weeks - 1) {
        // Almost done
        await sendProgramMilestoneNotification('almost-done', {
          currentWeek,
          totalWeeks: program.weeks
        });
      } else {
        // Regular week completion
        await sendProgramMilestoneNotification('week-complete', {
          currentWeek,
          totalWeeks: program.weeks
        });
      }
    }
  }
}
```

### Rule 5: Inactivity Re-engagement

**Trigger:** User hasn't opened app in 3+ days
**Condition:** Previously active user

```typescript
// Backend cron job (runs daily)
async function sendInactivityReminders() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 3-day inactive users
  const inactiveUsers3d = await db.users.find({
    lastActiveDate: { $lte: threeDaysAgo, $gte: sevenDaysAgo },
    totalWorkouts: { $gte: 1 }, // Previously active
    notificationPreferences: { inactivityReminders: true }
  });

  for (const user of inactiveUsers3d) {
    if (user.pushToken) {
      await sendPushNotification(
        user.pushToken,
        'We Miss You! 👋',
        "It's been 3 days since your last workout. Ready to get back at it?",
        { category: 'inactivity', daysInactive: 3 }
      );
    }
  }

  // 7-day inactive users
  const inactiveUsers7d = await db.users.find({
    lastActiveDate: { $lte: sevenDaysAgo },
    totalWorkouts: { $gte: 5 },
    notificationPreferences: { inactivityReminders: true }
  });

  for (const user of inactiveUsers7d) {
    if (user.pushToken) {
      await sendPushNotification(
        user.pushToken,
        'Come Back Stronger 💪',
        "It's been a week! Your fitness journey is waiting for you.",
        { category: 'inactivity', daysInactive: 7 }
      );
    }
  }
}
```

### Rule 6: New Content Notifications

**Trigger:** New program or workout is added
**Condition:** Content matches user's preferences

```typescript
async function notifyNewContent(contentType, contentId) {
  const content = await db[contentType].findById(contentId);

  // Find users who might be interested
  const interestedUsers = await db.users.find({
    notificationPreferences: { contentUpdates: true },
    'fitnessProfile.goal': content.goal,
    'fitnessProfile.level': { $in: [content.level, 'any'] }
  });

  const tokens = interestedUsers
    .filter(u => u.pushToken)
    .map(u => u.pushToken);

  if (tokens.length > 0) {
    const title = contentType === 'program'
      ? 'New Program Available! 🆕'
      : 'New Workout Added! 🆕';

    const body = contentType === 'program'
      ? `Check out "${content.name}" - ${content.weeks} weeks of training!`
      : `Try the new "${content.name}" workout!`;

    await sendPushNotifications(
      tokens,
      title,
      body,
      { category: 'content-update', contentType, contentId }
    );
  }
}
```

---

## Best Practices

### 1. Respect User Preferences

Always check user preferences before sending notifications:

```typescript
const { preferences } = useNotificationPreferences();

if (preferences.workoutReminders) {
  await scheduleWorkoutReminder(/* ... */);
}
```

### 2. Timing Matters

Send notifications when users are most likely to engage:

```typescript
import { isGoodNotificationTime } from '@/utils/notificationHelpers';

if (isGoodNotificationTime()) {
  await sendNotification(/* ... */);
} else {
  // Schedule for tomorrow morning
  await scheduleNotification(/* ... */);
}
```

### 3. Include Relevant Data

Always include data to enable proper deep linking:

```typescript
await sendNotification({
  title: 'Workout Ready!',
  body: 'Your workout is waiting',
  data: {
    category: 'workout-reminder',
    workoutId: 'abc123', // Used for navigation
  },
});
```

### 4. Use Appropriate Channels

Android requires notification channels. Use the appropriate channel for content type:

```typescript
await NotificationService.scheduleNotification({
  // ...
  categoryIdentifier: 'workout-reminders', // Android channel
});
```

Available channels:
- `default` - General notifications
- `workout-reminders` - Workout reminders (high priority)
- `achievements` - Achievements and milestones
- `measurement-reminders` - Measurement reminders
- `content-updates` - New content notifications (low priority)

### 5. Handle Notification Responses

The app automatically handles notification taps and routes to appropriate screens. Data is used to determine routing:

```typescript
// This notification will route to the workout detail screen when tapped
await sendNotification({
  title: 'Check out this workout!',
  body: 'New workout added',
  data: {
    category: 'content-update',
    contentType: 'workout',
    contentId: 'workout-123', // Will route to /solos/workout/workout-123
  },
});
```

### 6. Rate Limiting

Don't spam users. Implement rate limiting on your backend:

```typescript
// Example: Don't send more than 3 notifications per day per user
async function canSendNotification(userId, category) {
  const today = getStartOfDay();
  const count = await db.notificationLog.countDocuments({
    userId,
    category,
    sentAt: { $gte: today }
  });

  return count < 3;
}
```

### 7. Track Notification Delivery

When using Expo's push service, track tickets and receipts:

```typescript
// After sending notifications
const tickets = await expo.sendPushNotificationsAsync(messages);

// Check for errors
tickets.forEach((ticket, index) => {
  if (ticket.status === 'error') {
    console.error(
      `Error sending to ${messages[index].to}:`,
      ticket.message
    );
  }
});

// Later, check receipts (optional)
const receiptIds = tickets
  .filter(ticket => ticket.status === 'ok')
  .map(ticket => ticket.id);

const receipts = await expo.getPushNotificationReceiptsAsync(receiptIds);
```

---

## Testing Notifications

### Test Local Notifications

```typescript
// Test immediate notification
import NotificationService from '@/services/NotificationService';

await NotificationService.sendNotification({
  title: 'Test Notification',
  body: 'This is a test!',
});

// Test scheduled notification (1 minute from now)
await NotificationService.scheduleNotification({
  title: 'Test Scheduled',
  body: 'Scheduled 1 minute ago',
  trigger: {
    seconds: 60,
  },
});
```

### Test Push Notifications

Use Expo's push notification tool:

1. Get your push token from the app
2. Go to https://expo.dev/notifications
3. Enter your token and test message
4. Click "Send a Notification"

Or use curl:

```bash
curl -H "Content-Type: application/json" \
     -X POST https://exp.host/--/api/v2/push/send \
     -d '{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Test Notification",
  "body": "Testing from curl!",
  "data": {"category": "test"}
}'
```

### Debug Notification Issues

```typescript
// Check permissions
const hasPermission = await NotificationService.checkPermissions();
console.log('Has permission:', hasPermission);

// Check scheduled notifications
const scheduled = await NotificationService.getScheduledNotifications();
console.log('Scheduled:', scheduled);

// Check push token
const token = NotificationService.getPushToken();
console.log('Push token:', token);
```

---

## Integration with Backend API

To fully integrate notifications with your backend, you'll need these API endpoints:

### 1. Save Push Token

```
POST /users/{userId}/push-token
Body: { token: "ExponentPushToken[...]", type: "expo" }
```

### 2. Update Notification Preferences

```
PUT /users/{userId}/notification-preferences
Body: {
  workoutReminders: true,
  measurementReminders: true,
  achievements: true,
  contentUpdates: false
}
```

### 3. Send Notification (Admin)

```
POST /admin/notifications/send
Body: {
  userIds: ["user1", "user2"],
  title: "...",
  body: "...",
  data: {}
}
```

### 4. Schedule Notification (Admin)

```
POST /admin/notifications/schedule
Body: {
  userIds: ["user1"],
  title: "...",
  body: "...",
  scheduledFor: "2025-11-14T09:00:00Z",
  data: {}
}
```

---

## Notification Categories Reference

| Category | Use Case | Priority | Channel |
|----------|----------|----------|---------|
| `workout-reminder` | Daily workout reminders | High | workout-reminders |
| `measurement-reminder` | Weight, sleep, body measurement reminders | Default | measurement-reminders |
| `achievement` | Streaks, milestones, PRs | Default | achievements |
| `program-milestone` | Week completions, halfway points | Default | achievements |
| `content-update` | New programs/workouts | Low | content-updates |
| `inactivity` | Re-engagement messages | Default | default |
| `rest-day` | Motivational rest day messages | Default | default |

---

## Summary

**For Local Notifications:**
- Use `NotificationService` directly for scheduling
- Use helper functions in `notificationHelpers.ts` for common scenarios
- Local notifications don't require server infrastructure

**For Push Notifications:**
- Requires backend integration with Expo Push API
- Use push tokens stored in your database
- Implement automated rules as backend cron jobs or triggers

**Next Steps:**
1. Test local notifications in the app
2. Set up backend endpoints to store push tokens
3. Implement automated notification rules on your backend
4. Monitor notification delivery and engagement metrics
