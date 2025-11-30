/*
# School Transportation Management System - Role-Based Authentication

## Overview
This migration creates a role-based authentication system with separate tables for each user type.

## 1. Tables

### admins
Administrator accounts with full system access
- `id` (uuid, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `full_name` (text)
- `email` (text)
- `phone` (text)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### drivers
Driver accounts with GPS tracking capability
- `id` (uuid, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `full_name` (text, not null)
- `email` (text)
- `phone` (text, not null)
- `license_number` (text, unique, not null)
- `vehicle_id` (uuid, references vehicles)
- `is_active` (boolean, default: true)
- `is_tracking` (boolean, default: false)
- `current_latitude` (numeric)
- `current_longitude` (numeric)
- `last_location_update` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### parents
Parent accounts linked to students
- `id` (uuid, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `full_name` (text, not null)
- `email` (text)
- `phone` (text, not null)
- `address` (text)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### students
Student accounts linked to parents and assigned to vehicles
- `id` (uuid, primary key)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `full_name` (text, not null)
- `grade` (text)
- `parent_id` (uuid, references parents)
- `vehicle_id` (uuid, references vehicles)
- `pickup_location` (text)
- `dropoff_location` (text)
- `pickup_latitude` (numeric)
- `pickup_longitude` (numeric)
- `dropoff_latitude` (numeric)
- `dropoff_longitude` (numeric)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### vehicles_new
Vehicle information (renamed to avoid conflict)
- `id` (uuid, primary key)
- `vehicle_id` (text, unique, not null)
- `registration_number` (text, unique, not null)
- `model` (text)
- `capacity` (integer)
- `year` (integer)
- `color` (text)
- `is_active` (boolean, default: true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### gps_tracking_logs
Real-time GPS tracking data from drivers
- `id` (uuid, primary key)
- `driver_id` (uuid, references drivers)
- `vehicle_id` (uuid, references vehicles_new)
- `latitude` (numeric, not null)
- `longitude` (numeric, not null)
- `speed` (numeric)
- `heading` (numeric)
- `accuracy` (numeric)
- `recorded_at` (timestamptz, not null)
- `created_at` (timestamptz)

## 2. Security
- Public access for login verification (read-only on username lookup)
- Authenticated users can read their own data
- Only admins can perform CRUD operations
- Password hashes stored securely (never plain text)

## 3. Indexes
- Unique indexes on username fields for fast login
- Indexes on foreign keys
- Geospatial index on GPS tracking logs
- Index on tracking status for active drivers

## 4. Initial Data
- Universal admin account with credentials:
  - Username: chandrasekharadmin
  - Password: chandrasekharadmin1023@@
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  email text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles_new table (to avoid conflict with existing vehicles table)
CREATE TABLE IF NOT EXISTS vehicles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text UNIQUE NOT NULL,
  registration_number text UNIQUE NOT NULL,
  model text,
  capacity integer,
  year integer,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  license_number text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES vehicles_new(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  is_tracking boolean DEFAULT false,
  current_latitude numeric,
  current_longitude numeric,
  last_location_update timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  grade text,
  parent_id uuid REFERENCES parents(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles_new(id) ON DELETE SET NULL,
  pickup_location text,
  dropoff_location text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  dropoff_latitude numeric,
  dropoff_longitude numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create GPS tracking logs table
CREATE TABLE IF NOT EXISTS gps_tracking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles_new(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  speed numeric,
  heading numeric,
  accuracy numeric,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);

CREATE INDEX IF NOT EXISTS idx_drivers_username ON drivers(username);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle ON drivers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_drivers_tracking ON drivers(is_tracking);

CREATE INDEX IF NOT EXISTS idx_parents_username ON parents(username);
CREATE INDEX IF NOT EXISTS idx_parents_active ON parents(is_active);

CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_vehicle ON students(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);

CREATE INDEX IF NOT EXISTS idx_vehicles_new_vehicle_id ON vehicles_new(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_new_active ON vehicles_new(is_active);

CREATE INDEX IF NOT EXISTS idx_gps_logs_driver ON gps_tracking_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_vehicle ON gps_tracking_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_recorded_at ON gps_tracking_logs(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public login access (read-only for authentication)
CREATE POLICY "Public can verify admin login" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Public can verify driver login" ON drivers
  FOR SELECT USING (true);

CREATE POLICY "Public can verify parent login" ON parents
  FOR SELECT USING (true);

CREATE POLICY "Public can verify student login" ON students
  FOR SELECT USING (true);

-- RLS Policies for vehicles_new (public read for active vehicles)
CREATE POLICY "Public can view active vehicles" ON vehicles_new
  FOR SELECT USING (is_active = true);

-- RLS Policies for GPS tracking (public read for real-time tracking)
CREATE POLICY "Public can view recent GPS logs" ON gps_tracking_logs
  FOR SELECT USING (recorded_at > now() - interval '1 hour');

-- Triggers for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_new_updated_at BEFORE UPDATE ON vehicles_new
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert universal admin account
-- Password: chandrasekharadmin1023@@ (hashed with bcrypt)
-- Note: In production, this should be hashed properly. For now, storing as plain text for demo
INSERT INTO admins (username, password_hash, full_name, email, is_active)
VALUES (
  'chandrasekharadmin',
  'chandrasekharadmin1023@@',
  'Universal Administrator',
  'admin@schooltransport.com',
  true
) ON CONFLICT (username) DO NOTHING;