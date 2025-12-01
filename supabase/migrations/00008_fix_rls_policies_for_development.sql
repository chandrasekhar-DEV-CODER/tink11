/*
# Fix RLS Policies for Development

## Overview
This migration adds permissive RLS policies to allow data management without requiring authentication.
This is suitable for development and demo environments where user authentication is not yet implemented.

## Changes
1. Add policies to allow public access for INSERT, UPDATE, DELETE operations on:
   - vehicles
   - routes
   - stops
   - students
   - trips

## Security Note
These policies are permissive for development purposes. In production, you should:
- Require authentication
- Implement proper role-based access control
- Restrict operations based on user roles
*/

-- Vehicles: Allow public to manage vehicles (development only)
DROP POLICY IF EXISTS "Public can manage vehicles" ON vehicles;
CREATE POLICY "Public can manage vehicles" ON vehicles
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Routes: Allow public to manage routes (development only)
DROP POLICY IF EXISTS "Public can manage routes" ON routes;
CREATE POLICY "Public can manage routes" ON routes
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Stops: Allow public to manage stops (development only)
DROP POLICY IF EXISTS "Public can manage stops" ON stops;
CREATE POLICY "Public can manage stops" ON stops
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Students: Allow public to manage students (development only)
DROP POLICY IF EXISTS "Public can manage students" ON students;
CREATE POLICY "Public can manage students" ON students
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Trips: Allow public to manage trips (development only)
DROP POLICY IF EXISTS "Public can manage trips" ON trips;
CREATE POLICY "Public can manage trips" ON trips
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Vehicle Maintenance Records: Allow public to manage (development only)
DROP POLICY IF EXISTS "Public can manage maintenance records" ON vehicle_maintenance_records;
CREATE POLICY "Public can manage maintenance records" ON vehicle_maintenance_records
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Add comment for documentation
COMMENT ON POLICY "Public can manage vehicles" ON vehicles IS 'Development policy - allows public access. Replace with proper auth in production.';
COMMENT ON POLICY "Public can manage routes" ON routes IS 'Development policy - allows public access. Replace with proper auth in production.';
COMMENT ON POLICY "Public can manage stops" ON stops IS 'Development policy - allows public access. Replace with proper auth in production.';
COMMENT ON POLICY "Public can manage students" ON students IS 'Development policy - allows public access. Replace with proper auth in production.';
COMMENT ON POLICY "Public can manage trips" ON trips IS 'Development policy - allows public access. Replace with proper auth in production.';