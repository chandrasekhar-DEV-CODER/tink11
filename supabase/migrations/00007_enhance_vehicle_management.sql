/*
# Enhance Vehicle Management

## Overview
This migration adds additional fields to the vehicles table to support comprehensive vehicle management including VIN tracking, year, insurance expiry, and maintenance scheduling.

## 1. New Columns Added to vehicles table
- `vin` (text, unique) - Vehicle Identification Number
- `year` (integer) - Manufacturing year
- `insurance_expiry` (date) - Insurance expiration date
- `last_maintenance_date` (date) - Last maintenance service date
- `next_maintenance_date` (date) - Scheduled next maintenance date
- `maintenance_notes` (text) - Maintenance history and notes

## 2. New Table: vehicle_maintenance_records
Track detailed maintenance history for each vehicle
- `id` (uuid, primary key)
- `vehicle_id` (uuid, references vehicles)
- `maintenance_type` (text) - e.g., "oil_change", "tire_rotation", "inspection"
- `description` (text) - Detailed description of work performed
- `cost` (numeric) - Cost of maintenance
- `performed_by` (text) - Service provider or mechanic name
- `performed_at` (date) - Date of maintenance
- `next_due_date` (date) - When this maintenance is next due
- `notes` (text) - Additional notes
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 3. Security
- Public read access for active vehicles (for display purposes)
- Admins have full CRUD access
- Drivers can view their assigned vehicle details
- Maintenance records follow same security model as vehicles

## 4. Indexes
- Index on insurance_expiry for expiration alerts
- Index on next_maintenance_date for scheduling
- Index on vehicle_id in maintenance_records for fast lookups
*/

-- Add new columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS vin text UNIQUE,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS insurance_expiry date,
ADD COLUMN IF NOT EXISTS last_maintenance_date date,
ADD COLUMN IF NOT EXISTS next_maintenance_date date,
ADD COLUMN IF NOT EXISTS maintenance_notes text;

-- Create vehicle_maintenance_records table
CREATE TABLE IF NOT EXISTS vehicle_maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  maintenance_type text NOT NULL,
  description text,
  cost numeric(10, 2),
  performed_by text,
  performed_at date NOT NULL,
  next_due_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON vehicles(insurance_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_maintenance ON vehicles(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle ON vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_performed_at ON vehicle_maintenance_records(performed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_next_due ON vehicle_maintenance_records(next_due_date);

-- Enable RLS on maintenance records
ALTER TABLE vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_maintenance_records
-- Admins have full access
CREATE POLICY "Admins have full access to maintenance records" ON vehicle_maintenance_records
  FOR ALL TO authenticated USING (is_school_admin());

-- Drivers can view maintenance records for their assigned vehicles
CREATE POLICY "Drivers can view their vehicle maintenance records" ON vehicle_maintenance_records
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_maintenance_records.vehicle_id
      AND v.driver_id = auth.uid()
    )
  );

-- Public can view maintenance records for active vehicles (read-only)
CREATE POLICY "Public can view maintenance records for active vehicles" ON vehicle_maintenance_records
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_maintenance_records.vehicle_id
      AND v.status = 'active'::vehicle_status
    )
  );

-- Add comment for documentation
COMMENT ON TABLE vehicle_maintenance_records IS 'Tracks detailed maintenance history for each vehicle';
COMMENT ON COLUMN vehicles.vin IS 'Vehicle Identification Number - unique identifier';
COMMENT ON COLUMN vehicles.year IS 'Manufacturing year of the vehicle';
COMMENT ON COLUMN vehicles.insurance_expiry IS 'Insurance policy expiration date';
COMMENT ON COLUMN vehicles.last_maintenance_date IS 'Date of last maintenance service';
COMMENT ON COLUMN vehicles.next_maintenance_date IS 'Scheduled date for next maintenance';
COMMENT ON COLUMN vehicles.maintenance_notes IS 'General maintenance notes and history';
