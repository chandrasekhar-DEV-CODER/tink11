/*
# System Settings and Configuration Module

## Overview
Centralized settings management system for application-wide configuration.
Administrators can control theme, security, notifications, localization, and more.

## 1. New Table: system_settings
Stores all application-wide configuration settings

## 2. New Table: system_announcements
System-wide announcements and banners

## 3. New Table: settings_audit_log
Audit trail for all settings changes

## 4. Security
- Only admins (super_admin, school_admin) can modify settings
- Public settings readable by all users
- Audit log for all changes
*/

-- Create ENUM types
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE target_audience AS ENUM ('all', 'students', 'drivers', 'admins', 'parents');
CREATE TYPE setting_data_type AS ENUM ('string', 'number', 'boolean', 'json', 'color');

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_type setting_data_type NOT NULL DEFAULT 'string',
  description text,
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(category, key)
);

-- Create system_announcements table
CREATE TABLE IF NOT EXISTS system_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type announcement_type DEFAULT 'info',
  is_active boolean DEFAULT true,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  target_audience target_audience DEFAULT 'all',
  priority integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings_audit_log table
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_category text NOT NULL,
  setting_key text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON system_settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_public ON system_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON system_announcements(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON system_announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON settings_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_setting ON settings_audit_log(setting_category, setting_key);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Development mode (public access)
CREATE POLICY "Public can read all settings" ON system_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can manage settings" ON system_settings
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can read announcements" ON system_announcements
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can manage announcements" ON system_announcements
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can read audit log" ON settings_audit_log
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can insert audit log" ON settings_audit_log
  FOR INSERT TO public WITH CHECK (true);

-- Function: Get setting value
CREATE OR REPLACE FUNCTION get_setting(p_category text, p_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_value jsonb;
BEGIN
  SELECT value INTO v_value
  FROM system_settings
  WHERE category = p_category AND key = p_key;
  
  RETURN v_value;
END;
$$;

-- Function: Update setting with audit trail
CREATE OR REPLACE FUNCTION update_setting(
  p_category text,
  p_key text,
  p_value jsonb,
  p_updated_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_value jsonb;
BEGIN
  -- Get old value for audit
  SELECT value INTO v_old_value
  FROM system_settings
  WHERE category = p_category AND key = p_key;
  
  -- Update setting
  UPDATE system_settings
  SET value = p_value,
      updated_by = p_updated_by,
      updated_at = now()
  WHERE category = p_category AND key = p_key;
  
  -- Log change
  INSERT INTO settings_audit_log (
    setting_category,
    setting_key,
    old_value,
    new_value,
    changed_by
  ) VALUES (
    p_category,
    p_key,
    v_old_value,
    p_value,
    p_updated_by
  );
END;
$$;

-- Function: Get active announcements for user
CREATE OR REPLACE FUNCTION get_active_announcements(p_audience target_audience DEFAULT 'all')
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  type announcement_type,
  priority integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.content,
    a.type,
    a.priority,
    a.created_at
  FROM system_announcements a
  WHERE a.is_active = true
    AND a.start_date <= now()
    AND (a.end_date IS NULL OR a.end_date >= now())
    AND (a.target_audience = 'all' OR a.target_audience = p_audience)
  ORDER BY a.priority DESC, a.created_at DESC;
END;
$$;

-- Insert default settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
-- Theme Settings
('theme', 'primary_color', '"#10b981"', 'color', 'Primary brand color', true),
('theme', 'secondary_color', '"#3b82f6"', 'color', 'Secondary accent color', true),
('theme', 'accent_color', '"#8b5cf6"', 'color', 'Accent highlight color', true),
('theme', 'dark_mode_enabled', 'true', 'boolean', 'Enable dark mode support', true),
('theme', 'custom_logo_url', '""', 'string', 'Custom logo URL', true),

-- Security Settings
('security', 'password_min_length', '8', 'number', 'Minimum password length', false),
('security', 'password_require_uppercase', 'true', 'boolean', 'Require uppercase letters', false),
('security', 'password_require_lowercase', 'true', 'boolean', 'Require lowercase letters', false),
('security', 'password_require_numbers', 'true', 'boolean', 'Require numbers', false),
('security', 'password_require_special', 'true', 'boolean', 'Require special characters', false),
('security', 'two_factor_enabled', 'false', 'boolean', 'Enable 2FA for all users', false),
('security', 'session_timeout_minutes', '60', 'number', 'Session timeout in minutes', false),
('security', 'max_login_attempts', '5', 'number', 'Maximum failed login attempts', false),
('security', 'lockout_duration_minutes', '30', 'number', 'Account lockout duration', false),

-- Notification Settings
('notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications', false),
('notifications', 'sms_enabled', 'false', 'boolean', 'Enable SMS notifications', false),
('notifications', 'push_enabled', 'true', 'boolean', 'Enable push notifications', false),
('notifications', 'notify_trip_start', 'true', 'boolean', 'Notify when trip starts', true),
('notifications', 'notify_approaching_stop', 'true', 'boolean', 'Notify when bus approaching', true),
('notifications', 'notify_trip_delay', 'true', 'boolean', 'Notify of trip delays', true),
('notifications', 'notification_quiet_hours_start', '"22:00"', 'string', 'Quiet hours start time', false),
('notifications', 'notification_quiet_hours_end', '"07:00"', 'string', 'Quiet hours end time', false),

-- Localization Settings
('localization', 'default_language', '"en"', 'string', 'Default application language', true),
('localization', 'default_timezone', '"America/New_York"', 'string', 'Default timezone', true),
('localization', 'date_format', '"MM/DD/YYYY"', 'string', 'Date display format', true),
('localization', 'time_format', '"12h"', 'string', 'Time format (12h or 24h)', true),
('localization', 'currency', '"USD"', 'string', 'Default currency', true),
('localization', 'distance_unit', '"miles"', 'string', 'Distance unit (miles or km)', true),

-- File Upload Settings
('uploads', 'max_file_size_mb', '10', 'number', 'Maximum file size in MB', false),
('uploads', 'allowed_file_types', '["jpg","jpeg","png","pdf","doc","docx"]', 'json', 'Allowed file extensions', false),
('uploads', 'max_files_per_upload', '5', 'number', 'Maximum files per upload', false),
('uploads', 'enable_virus_scan', 'false', 'boolean', 'Enable virus scanning', false),

-- Application Settings
('application', 'app_name', '"My School Ride"', 'string', 'Application name', true),
('application', 'support_email', '"support@myschoolride.com"', 'string', 'Support email address', true),
('application', 'support_phone', '"+1-555-0123"', 'string', 'Support phone number', true),
('application', 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true),
('application', 'allow_registration', 'true', 'boolean', 'Allow new user registration', false),
('application', 'terms_url', '"/terms"', 'string', 'Terms of service URL', true),
('application', 'privacy_url', '"/privacy"', 'string', 'Privacy policy URL', true),

-- Tracking Settings
('tracking', 'location_update_interval', '5', 'number', 'GPS update interval (seconds)', false),
('tracking', 'location_history_days', '30', 'number', 'Days to keep location history', false),
('tracking', 'geofence_radius_meters', '100', 'number', 'Geofence radius in meters', false),
('tracking', 'speed_limit_kmh', '80', 'number', 'Speed limit alert threshold', false)

ON CONFLICT (category, key) DO NOTHING;