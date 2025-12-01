# Quick Start Guide - New Features

## 🚀 Access the New Features

### Student Portal
**URL**: `/student`

**Quick Test**:
1. Create a student in Admin → Students
2. Assign a route and pickup stop
3. Go to `/student`
4. Login with the student number
5. View your bus in real-time!

---

## 📊 Real-time Dashboard

**URL**: `/` (Dashboard)

**What's New**:
- "Hourly Active Vehicles" chart now shows **real database data**
- **Live badge** indicates real-time updates
- Auto-refreshes every 30 seconds

---

## 🧪 Testing with Sample Data

### Option 1: Quick Sample Data (SQL)

Run this in Supabase SQL Editor:

```sql
-- Create sample location data for testing
DO $$
DECLARE
  v_vehicle_id uuid;
  v_hour int;
BEGIN
  -- Get first active vehicle
  SELECT id INTO v_vehicle_id FROM vehicles WHERE status = 'active' LIMIT 1;
  
  IF v_vehicle_id IS NOT NULL THEN
    -- Insert hourly location data
    FOR v_hour IN 0..23 LOOP
      INSERT INTO vehicle_location_history (
        vehicle_id,
        latitude,
        longitude,
        speed,
        heading,
        recorded_at
      ) VALUES (
        v_vehicle_id,
        40.7128 + (v_hour * 0.01),
        -74.0060 + (v_hour * 0.01),
        CASE WHEN v_hour BETWEEN 7 AND 9 OR v_hour BETWEEN 15 AND 17 THEN 30 ELSE 0 END,
        45,
        now() - (interval '1 hour' * (24 - v_hour))
      );
    END LOOP;
    
    -- Create hourly activity data
    FOR v_hour IN 0..23 LOOP
      INSERT INTO hourly_vehicle_activity (
        hour_timestamp,
        active_vehicle_count,
        total_trips
      ) VALUES (
        date_trunc('hour', now() - (interval '1 hour' * (24 - v_hour))),
        CASE WHEN v_hour BETWEEN 6 AND 9 OR v_hour BETWEEN 14 AND 18 THEN 
          FLOOR(RANDOM() * 10 + 5)::int 
        ELSE 
          FLOOR(RANDOM() * 3)::int 
        END,
        CASE WHEN v_hour BETWEEN 6 AND 9 OR v_hour BETWEEN 14 AND 18 THEN 
          FLOOR(RANDOM() * 8 + 3)::int 
        ELSE 
          FLOOR(RANDOM() * 2)::int 
        END
      )
      ON CONFLICT (hour_timestamp) DO UPDATE SET
        active_vehicle_count = EXCLUDED.active_vehicle_count,
        total_trips = EXCLUDED.total_trips;
    END LOOP;
  END IF;
END $$;
```

### Option 2: Manual Testing

1. **Create a Vehicle**:
   - Go to Admin → Vehicles
   - Add a new vehicle (e.g., BUS-001)

2. **Create a Route**:
   - Go to Routes
   - Add a route (e.g., "Morning Route A")

3. **Create Stops**:
   - Go to Stops
   - Add stops with GPS coordinates
   - Example: Lat: 40.7128, Lng: -74.0060 (NYC)

4. **Create a Student**:
   - Go to Students
   - Add student with student number
   - Assign pickup stop

5. **Start a Trip**:
   - Go to Trips
   - Create a new trip with the vehicle and route

6. **Add Location Data**:
   ```sql
   INSERT INTO vehicle_location_history (
     vehicle_id,
     latitude,
     longitude,
     speed,
     heading,
     recorded_at
   ) VALUES (
     'your-vehicle-uuid',
     40.7128,
     -74.0060,
     30,
     45,
     now()
   );
   ```

7. **Test Student Portal**:
   - Go to `/student`
   - Login with student number
   - See the bus on your route!

---

## 🎯 Key Features to Test

### ✅ Student Portal Features
- [ ] Login with student number
- [ ] View assigned route info
- [ ] See buses on route (real-time)
- [ ] Click a bus to see details
- [ ] View distance and ETA
- [ ] Click "Get Directions" (opens Google Maps)
- [ ] See "Approaching!" when bus is within 1km
- [ ] See "Missed Bus" alert when appropriate

### ✅ Dashboard Features
- [ ] View "Hourly Active Vehicles" chart
- [ ] See "Live" badge on chart
- [ ] Verify chart shows real data (not mock data)
- [ ] Watch auto-refresh (every 30 seconds)

### ✅ Location Tracking
- [ ] Insert location data
- [ ] Query latest location
- [ ] View 24-hour history
- [ ] See vehicles on specific route

---

## 🔍 Troubleshooting

### "No buses on your route"
**Solution**: 
1. Ensure vehicle is assigned to the same route as student's pickup stop
2. Create an active trip for the vehicle
3. Add recent location data (within last 5 minutes)

### "No activity data available yet"
**Solution**:
1. Run the sample data SQL script above
2. Or manually insert hourly activity data

### Student login fails
**Solution**:
1. Verify student exists in database
2. Check student has `is_active = true`
3. Ensure student number is correct

### ETA not calculating
**Solution**:
1. Verify pickup stop has valid location (POINT format)
2. Check vehicle has recent location data
3. Ensure coordinates are valid (lat: -90 to 90, lng: -180 to 180)

---

## 📚 Documentation

- **Full Feature Guide**: See `NEW_FEATURES_GUIDE.md`
- **Database Fix**: See `DATABASE_FIX_SUMMARY.md`
- **Troubleshooting**: See `TROUBLESHOOTING_GUIDE.md`

---

## 🎉 You're Ready!

All new features are now active and ready to use. Start by testing the Student Portal with sample data, then integrate with your mobile apps for real-time GPS tracking!

**Happy Tracking! 🚌📍**
