# New Features Guide - Real-time Bus Tracking & Student Portal

## 🎉 Overview

This document describes the new features added to the My School Ride system:

1. **Student Portal** - Students can track their assigned bus and other buses on their route
2. **Real-time Location Tracking** - 24-hour GPS history with automatic cleanup
3. **Live Dashboard Analytics** - Hourly vehicle activity chart with real database data
4. **ETA Calculation** - Estimated time of arrival for buses approaching stops
5. **Missed Bus Detection** - Alerts when a bus may have passed the stop

---

## 🚌 Feature 1: Student Portal

### Access
Navigate to: `/student`

### Features

#### 1. Student Login
- Students log in using their **Student Number**
- System validates the student exists and has an assigned route
- Displays welcome message with student name

#### 2. My Route Information Card
Shows:
- Route name and code
- Pickup stop name
- Scheduled pickup time

#### 3. Buses on Your Route
- **Real-time list** of all buses currently active on the student's route
- Each bus card shows:
  - Plate number
  - Model
  - Status badge (Active/Completed/etc.)
  - Last update time
  - Current speed
- **Auto-refresh** every 10 seconds
- Click any bus to view detailed tracking

#### 4. Bus Details View
When a bus is selected:
- **Distance** to pickup stop (in km)
- **ETA** (Estimated Time of Arrival in minutes)
- **Status** indicator:
  - "Approaching!" (within 1km)
  - "On the way" (more than 1km away)
- **Missed Bus Alert**: Shows warning if bus may have passed the stop

#### 5. Get Directions Button
- Opens Google Maps with:
  - Current bus location as origin
  - Student's pickup stop as destination
  - Driving directions
  - Real-time ETA from Google Maps

### How It Works

```typescript
// Student logs in with student number
const student = await studentPortalApi.getStudentByNumber('STU001');

// System fetches bus info
const busInfo = await studentPortalApi.getStudentBusInfo(student.id);

// Get all vehicles on the route
const vehicles = await locationTrackingApi.getVehiclesOnRoute(route.id);

// Calculate ETA
const eta = await studentPortalApi.calculateETA(
  busLat, busLng, stopLat, stopLng, currentSpeed
);
```

### Testing the Student Portal

1. **Create a student** in the Students section
2. **Assign a route and pickup stop** to the student
3. **Create a vehicle** and assign it to the same route
4. **Start a trip** for that vehicle
5. **Add location data** (see Location Tracking section)
6. **Login** to Student Portal using the student number

---

## 📍 Feature 2: Real-time Location Tracking

### Database Tables

#### `vehicle_location_history`
Stores GPS coordinates with 24-hour retention:
- `vehicle_id` - Which bus
- `trip_id` - Which trip (optional)
- `latitude` / `longitude` - GPS coordinates
- `speed` - Current speed in km/h
- `heading` - Direction (0-360 degrees)
- `accuracy` - GPS accuracy in meters
- `recorded_at` - Timestamp

#### `hourly_vehicle_activity`
Aggregated statistics for dashboard:
- `hour_timestamp` - Hour bucket (e.g., 2024-01-01 14:00:00)
- `active_vehicle_count` - Number of active vehicles
- `total_trips` - Number of trips in that hour

### API Functions

#### Record Location
```typescript
await locationTrackingApi.recordLocation({
  vehicle_id: 'uuid',
  trip_id: 'uuid', // optional
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 30,
  heading: 45,
  accuracy: 10
});
```

#### Get Latest Location
```typescript
const location = await locationTrackingApi.getLatestLocation(vehicleId);
// Returns: { latitude, longitude, speed, heading, recorded_at }
```

#### Get Vehicle History
```typescript
const history = await locationTrackingApi.getVehicleHistory(vehicleId, 24);
// Returns last 24 hours of location data
```

#### Get Vehicles on Route
```typescript
const vehicles = await locationTrackingApi.getVehiclesOnRoute(routeId);
// Returns all active vehicles with latest location
```

### Automatic Cleanup

The system automatically removes location data older than 24 hours:

```sql
-- Run this function periodically (e.g., via cron job)
SELECT cleanup_old_location_data();
```

