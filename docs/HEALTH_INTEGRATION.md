# Health Integration Engineering Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [Service Layer](#service-layer)
5. [State Management](#state-management)
6. [UI Components](#ui-components)
7. [Sync Strategy](#sync-strategy)
8. [API Integration](#api-integration)
9. [Platform-Specific Details](#platform-specific-details)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Future Enhancements](#future-enhancements)
13. [Troubleshooting](#troubleshooting)

---

## Overview

This document describes the implementation of Apple Health and Google Health Connect integration into the Kyn fitness application. The integration enables automatic synchronization of user health data including weight, sleep, and body measurements.

### Key Features

- ✅ **Read-only sync** from health platforms (Apple Health on iOS, Health Connect on Android)
- ✅ **Automatic background sync** with configurable frequency
- ✅ **Manual sync** on-demand
- ✅ **Source tracking** - all data is tagged with its origin
- ✅ **Edit protection** - user-modified data is not overwritten by sync
- ✅ **Privacy-first** - local storage only, no third-party sharing
- 🔮 **Write-back support** (future phase 2)

### Supported Data Types

| Data Type | iOS (Apple Health) | Android (Health Connect) | Notes |
|-----------|-------------------|-------------------------|-------|
| Weight | ✅ Full support | ✅ Full support | Stored in kg, displayed per user preference |
| Sleep | ✅ Full support with stages | ✅ Full support with stages | Duration, start/end times, optional sleep stages |
| Waist Circumference | ⚠️ Limited | ✅ Full support | iOS support requires custom bridge |
| Hip Circumference | ❌ Not supported | ✅ Full support | Android only |
| Other Body Measurements | ❌ Not supported | ❌ Not supported | Chest, neck, biceps, etc. remain manual-only |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  - Health Settings Screen                                    │
│  - Logging Sheets (Weight, Sleep, Body Measurements)         │
│  - Trend Cards & Detail Views                                │
│  - Data Source Indicators                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    State Management                          │
│  - Redux Store (health slice)                                │
│  - Async Thunks (permissions, sync, settings)                │
│  - Selectors & Actions                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    Service Layer                             │
│  - Health Platform Manager (platform selection)              │
│  - Apple Health Service (iOS)                                │
│  - Health Connect Service (Android)                          │
│  - API Service (backend integration)                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Platform SDKs                               │
│  - react-native-health (iOS)                                 │
│  - react-native-health-connect (Android)                     │
└─────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                Native Health Platforms                       │
│  - Apple HealthKit (iOS)                                     │
│  - Android Health Connect (Android 8.0+)                     │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
mobile-app/
├── services/
│   └── health/
│       ├── HealthPlatform.ts           # Interface definition
│       ├── AppleHealthService.ts       # iOS implementation
│       ├── HealthConnectService.ts     # Android implementation
│       ├── HealthPlatformManager.ts    # Platform selector
│       └── index.ts                    # Exports
├── store/
│   └── health/
│       ├── healthState.ts              # State interface
│       ├── healthSlice.ts              # Redux slice
│       ├── thunks.ts                   # Async actions
│       ├── service.ts                  # API calls
│       └── index.ts                    # Exports
├── components/
│   └── health/
│       ├── DataSourceIndicator.tsx     # Source badge component
│       └── index.ts                    # Exports
├── app/(app)/
│   └── settings/
│       └── health-integration.tsx      # Settings screen
├── types/
│   └── userTypes.ts                    # Type definitions (updated)
└── docs/
    └── HEALTH_INTEGRATION.md           # This file
```

---

## Data Model

### TypeScript Interfaces

#### DataSource Enum

```typescript
export enum DataSource {
    MANUAL = 'manual',
    APPLE_HEALTH = 'apple_health',
    HEALTH_CONNECT = 'health_connect',
}
```

#### UserWeightMeasurement

```typescript
export interface UserWeightMeasurement {
    UserId: string;
    MeasurementTimestamp: string;  // ISO 8601
    Weight: number;                 // Always in kg

    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string;           // Platform-specific ID
    LastSyncedAt?: string;         // ISO 8601
    IsModified?: boolean;          // True if user edited synced data
}
```

#### UserSleepMeasurement

```typescript
export interface UserSleepMeasurement {
    UserId: string;
    MeasurementTimestamp: string;
    DurationInMinutes: number;
    SleepTime?: string;            // ISO 8601
    WakeTime?: string;             // ISO 8601

    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string;
    LastSyncedAt?: string;
    IsModified?: boolean;
    SleepStages?: SleepStages;     // Optional breakdown
}

export interface SleepStages {
    deep?: number;     // minutes
    rem?: number;      // minutes
    light?: number;    // minutes
    awake?: number;    // minutes
}
```

#### UserBodyMeasurement

```typescript
export interface UserBodyMeasurement {
    UserId: string;
    MeasurementTimestamp: string;

    // Measurements (in cm)
    waist?: number;
    hip?: number;
    chest?: number;
    neck?: number;
    shoulder?: number;
    abdomen?: number;
    leftBicep?: number;
    rightBicep?: number;
    leftThigh?: number;
    rightThigh?: number;
    leftCalf?: number;
    rightCalf?: number;
    waistHipRatio?: number;

    UpdatedAt: string;

    // Health integration fields
    DataSource?: DataSource;
    ExternalId?: string;
    LastSyncedAt?: string;
    IsModified?: boolean;
}
```

#### UserHealthIntegrationSettings

```typescript
export interface UserHealthIntegrationSettings {
    UserId: string;

    // Apple Health
    AppleHealthEnabled?: boolean;
    AppleHealthConnectedAt?: string;
    AppleHealthLastSyncAt?: string;

    // Health Connect
    HealthConnectEnabled?: boolean;
    HealthConnectConnectedAt?: string;
    HealthConnectLastSyncAt?: string;

    // Sync preferences
    AutoSyncEnabled?: boolean;
    SyncFrequency?: 'daily' | 'hourly' | 'manual';
    SyncHistoryDays?: number;      // Default: 30

    // Write-back (future)
    WriteBackEnabled?: boolean;
    WriteBackDataTypes?: Array<'weight' | 'sleep' | 'body_measurements'>;
}
```

### Database Schema Changes

The following fields need to be added to existing DynamoDB tables:

**WeightMeasurements Table:**
```
+ DataSource: String (optional)
+ ExternalId: String (optional)
+ LastSyncedAt: String (ISO timestamp, optional)
+ IsModified: Boolean (optional, default: false)
```

**SleepMeasurements Table:**
```
+ DataSource: String (optional)
+ ExternalId: String (optional)
+ LastSyncedAt: String (ISO timestamp, optional)
+ IsModified: Boolean (optional, default: false)
+ SleepStages: Map (optional)
  - deep: Number
  - rem: Number
  - light: Number
  - awake: Number
```

**BodyMeasurements Table:**
```
+ DataSource: String (optional)
+ ExternalId: String (optional)
+ LastSyncedAt: String (ISO timestamp, optional)
+ IsModified: Boolean (optional, default: false)
```

**New Table: HealthIntegrationSettings**
```
PK: UserId (String)
SK: "SETTINGS" (String)

Attributes:
- UserId: String
- AppleHealthEnabled: Boolean
- AppleHealthConnectedAt: String (ISO timestamp)
- AppleHealthLastSyncAt: String (ISO timestamp)
- HealthConnectEnabled: Boolean
- HealthConnectConnectedAt: String (ISO timestamp)
- HealthConnectLastSyncAt: String (ISO timestamp)
- AutoSyncEnabled: Boolean
- SyncFrequency: String ('daily' | 'hourly' | 'manual')
- SyncHistoryDays: Number
- WriteBackEnabled: Boolean
- WriteBackDataTypes: List<String>
```

---

## Service Layer

### IHealthPlatform Interface

The core abstraction that both iOS and Android services implement:

```typescript
export interface IHealthPlatform {
    getPlatformName(): string;
    getDataSource(): DataSource;
    isAvailable(): Promise<boolean>;
    requestPermissions(permissions: HealthPermissions): Promise<boolean>;
    checkPermissions(permissions: HealthPermissions): Promise<HealthPermissions>;
    syncWeightData(options: SyncOptions): Promise<WeightSample[]>;
    syncSleepData(options: SyncOptions): Promise<SleepSample[]>;
    syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]>;

    // Optional write-back methods (future)
    writeWeightData?(weight: number, timestamp: string): Promise<boolean>;
    writeSleepData?(startTime: string, endTime: string): Promise<boolean>;
}
```

### Apple Health Service (iOS)

**File:** `services/health/AppleHealthService.ts`

**Key Methods:**

```typescript
// Initialize and request permissions
async requestPermissions(permissions: HealthPermissions): Promise<boolean>

// Sync weight data
async syncWeightData(options: SyncOptions): Promise<WeightSample[]>
// Returns: Array of weight samples with value (kg), timestamp, id, source

// Sync sleep data
async syncSleepData(options: SyncOptions): Promise<SleepSample[]>
// Returns: Array of sleep sessions with start/end times, duration, stages

// Sync body measurements (limited support)
async syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]>
// Returns: Empty array (waist circumference requires custom bridge)
```

**Data Transformations:**

- Weight: HealthKit returns in kg → No conversion needed
- Sleep: Aggregates multiple sleep samples per day, maps sleep stages (INBED, ASLEEP, DEEP, REM, CORE)
- Timestamps: Converts to ISO 8601 format

**Limitations:**

- Waist circumference not directly exposed by react-native-health library
- Hip circumference not available in HealthKit
- Sleep stages may not always be available (depends on device/app)

### Health Connect Service (Android)

**File:** `services/health/HealthConnectService.ts`

**Key Methods:**

```typescript
// Initialize and request permissions
async requestPermissions(permissions: HealthPermissions): Promise<boolean>

// Sync weight data
async syncWeightData(options: SyncOptions): Promise<WeightSample[]>
// Returns: Array of weight records with value (kg), timestamp, id, source

// Sync sleep data
async syncSleepData(options: SyncOptions): Promise<SleepSample[]>
// Returns: Array of sleep sessions with stages mapped

// Sync body measurements
async syncBodyMeasurements(options: SyncOptions): Promise<BodyMeasurementSample[]>
// Returns: Combined waist + hip measurements by date
```

**Data Transformations:**

- Weight: Health Connect stores in kg → No conversion needed
- Sleep: Maps stage types (1=DEEP, 2=LIGHT, 3=REM, 4=AWAKE)
- Body measurements: Converts meters to cm (Health Connect uses meters)
- Groups measurements by date for efficiency

**Requirements:**

- Android 8.0+ (API level 26)
- Health Connect app installed (built-in on Android 14+)

### Health Platform Manager

**File:** `services/health/HealthPlatformManager.ts`

Automatically selects the correct platform service based on OS:

```typescript
const platform = healthPlatformManager.getPlatform();
// Returns AppleHealthService on iOS, HealthConnectService on Android

const isAvailable = await healthPlatformManager.isHealthPlatformAvailable();
// Checks if platform is available on current device

const platformName = healthPlatformManager.getPlatformName();
// Returns "Apple Health", "Health Connect", or "Unsupported"
```

---

## State Management

### Health State Structure

```typescript
export interface HealthState {
    settings: UserHealthIntegrationSettings | null;
    isPlatformAvailable: boolean;
    platformName: string;
    isSyncing: boolean;
    lastSyncTimestamp: string | null;
    syncError: string | null;
    settingsLoadingState: LoadingState;
    syncLoadingState: LoadingState;
    permissionLoadingState: LoadingState;
    error: string | null;
}
```

### Redux Thunks

**Check Platform Availability:**
```typescript
dispatch(checkHealthPlatformAvailability())
```

**Request Permissions:**
```typescript
dispatch(requestHealthPermissions({
    weight: true,
    sleep: true,
    bodyMeasurements: true
}))
```

**Enable Integration:**
```typescript
dispatch(enableHealthIntegration({ userId }))
// Checks availability, requests permissions, updates settings, triggers initial sync
```

**Disable Integration:**
```typescript
dispatch(disableHealthIntegration({ userId }))
// Updates settings to disable sync
```

**Sync Health Data:**
```typescript
dispatch(syncHealthData({ userId, force: true }))
// Fetches data from health platform and returns samples for processing
```

**Fetch/Update Settings:**
```typescript
dispatch(fetchHealthSettings(userId))
dispatch(updateHealthSettings({ userId, settings }))
```

### Selectors

```typescript
// Get health integration status
const isHealthEnabled = useAppSelector(state =>
    state.health.settings?.AppleHealthEnabled ||
    state.health.settings?.HealthConnectEnabled
);

// Get sync status
const isSyncing = useAppSelector(state => state.health.isSyncing);
const lastSync = useAppSelector(state => state.health.lastSyncTimestamp);

// Get errors
const error = useAppSelector(state => state.health.error);
const syncError = useAppSelector(state => state.health.syncError);
```

---

## UI Components

### Health Settings Screen

**Location:** `app/(app)/settings/health-integration.tsx`

**Features:**
- Platform availability check
- Enable/disable toggle
- Manual sync button
- Sync status display
- Last sync timestamp
- Data type information

**Usage:**
```tsx
import { router } from 'expo-router';

// Navigate to health settings
router.push('/settings/health-integration');
```

### Data Source Indicator

**Location:** `components/health/DataSourceIndicator.tsx`

**Components:**

1. **DataSourceIndicator** - Full label with icon
```tsx
<DataSourceIndicator
    dataSource={DataSource.APPLE_HEALTH}
    isModified={false}
    showLabel={true}
    size="medium"
/>
```

2. **DataSourceBadge** - Compact emoji badge
```tsx
<DataSourceBadge
    dataSource={DataSource.APPLE_HEALTH}
    isModified={true}
    compact={true}
/>
```

**Appearance:**
- Manual: `✎ Manual`
- Apple Health: `🍏 Apple Health`
- Health Connect: `🤖 Health Connect`
- Modified: Adds `(Edited)` or `⚠️`

### Integration with Existing Screens

**Logging Sheets:**
Add data source indicator to show where existing data came from:

```tsx
import { DataSourceIndicator } from '@/components/health';

// In WeightLoggingSheet.tsx
{existingWeight && (
    <DataSourceIndicator
        dataSource={existingWeight.DataSource}
        isModified={existingWeight.IsModified}
    />
)}
```

**Trend Cards:**
Add small badge to individual data points:

```tsx
import { DataSourceBadge } from '@/components/health';

// In chart or list rendering
{measurements.map(m => (
    <View>
        <Text>{m.Weight} kg</Text>
        <DataSourceBadge
            dataSource={m.DataSource}
            compact
        />
    </View>
))}
```

---

## Sync Strategy

### Sync Flow

```
1. User enables health integration
   ↓
2. Request permissions from platform
   ↓
3. Update settings in backend
   ↓
4. Trigger initial sync (last 30 days)
   ↓
5. Fetch data from platform
   ↓
6. Process and deduplicate
   ↓
7. Insert new records via existing APIs
   ↓
8. Update sync timestamp
```

### Deduplication Logic

**Matching Criteria:**

For Weight:
- Same timestamp (±1 minute tolerance)
- Same value (±0.1 kg tolerance)

For Sleep:
- Same date (based on wake time)
- Overlapping time range

For Body Measurements:
- Same date
- Same measurement type

**Conflict Resolution:**

| Scenario | Action |
|----------|--------|
| New data, no local entry | **Insert** with DataSource = platform |
| Existing entry, IsModified = false | **Update** if platform data newer |
| Existing entry, IsModified = true | **Skip**, preserve user edit |
| Identical timestamp + value | **Skip**, already synced |

**Implementation:**
```typescript
// Pseudo-code
const existingRecord = findByTimestamp(newRecord.timestamp);

if (!existingRecord) {
    // New record
    insert(newRecord);
} else if (existingRecord.IsModified) {
    // User edited, don't overwrite
    skip();
} else {
    // Check if data is different
    if (isDifferent(existingRecord, newRecord)) {
        update(newRecord);
    }
}
```

### Sync Triggers

1. **Initial Sync:** When user enables integration
2. **App Launch:** If auto-sync enabled and 24h since last sync
3. **Manual Sync:** User presses "Sync Now" button
4. **Logging Screen Open:** Quick sync for current date range (future)

### Background Sync

**iOS:**
- Use background fetch capability
- Configure in `UIBackgroundModes` (already added)
- Health data background delivery via HealthKit observer queries

**Android:**
- Use WorkManager for periodic sync
- Respect battery optimization settings
- Health Connect provides change tokens for incremental sync

---

## API Integration

### Backend Endpoints

The following endpoints need to be implemented on your AWS backend:

**Health Settings:**
```
GET    /users/{userId}/health-settings
PUT    /users/{userId}/health-settings
```

**Sync Event Logging:**
```
POST   /users/{userId}/health-sync-events
```

### Request/Response Examples

**Get Health Settings:**
```http
GET /users/{userId}/health-settings

Response:
{
    "UserId": "user123",
    "AppleHealthEnabled": true,
    "AppleHealthConnectedAt": "2025-01-15T10:00:00Z",
    "AppleHealthLastSyncAt": "2025-01-15T14:30:00Z",
    "AutoSyncEnabled": true,
    "SyncFrequency": "daily",
    "SyncHistoryDays": 30,
    "WriteBackEnabled": false
}
```

**Update Health Settings:**
```http
PUT /users/{userId}/health-settings

Body:
{
    "AppleHealthEnabled": true,
    "AppleHealthConnectedAt": "2025-01-15T10:00:00Z",
    "AutoSyncEnabled": true
}

Response: (same as GET)
```

**Record Sync Event:**
```http
POST /users/{userId}/health-sync-events

Body:
{
    "platform": "apple_health",
    "weightCount": 15,
    "sleepCount": 7,
    "bodyMeasurementCount": 0,
    "timestamp": "2025-01-15T14:30:00Z"
}

Response: 204 No Content
```

### Using Existing Measurement APIs

After fetching samples from the health platform, use your existing APIs to insert data:

**Weight:**
```http
POST /users/{userId}/weight-measurements

Body:
{
    "weight": 75.5,
    "MeasurementTimestamp": "2025-01-15T08:00:00Z",
    "DataSource": "apple_health",
    "ExternalId": "ABC123",
    "LastSyncedAt": "2025-01-15T14:30:00Z",
    "IsModified": false
}
```

**Sleep:**
```http
POST /users/{userId}/sleep-measurements

Body:
{
    "MeasurementTimestamp": "2025-01-15T07:00:00Z",
    "durationInMinutes": 480,
    "sleepTime": "2025-01-14T23:00:00Z",
    "wakeTime": "2025-01-15T07:00:00Z",
    "DataSource": "apple_health",
    "ExternalId": "DEF456",
    "SleepStages": {
        "deep": 120,
        "rem": 90,
        "light": 210,
        "awake": 60
    }
}
```

**Body Measurements:**
```http
POST /users/{userId}/body-measurements

Body:
{
    "MeasurementTimestamp": "2025-01-15T09:00:00Z",
    "measurements": {
        "waist": 85,
        "hip": 95
    },
    "DataSource": "health_connect",
    "ExternalId": "GHI789"
}
```

---

## Platform-Specific Details

### iOS Configuration

**app.json:**
```json
{
    "expo": {
        "ios": {
            "infoPlist": {
                "NSHealthShareUsageDescription": "We need access to your health data to automatically log your weight, sleep, and body measurements from Apple Health.",
                "NSHealthUpdateUsageDescription": "We would like to save your logged health data to Apple Health for your records.",
                "UIBackgroundModes": ["fetch", "remote-notification"]
            },
            "entitlements": {
                "com.apple.developer.healthkit": true
            }
        },
        "plugins": [
            ["react-native-health", {
                "isBackgroundDeliveryEnabled": true
            }]
        ]
    }
}
```

**Capabilities Required:**
- HealthKit
- Background fetch
- Background processing

**Privacy Considerations:**
- Must have privacy policy accessible in app
- Cannot use health data for advertising
- Cannot sell health data
- Granular permission requests per data type

### Android Configuration

**app.json:**
```json
{
    "expo": {
        "android": {
            "permissions": [
                "android.permission.health.READ_WEIGHT",
                "android.permission.health.READ_HEIGHT",
                "android.permission.health.READ_SLEEP",
                "android.permission.health.READ_BODY_FAT",
                "android.permission.health.READ_WAIST_CIRCUMFERENCE",
                "android.permission.health.READ_HIP_CIRCUMFERENCE"
            ]
        },
        "plugins": [
            "react-native-health-connect"
        ]
    }
}
```

**AndroidManifest.xml additions:**
```xml
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

**Requirements:**
- minSdkVersion 26 (Android 8.0)
- Health Connect app (built-in on Android 14+, downloadable on older versions)

**Privacy Considerations:**
- Data stored locally on device
- User controls all permissions via Health Connect settings
- Transparent data access logs

---

## Testing Strategy

### Unit Tests

**Health Services:**
```typescript
describe('AppleHealthService', () => {
    it('should sync weight data within date range', async () => {
        const service = new AppleHealthService();
        const samples = await service.syncWeightData({
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-31')
        });

        expect(samples).toBeDefined();
        expect(samples.length).toBeGreaterThan(0);
        expect(samples[0].value).toBeGreaterThan(0);
    });
});
```

**Redux Thunks:**
```typescript
describe('health thunks', () => {
    it('should enable health integration', async () => {
        const result = await store.dispatch(
            enableHealthIntegration({ userId: 'test123' })
        );

        expect(result.type).toBe('health/enable/fulfilled');
        expect(result.payload.AppleHealthEnabled).toBe(true);
    });
});
```

### Integration Tests

1. **Permission Flow:**
   - Request permissions → Check granted
   - Deny permissions → Handle error gracefully

2. **Sync Flow:**
   - Enable integration → Trigger sync → Verify data inserted
   - Sync with existing data → Verify deduplication works
   - Sync with modified data → Verify user edits preserved

3. **UI Flow:**
   - Navigate to settings → Toggle integration → Verify state updates
   - Trigger manual sync → Verify loading states

### Manual Testing Checklist

**iOS:**
- [ ] Install TestFlight build
- [ ] Open Health app, add sample data
- [ ] Enable integration in app
- [ ] Verify data appears in logging screens
- [ ] Edit synced data, re-sync, verify edit preserved
- [ ] Disable integration
- [ ] Check background sync (wait 24h)

**Android:**
- [ ] Install APK on Android 8.0+ device
- [ ] Install Health Connect app (if needed)
- [ ] Add data via Health Connect or connected apps
- [ ] Enable integration in app
- [ ] Verify data appears
- [ ] Test manual sync
- [ ] Check permissions in system settings

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Run TypeScript checks: `npx tsc --noEmit`
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Update privacy policy
- [ ] Prepare app store screenshots
- [ ] Update app descriptions

### Build Commands

**iOS:**
```bash
# Development build
npx expo run:ios

# Production build (via EAS)
eas build --platform ios --profile production
```

**Android:**
```bash
# Development build
npx expo run:android

# Production build (via EAS)
eas build --platform android --profile production
```

### Backend Deployment

1. **Database Migrations:**
   - Add new fields to existing DynamoDB tables
   - Create HealthIntegrationSettings table
   - Create HealthSyncEvents table (optional, for analytics)

2. **API Endpoints:**
   - Deploy health settings endpoints
   - Deploy sync event logging endpoint
   - Update existing measurement endpoints to accept new fields

3. **Lambda Functions:**
   - Create sync scheduler Lambda (optional)
   - Create analytics Lambda for sync events

### App Store Submission

**iOS App Store:**
- Add HealthKit usage descriptions to App Store Connect
- Provide screenshots showing health integration
- Mention Apple Health integration in description
- Submit for review (health apps may have longer review time)

**Google Play Store:**
- Declare Health Connect permissions in Play Console
- Add screenshots showing health integration
- Provide data safety form (health data is sensitive)
- Submit for review

### Post-Deployment Monitoring

**Metrics to Track:**
- Health integration adoption rate
- Sync success/failure rate
- Permission grant/deny rate
- Average data volume per sync
- Errors and crash reports related to health sync

**Logging:**
```typescript
// Example: Log sync events
console.log('[Health Sync] Starting sync', {
    userId,
    platform,
    dateRange: { startDate, endDate }
});

console.log('[Health Sync] Completed', {
    userId,
    platform,
    weightCount,
    sleepCount,
    bodyMeasurementCount,
    duration: Date.now() - startTime
});
```

---

## Future Enhancements

### Phase 2: Write-Back Support

**Scope:**
- Write weight measurements to health platforms
- Write sleep data to health platforms
- Opt-in user setting
- Selective data type write-back

**Implementation:**
```typescript
// Add to settings
interface UserHealthIntegrationSettings {
    // ... existing fields
    WriteBackEnabled?: boolean;
    WriteBackDataTypes?: Array<'weight' | 'sleep' | 'body_measurements'>;
}

// Use write methods in services
if (settings.WriteBackEnabled && settings.WriteBackDataTypes.includes('weight')) {
    await platform.writeWeightData(weight, timestamp);
}
```

**Considerations:**
- Only write back manual entries (DataSource = MANUAL)
- Add confirmation dialog before enabling
- Track write-back success/failure
- Handle write permission denial

### Phase 3: Additional Data Types

**Potential additions:**
- Body fat percentage
- BMI
- Heart rate
- Blood pressure
- Nutrition data
- Activity/exercise data
- Steps
- Active calories

### Phase 4: Wearable Integration

- Direct integration with Apple Watch
- Fitbit integration
- Garmin integration
- Oura Ring integration
- Whoop integration

### Phase 5: Analytics & Insights

- Correlation analysis (sleep vs performance)
- Trend detection
- Anomaly detection
- Predictive insights
- Goal recommendations based on health data

### Phase 6: Advanced Features

- Real-time sync (webhooks/observers)
- Offline sync queue
- Conflict resolution UI
- Data export (HIPAA compliant)
- Family sharing

---

## Troubleshooting

### Common Issues

**Issue: "Health platform not available"**
- **iOS:** Device must be iPhone (not iPad), iOS 8.0+
- **Android:** Device must have Android 8.0+, Health Connect must be installed
- **Solution:** Guide user to install Health Connect or upgrade OS

**Issue: "Permissions denied"**
- User declined permissions in system dialog
- **Solution:** Show educational prompt, link to system settings, allow re-request

**Issue: "No data synced"**
- Health platform has no data
- Date range doesn't include available data
- **Solution:** Check data availability in health app, adjust date range

**Issue: "Duplicate entries appearing"**
- Deduplication logic not working
- **Solution:** Check timestamp tolerance, verify ExternalId is being stored

**Issue: "User edits being overwritten"**
- IsModified flag not being set/checked
- **Solution:** Ensure Edit APIs set IsModified=true, check conflict resolution

**Issue: "Background sync not working"**
- **iOS:** Background capabilities not configured, permissions not granted
- **Android:** Battery optimization blocking background work
- **Solution:** Check capabilities, request battery optimization exemption

### Debug Commands

**Check health platform availability:**
```typescript
const isAvailable = await healthPlatformManager.isHealthPlatformAvailable();
console.log('Platform available:', isAvailable);
```

**Check permissions:**
```typescript
const permissions = await platform.checkPermissions({
    weight: true,
    sleep: true,
    bodyMeasurements: true
});
console.log('Permissions:', permissions);
```

**Test sync:**
```typescript
const samples = await platform.syncWeightData({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
});
console.log('Synced samples:', samples);
```

### Logging Best Practices

Add debug logs throughout sync process:

```typescript
if (__DEV__) {
    console.log('[Health] Requesting permissions:', permissions);
    console.log('[Health] Sync starting:', { startDate, endDate });
    console.log('[Health] Fetched samples:', samples.length);
    console.log('[Health] Deduplication result:', { inserted, skipped, updated });
    console.log('[Health] Sync completed:', { duration, errors });
}
```

### Support Resources

- Apple HealthKit Documentation: https://developer.apple.com/documentation/healthkit
- Health Connect Documentation: https://developer.android.com/health-and-fitness/guides/health-connect
- react-native-health GitHub: https://github.com/agencyenterprise/react-native-health
- react-native-health-connect GitHub: https://github.com/matinzd/react-native-health-connect

---

## Appendix

### Libraries Used

| Library | Version | Purpose |
|---------|---------|---------|
| react-native-health | ^1.19.0 | Apple HealthKit integration |
| react-native-health-connect | ^2.1.0 | Android Health Connect integration |
| date-fns | ^4.1.0 | Date manipulation |
| @reduxjs/toolkit | ^2.2.7 | State management |

### Code Owners

| Component | Owner | Contact |
|-----------|-------|---------|
| iOS Service | iOS Team | ios@example.com |
| Android Service | Android Team | android@example.com |
| Backend APIs | Backend Team | backend@example.com |
| UI Components | Frontend Team | frontend@example.com |

### Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-15 | 1.0.0 | Initial implementation |

### References

- [Apple HealthKit Best Practices](https://developer.apple.com/documentation/healthkit/protecting_user_privacy)
- [Health Connect Privacy Guidelines](https://developer.android.com/health-and-fitness/guides/health-connect/develop/privacy-policy)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/index.html)

---

**Last Updated:** January 15, 2025
**Document Version:** 1.0.0
**Author:** Claude (Anthropic)
