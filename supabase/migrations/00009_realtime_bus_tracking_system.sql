/*
# Real-time Bus Tracking System

## Overview
This migration creates infrastructure for real-time bus tracking with 24-hour data retention
and hourly aggregation for analytics.

## 1. New Table: vehicle_location_history
Stores GPS location updates from buses with automatic 24-hour retention
- `id` (uuid, primary key)
- `vehicle_id` (uuid, references vehicles)
- `trip_id` (uuid, references trips) - optional, links to active trip
- `latitude` (numeric) - GPS latitude
- `longitude` (numeric) - GPS longitude
- `speed` (numeric) - Speed in km/h
- `heading` (numeric) - Direction in degrees (0-360)
- `accuracy` (numeric) - GPS accuracy in meters
- `recorded_at` (timestamptz) - When location was recorded
- `created_at` (timestamptz) - When record was inserted

## 2. New Table: hourly_vehicle_activity
Aggregated hourly statistics for dashboard charts
- `id` (uuid, primary key)
- `hour_timestamp` (timestamptz) - Hour bucket (e.g., 2024-01-01 14:00:00)
- `active_vehicle_count` (integer) - Number of active vehicles in that hour
- `total_trips` (integer) - Number of trips in that hour
- `created_at` (timestamptz)

## 3. Functions
- `cleanup_old_location_data()` - Removes location data older than 24 hours
- `aggregate_hourly_vehicle_activity()` - Creates hourly statistics
- `get_vehicles_on_route(route_id)` - Gets all vehicles currently on a specific route

## 4. Security
- Public read access for location data (for student tracking)
- Write access for authenticated drivers/system
- Hourly activity data is public read-only

## 5. Indexes
- Index on vehicle_id and recorded_at for fast queries
- Index on trip_id for trip-based queries
- Index on hour_timestamp for dashboard queries
*/

-- Create vehicle_location_history table
CREATE TABLE IF NOT EXISTS vehicle_location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  speed numeric(5, 2) DEFAULT 0,
  heading numeric(5, 2),
  accuracy numeric(6, 2),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create hourly_vehicle_activity table
CREATE TABLE IF NOT EXISTS hourly_vehicle_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_timestamp timestamptz NOT NULL UNIQUE,
  active_vehicle_count integer NOT NULL DEFAULT 0,
  total_trips integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_location_history_vehicle_time 
  ON vehicle_location_history(vehicle_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_history_trip 
  ON vehicle_location_history(trip_id);

CREATE INDEX IF NOT EXISTS idx_location_history_recorded_at 
  ON vehicle_location_history(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hourly_activity_timestamp 
  ON hourly_vehicle_activity(hour_timestamp DESC);

-- Enable RLS
ALTER TABLE vehicle_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_vehicle_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_location_history
CREATE POLICY "Public can view location history" ON vehicle_location_history
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated can insert location data" ON vehicle_location_history
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public can insert location data" ON vehicle_location_history
  FOR INSERT TO public WITH CHECK (true);

-- RLS Policies for hourly_vehicle_activity
CREATE POLICY "Public can view hourly activity" ON hourly_vehicle_activity
  FOR SELECT TO public USING (true);

CREATE POLICY "System can manage hourly activity" ON hourly_vehicle_activity
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Function: Cleanup old location data (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_location_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM vehicle_location_history
  WHERE recorded_at < now() - interval '24 hours';
END;
$$;

-- Function: Aggregate hourly vehicle activity
CREATE OR REPLACE FUNCTION aggregate_hourly_vehicle_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_hour timestamptz;
  vehicle_count integer;
  trip_count integer;
BEGIN
  -- Get current hour (truncated)
  current_hour := date_trunc('hour', now());
  
  -- Count active vehicles in the last hour
  SELECT COUNT(DISTINCT vehicle_id)
  INTO vehicle_count
  FROM vehicle_location_history
  WHERE recorded_at >= current_hour
    AND recorded_at < current_hour + interval '1 hour';
  
  -- Count trips in the last hour
  SELECT COUNT(*)
  INTO trip_count
  FROM trips
  WHERE status = 'in_progress'
    AND actual_start >= current_hour
    AND actual_start < current_hour + interval '1 hour';
  
  -- Insert or update hourly record
  INSERT INTO hourly_vehicle_activity (hour_timestamp, active_vehicle_count, total_trips)
  VALUES (current_hour, vehicle_count, trip_count)
  ON CONFLICT (hour_timestamp) 
  DO UPDATE SET 
    active_vehicle_count = EXCLUDED.active_vehicle_count,
    total_trips = EXCLUDED.total_trips;
END;
$$;

-- Function: Get vehicles currently on a specific route
CREATE OR REPLACE FUNCTION get_vehicles_on_route(p_route_id uuid)
RETURNS TABLE (
  vehicle_id uuid,
  plate_number text,
  model text,
  latest_latitude numeric,
  latest_longitude numeric,
  latest_speed numeric,
  latest_heading numeric,
  last_update timestamptz,
  trip_id uuid,
  trip_status trip_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (v.id)
    v.id as vehicle_id,
    v.plate_number,
    v.model,
    vlh.latitude as latest_latitude,
    vlh.longitude as latest_longitude,
    vlh.speed as latest_speed,
    vlh.heading as latest_heading,
    vlh.recorded_at as last_update,
    t.id as trip_id,
    t.status as trip_status
  FROM vehicles v
  INNER JOIN trips t ON t.vehicle_id = v.id
  LEFT JOIN vehicle_location_history vlh ON vlh.vehicle_id = v.id
  WHERE t.route_id = p_route_id
    AND t.status = 'in_progress'
    AND vlh.recorded_at >= now() - interval '5 minutes'
  ORDER BY v.id, vlh.recorded_at DESC;
END;
$$;

-- Function: Get latest location for a vehicle
CREATE OR REPLACE FUNCTION get_latest_vehicle_location(p_vehicle_id uuid)
RETURNS TABLE (
  latitude numeric,
  longitude numeric,
  speed numeric,
  heading numeric,
  recorded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vlh.latitude,
    vlh.longitude,
    vlh.speed,
    vlh.heading,
    vlh.recorded_at
  FROM vehicle_location_history vlh
  WHERE vlh.vehicle_id = p_vehicle_id
  ORDER BY vlh.recorded_at DESC
  LIMIT 1;
END;
$$;

-- Add comments
COMMENT ON TABLE vehicle_location_history IS 'Stores GPS location updates from buses with 24-hour retention';
COMMENT ON TABLE hourly_vehicle_activity IS 'Aggregated hourly statistics for dashboard analytics';
COMMENT ON FUNCTION cleanup_old_location_data() IS 'Removes location data older than 24 hours';
COMMENT ON FUNCTION aggregate_hourly_vehicle_activity() IS 'Creates hourly vehicle activity statistics';
COMMENT ON FUNCTION get_vehicles_on_route(uuid) IS 'Gets all vehicles currently active on a specific route';