### Simulating Bus Movement (For Testing)

```sql
-- Insert sample location data
INSERT INTO vehicle_location_history (
  vehicle_id,
  latitude,
  longitude,
  speed,
  heading,
  recorded_at
) VALUES (
  'your-vehicle-uuid',
  40.7128,  -- New York City latitude
  -74.0060, -- New York City longitude
  30,       -- 30 km/h
  45,       -- Northeast direction
  now()
);
```

---

## 📊 Feature 3: Live Dashboard Analytics

### Hourly Active Vehicles Chart

The dashboard now shows **real-time data** from the database instead of static mock data.

#### Features:
- **Live Badge** - Indicates real-time data
- **24-hour view** - Shows last 24 hours of activity
- **Auto-refresh** - Updates every 30 seconds
- **Empty state** - Shows message when no data available

#### How It Works:

```typescript
// Fetch hourly activity data
const hourlyData = await hourlyActivityApi.getHourlyData(24);

// Data is automatically formatted for the chart
const chartData = hourlyData.map(item => ({
  hour: formatTime(item.hour_timestamp),
  vehicles: item.active_vehicle_count,
  trips: item.total_trips
}));
```

#### Aggregating Current Hour

```sql
-- This function aggregates the current hour's activity
SELECT aggregate_hourly_vehicle_activity();
```

**Recommended**: Run this function every hour via a cron job or scheduled task.

### Sample Data Generation

To populate the chart with sample data:

```sql
-- Generate sample hourly data for last 24 hours
INSERT INTO hourly_vehicle_activity (hour_timestamp, active_vehicle_count, total_trips)
SELECT 
  date_trunc('hour', now() - (interval '1 hour' * generate_series(0, 23))),
  FLOOR(RANDOM() * 10 + 1)::int,
  FLOOR(RANDOM() * 8 + 1)::int
ON CONFLICT (hour_timestamp) DO UPDATE SET
  active_vehicle_count = EXCLUDED.active_vehicle_count,
  total_trips = EXCLUDED.total_trips;
```

---

## 🧮 Feature 4: ETA Calculation

### Haversine Distance Formula

The system uses the Haversine formula to calculate the distance between two GPS coordinates:

```typescript
const R = 6371; // Earth's radius in km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lng2 - lng1) * Math.PI / 180;
const a = 
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distance = R * c; // Distance in km
```

### ETA Calculation

```typescript
const eta = await studentPortalApi.calculateETA(
  vehicleLat,    // Bus current latitude
  vehicleLng,    // Bus current longitude
  stopLat,       // Stop latitude
  stopLng,       // Stop longitude
  currentSpeed   // Bus current speed in km/h
);

// Returns:
{
  distance_km: 2.5,        // Distance in kilometers
  eta_minutes: 5,          // Estimated time in minutes
  is_approaching: false    // True if within 1km
}
```

### Default Speed

If the bus is stationary (speed = 0), the system assumes an average speed of **30 km/h** for ETA calculation.

---

## ⚠️ Feature 5: Missed Bus Detection

### How It Works

The system detects if a bus may have passed the student's stop based on:

1. **Distance**: Bus is more than 5km away from the stop
2. **Heading**: Bus has a valid heading (direction)

### Visual Indicator

When a bus is detected as "missed":
- Red alert box appears
- Shows message: "This bus may have passed your stop"
- Icon: AlertCircle in red

### Logic

```typescript
const isBusMissed = (vehicle: VehicleOnRoute) => {
  if (!etaInfo || !studentInfo?.pickup_stop?.location) return false;
  
  // Simple check: if distance > 5km and bus has a heading
  return etaInfo.distance_km > 5 && vehicle.latest_heading !== null;
};
```

**Note**: This is a simplified version. In production, you would use more sophisticated logic considering:
- Route sequence
- Stop order
- Historical patterns
- Geofencing

---

## 🔧 Database Functions Reference

### `get_vehicles_on_route(route_id)`
Returns all vehicles currently active on a specific route with their latest location.

```sql
SELECT * FROM get_vehicles_on_route('route-uuid');
```

