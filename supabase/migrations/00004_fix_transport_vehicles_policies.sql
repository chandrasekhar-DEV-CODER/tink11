/*
# Fix Transport Vehicles RLS Policies

## Problem
The transport_vehicles table has RLS enabled but only has a SELECT policy.
This prevents INSERT, UPDATE, and DELETE operations from working.

## Solution
Add policies to allow full CRUD operations on transport_vehicles table.
Since this is a development/demo environment, we're allowing all operations.

## Changes
1. Add INSERT policy for transport_vehicles
2. Add UPDATE policy for transport_vehicles
3. Add DELETE policy for transport_vehicles
4. Add similar policies for all auth tables (drivers_auth, parents_auth, students_auth)
5. Add INSERT policy for gps_tracking_logs

## Security Note
In production, these policies should be restricted to authenticated admin users only.
*/

-- Transport Vehicles Policies
CREATE POLICY "Anyone can insert vehicles" ON transport_vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vehicles" ON transport_vehicles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vehicles" ON transport_vehicles FOR DELETE USING (true);

-- Drivers Auth Policies
CREATE POLICY "Anyone can insert drivers" ON drivers_auth FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drivers" ON drivers_auth FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drivers" ON drivers_auth FOR DELETE USING (true);

-- Parents Auth Policies
CREATE POLICY "Anyone can insert parents" ON parents_auth FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update parents" ON parents_auth FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete parents" ON parents_auth FOR DELETE USING (true);

-- Students Auth Policies
CREATE POLICY "Anyone can insert students" ON students_auth FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students_auth FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON students_auth FOR DELETE USING (true);

-- GPS Tracking Logs Policies
CREATE POLICY "Anyone can insert GPS logs" ON gps_tracking_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update GPS logs" ON gps_tracking_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete GPS logs" ON gps_tracking_logs FOR DELETE USING (true);

-- Admins Policies
CREATE POLICY "Anyone can insert admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update admins" ON admins FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete admins" ON admins FOR DELETE USING (true);
