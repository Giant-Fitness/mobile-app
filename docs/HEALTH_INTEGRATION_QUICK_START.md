# Health Integration Quick Start Guide

## Overview

This document provides a quick start guide for the Apple Health and Health Connect integration.

## What Was Implemented

✅ **Complete health platform integration** with:
- Apple Health (iOS)
- Health Connect (Android)
- Read-only data sync (weight, sleep, body measurements)
- Source tracking for all data
- User settings screen
- Data source indicators in UI

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Rebuild Development Client

The native libraries require a custom development build:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 3. Backend Requirements

You'll need to implement these API endpoints:

- `GET /users/{userId}/health-settings`
- `PUT /users/{userId}/health-settings`
- `POST /users/{userId}/health-sync-events`

Add these optional fields to existing measurement tables:
- `DataSource` (string)
- `ExternalId` (string)
- `LastSyncedAt` (string)
- `IsModified` (boolean)

## How to Use

### For Users

1. Open app → Navigate to **Settings → Health Integration**
2. Toggle **Enable Sync**
3. Grant permissions when prompted
4. Data will automatically sync from health platforms

### For Developers

**Check if health platform is available:**
```typescript
import { healthPlatformManager } from '@/services/health';

const isAvailable = await healthPlatformManager.isHealthPlatformAvailable();
```

**Enable health integration:**
```typescript
import { enableHealthIntegration } from '@/store/health/thunks';

dispatch(enableHealthIntegration({ userId }));
```

**Trigger sync:**
```typescript
import { syncHealthData } from '@/store/health/thunks';

dispatch(syncHealthData({ userId, force: true }));
```

**Display data source in UI:**
```typescript
import { DataSourceIndicator } from '@/components/health';

<DataSourceIndicator
    dataSource={measurement.DataSource}
    isModified={measurement.IsModified}
/>
```

## File Structure

```
services/health/          # Health platform services
  ├── HealthPlatform.ts           # Interface
  ├── AppleHealthService.ts       # iOS implementation
  ├── HealthConnectService.ts     # Android implementation
  └── HealthPlatformManager.ts    # Platform selector

store/health/             # Redux state management
  ├── healthState.ts              # State interface
  ├── healthSlice.ts              # Reducers
  ├── thunks.ts                   # Async actions
  └── service.ts                  # API calls

components/health/        # UI components
  └── DataSourceIndicator.tsx     # Source badge

app/(app)/settings/       # Settings screens
  └── health-integration.tsx      # Health settings

types/userTypes.ts        # Updated with health types
```

## Key Concepts

### Data Source Tracking

Every measurement now has:
- `DataSource`: Where it came from (manual, apple_health, health_connect)
- `ExternalId`: Platform-specific ID for deduplication
- `LastSyncedAt`: When it was last synced
- `IsModified`: Whether user edited it after sync

### Sync Strategy

- **Initial Sync**: Last 30 days when user enables integration
- **Auto Sync**: Daily (configurable)
- **Manual Sync**: On-demand via "Sync Now" button
- **Deduplication**: Prevents duplicate entries
- **Edit Protection**: User-modified data is never overwritten

## Supported Data

| Data Type | iOS | Android | Notes |
|-----------|-----|---------|-------|
| Weight | ✅ | ✅ | Full support |
| Sleep | ✅ | ✅ | Includes sleep stages |
| Waist | ⚠️ | ✅ | Limited iOS support |
| Hip | ❌ | ✅ | Android only |

## Next Steps

### Integration Tasks

1. **Update Logging Sheets**: Add `DataSourceIndicator` to existing logging sheets
2. **Update Trend Cards**: Show source badges on data points
3. **Test on Devices**: Test with real health data on physical devices
4. **Backend Implementation**: Implement required API endpoints
5. **Documentation**: Update user-facing help docs

### Phase 2 Features

- Write-back support (save data TO health platforms)
- More data types (heart rate, body fat %, etc.)
- Direct wearable integration
- Advanced analytics

## Testing

### iOS Testing

1. Add sample data to Health app
2. Enable integration in app
3. Verify data appears in logging screens
4. Edit synced data
5. Re-sync and verify edit preserved

### Android Testing

1. Install Health Connect app
2. Add sample data (or connect another health app)
3. Enable integration
4. Verify sync works
5. Test manual sync

## Troubleshooting

**"Platform not available"**
- iOS: Requires iPhone, iOS 8.0+
- Android: Requires Android 8.0+, Health Connect installed

**"No data synced"**
- Check health platform has data
- Check date range (defaults to last 30 days)
- Check permissions were granted

**"Permissions denied"**
- User must grant permissions in system dialog
- Cannot be requested again programmatically
- User must enable in system settings

## Resources

- 📚 [Full Documentation](./HEALTH_INTEGRATION.md)
- 🍎 [Apple HealthKit Docs](https://developer.apple.com/documentation/healthkit)
- 🤖 [Health Connect Docs](https://developer.android.com/health-and-fitness/guides/health-connect)
- 📦 [react-native-health](https://github.com/agencyenterprise/react-native-health)
- 📦 [react-native-health-connect](https://github.com/matinzd/react-native-health-connect)

## Questions?

See [HEALTH_INTEGRATION.md](./HEALTH_INTEGRATION.md) for comprehensive documentation including:
- Detailed architecture diagrams
- API specifications
- Complete data models
- Testing strategies
- Deployment guides
- Troubleshooting guides

---

**Quick Start Version:** 1.0.0
**Last Updated:** January 15, 2025