### `get_latest_vehicle_location(vehicle_id)`
Returns the most recent location for a specific vehicle.

```sql
SELECT * FROM get_latest_vehicle_location('vehicle-uuid');
```

### `cleanup_old_location_data()`
Removes location data older than 24 hours.

```sql
SELECT cleanup_old_location_data();
```

### `aggregate_hourly_vehicle_activity()`
Aggregates the current hour's vehicle activity statistics.

```sql
SELECT aggregate_hourly_vehicle_activity();
```

---

## 📱 Integration with Mobile Apps

### Driver App Integration

The driver app should:

1. **Record location every 3-5 seconds** during active trips:
```typescript
setInterval(async () => {
  const position = await getCurrentPosition();
  await locationTrackingApi.recordLocation({
    vehicle_id: driverVehicleId,
    trip_id: activeTripId,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    speed: position.coords.speed * 3.6, // Convert m/s to km/h
    heading: position.coords.heading,
    accuracy: position.coords.accuracy
  });
}, 3000); // Every 3 seconds
```

2. **Use background location services** to continue tracking when app is in background

3. **Stop recording** when trip ends

### Parent App Integration

Parents can use the same Student Portal interface to track their child's bus.

---

## 🎯 Testing Checklist

### Student Portal
- [ ] Student can login with student number
- [ ] Route information displays correctly
- [ ] Buses on route appear in real-time
- [ ] Clicking a bus shows details
- [ ] ETA calculates correctly
- [ ] "Get Directions" opens Google Maps
- [ ] Missed bus alert appears when appropriate
- [ ] Auto-refresh works (every 10 seconds)

### Location Tracking
- [ ] Location data can be inserted
- [ ] Latest location can be retrieved
- [ ] Vehicle history shows last 24 hours
- [ ] Vehicles on route query works
- [ ] Old data is cleaned up after 24 hours

### Dashboard Analytics
- [ ] Hourly chart displays real data
- [ ] Chart shows last 24 hours
- [ ] "Live" badge is visible
- [ ] Empty state shows when no data
- [ ] Auto-refresh works (every 30 seconds)

### ETA Calculation
- [ ] Distance calculates correctly
- [ ] ETA is reasonable
- [ ] "Approaching" status shows within 1km
- [ ] Default speed (30 km/h) is used when bus is stationary

---

## 🚀 Production Deployment

### Scheduled Tasks

Set up these cron jobs:

```bash
# Clean up old location data (daily at 2 AM)
0 2 * * * psql -c "SELECT cleanup_old_location_data();"

# Aggregate hourly activity (every hour)
0 * * * * psql -c "SELECT aggregate_hourly_vehicle_activity();"
```

### Performance Optimization

1. **Indexes** are already created for:
   - `vehicle_id` and `recorded_at` on `vehicle_location_history`
   - `hour_timestamp` on `hourly_vehicle_activity`

2. **Partitioning** (for high-volume systems):
   Consider partitioning `vehicle_location_history` by date

3. **Caching**:
   - Cache latest vehicle locations in Redis
   - Cache route information

### Security Considerations

1. **Rate Limiting**: Limit location update frequency per vehicle
2. **Validation**: Validate GPS coordinates are within reasonable bounds
3. **Authentication**: Ensure only authorized drivers can submit location data

---

## 📞 Support

For issues or questions:
1. Check the TROUBLESHOOTING_GUIDE.md
2. Review the DATABASE_FIX_SUMMARY.md
3. Inspect browser console for errors
4. Check Supabase logs for database errors

---

## 🎊 Summary

You now have a complete real-time bus tracking system with:

✅ Student portal for tracking buses  
✅ Real-time GPS location tracking  
✅ 24-hour data retention with auto-cleanup  
✅ Live dashboard analytics  
✅ ETA calculation with Haversine formula  
✅ Missed bus detection  
✅ Google Maps integration  
✅ Auto-refresh capabilities  

**Next Steps:**
1. Test the Student Portal with sample data
2. Integrate with driver mobile app for real GPS data
3. Set up cron jobs for data cleanup and aggregation
4. Monitor performance and optimize as needed
