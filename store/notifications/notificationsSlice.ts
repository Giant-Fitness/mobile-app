import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  NotificationPreferences,
  PushToken,
  ScheduledNotificationInfo,
} from '../../types/notificationTypes';

export interface NotificationsState {
  pushToken: PushToken | null;
  hasPermission: boolean;
  preferences: NotificationPreferences;
  scheduledNotifications: ScheduledNotificationInfo[];
  lastNotificationId: string | null;
}

const initialState: NotificationsState = {
  pushToken: null,
  hasPermission: false,
  preferences: {
    workoutReminders: true,
    measurementReminders: true,
    achievements: true,
    contentUpdates: true,
    inactivityReminders: true,
    restDayMotivation: true,
  },
  scheduledNotifications: [],
  lastNotificationId: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setPushToken: (state, action: PayloadAction<PushToken>) => {
      state.pushToken = action.payload;
    },
    setHasPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<NotificationPreferences>>
    ) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
    addScheduledNotification: (
      state,
      action: PayloadAction<ScheduledNotificationInfo>
    ) => {
      state.scheduledNotifications.push(action.payload);
    },
    removeScheduledNotification: (state, action: PayloadAction<string>) => {
      state.scheduledNotifications = state.scheduledNotifications.filter(
        (n) => n.identifier !== action.payload
      );
    },
    clearScheduledNotifications: (state) => {
      state.scheduledNotifications = [];
    },
    setLastNotificationId: (state, action: PayloadAction<string>) => {
      state.lastNotificationId = action.payload;
    },
    resetNotifications: (state) => {
      return initialState;
    },
  },
});

export const {
  setPushToken,
  setHasPermission,
  updatePreferences,
  setPreferences,
  addScheduledNotification,
  removeScheduledNotification,
  clearScheduledNotifications,
  setLastNotificationId,
  resetNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
