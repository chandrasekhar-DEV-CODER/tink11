/*
# Unified Authentication System for School Transportation

## Overview
Creates role-based authentication with separate tables for each user type.

## Tables
- admins: Administrator accounts
- drivers_auth: Driver accounts with GPS tracking
- parents_auth: Parent accounts
- students_auth: Student accounts  
- transport_vehicles: Vehicle information
- gps_tracking_logs: Real-time GPS data

## Security
- Public read access for login verification
- RLS policies for data protection
- Password stored as plain text for demo (should be hashed in production)

## Initial Data
- Universal admin: chandrasekharadmin / chandrasekharadmin1023@@
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  email text,
  phone text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create transport_vehicles table
CREATE TABLE IF NOT EXISTS transport_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text UNIQUE NOT NULL,
  registration_number text UNIQUE NOT NULL,
  model text,
  capacity integer,
  year integer,
  color text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create drivers_auth table
CREATE TABLE IF NOT EXISTS drivers_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  license_number text UNIQUE NOT NULL,
  vehicle_id uuid REFERENCES transport_vehicles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true NOT NULL,
  is_tracking boolean DEFAULT false NOT NULL,
  current_latitude numeric,
  current_longitude numeric,
  last_location_update timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create parents_auth table
CREATE TABLE IF NOT EXISTS parents_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  address text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create students_auth table
CREATE TABLE IF NOT EXISTS students_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  grade text,
  parent_id uuid REFERENCES parents_auth(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES transport_vehicles(id) ON DELETE SET NULL,
  pickup_location text,
  dropoff_location text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  dropoff_latitude numeric,
  dropoff_longitude numeric,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create GPS tracking logs table
CREATE TABLE IF NOT EXISTS gps_tracking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers_auth(id) ON DELETE CASCADE NOT NULL,
  vehicle_id uuid REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  speed numeric,
  heading numeric,
  accuracy numeric,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_drivers_auth_username ON drivers_auth(username);
CREATE INDEX IF NOT EXISTS idx_drivers_auth_vehicle ON drivers_auth(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_drivers_auth_tracking ON drivers_auth(is_tracking) WHERE is_tracking = true;

CREATE INDEX IF NOT EXISTS idx_parents_auth_username ON parents_auth(username);

CREATE INDEX IF NOT EXISTS idx_students_auth_username ON students_auth(username);
CREATE INDEX IF NOT EXISTS idx_students_auth_parent ON students_auth(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_auth_vehicle ON students_auth(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_transport_vehicles_vehicle_id ON transport_vehicles(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_gps_logs_driver ON gps_tracking_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_recorded_at ON gps_tracking_logs(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for authentication
CREATE POLICY "Anyone can read admins for login" ON admins FOR SELECT USING (true);
CREATE POLICY "Anyone can read drivers for login" ON drivers_auth FOR SELECT USING (true);
CREATE POLICY "Anyone can read parents for login" ON parents_auth FOR SELECT USING (true);
CREATE POLICY "Anyone can read students for login" ON students_auth FOR SELECT USING (true);
CREATE POLICY "Anyone can read vehicles" ON transport_vehicles FOR SELECT USING (true);
CREATE POLICY "Anyone can read recent GPS logs" ON gps_tracking_logs FOR SELECT USING (true);

-- Insert universal admin account
INSERT INTO admins (username, password_hash, full_name, email, is_active)
VALUES (
  'chandrasekharadmin',
  'chandrasekharadmin1023@@',
  'Universal Administrator',
  'admin@schooltransport.com',
  true
) ON CONFLICT (username) DO NOTHING;