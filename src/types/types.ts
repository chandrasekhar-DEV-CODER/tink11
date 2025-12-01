export type UserRole = 'super_admin' | 'school_admin' | 'driver' | 'parent';
export type VehicleStatus = 'active' | 'maintenance' | 'retired';
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  model: string | null;
  capacity: number | null;
  imei: string | null;
  status: VehicleStatus;
  driver_id: string | null;
  last_location: string | null;
  last_location_time: string | null;
  vin: string | null;
  year: number | null;
  insurance_expiry: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  maintenance_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string | null;
  cost: number | null;
  performed_by: string | null;
  performed_at: string;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleLocationHistory {
  id: string;
  vehicle_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recorded_at: string;
  created_at: string;
}

export interface HourlyVehicleActivity {
  id: string;
  hour_timestamp: string;
  active_vehicle_count: number;
  total_trips: number;
  created_at: string;
}

export interface VehicleOnRoute {
  vehicle_id: string;
  plate_number: string;
  model: string | null;
  latest_latitude: number;
  latest_longitude: number;
  latest_speed: number | null;
  latest_heading: number | null;
  last_update: string;
  trip_id: string;
  trip_status: TripStatus;
}

export interface LatestVehicleLocation {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  description: string | null;
  path_polyline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  route_id: string | null;
  name: string;
  location: string;
  sequence_order: number;
  estimated_arrival_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  student_number: string;
  full_name: string;
  grade: string | null;
  class: string | null;
  pickup_stop_id: string | null;
  dropoff_stop_id: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentParent {
  id: string;
  student_id: string;
  parent_id: string;
  relationship: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  route_id: string | null;
  status: TripStatus;
  scheduled_start: string | null;
  actual_start: string | null;
  actual_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationLog {
  id: string;
  trip_id: string | null;
  vehicle_id: string | null;
  location: string;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recorded_at: string;
  created_at: string;
}

export interface TripEvent {
  id: string;
  trip_id: string | null;
  stop_id: string | null;
  student_id: string | null;
  event_type: string;
  event_time: string;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  related_trip_id: string | null;
  created_at: string;
}

export interface VehicleWithDriver extends Vehicle {
  driver?: Profile | null;
}

export interface TripWithDetails extends Trip {
  vehicle?: Vehicle | null;
  driver?: Profile | null;
  route?: Route | null;
}

export interface StudentWithDetails extends Student {
  pickup_stop?: Stop | null;
  dropoff_stop?: Stop | null;
  parents?: Profile[];
}

export interface StopWithRoute extends Stop {
  route?: Route | null;
}

export interface RouteWithStops extends Route {
  stops?: Stop[];
  vehicle?: Vehicle | null;
  driver?: Profile | null;
}

export interface RouteWithDetails extends Route {
  stops?: Stop[];
  stop_count?: number;
  student_count?: number;
  assigned_vehicle?: Vehicle | null;
  assigned_driver?: Profile | null;
}

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface DashboardStats {
  total_vehicles: number;
  active_trips: number;
  total_alerts: number;
  maintenance_vehicles: number;
  total_students: number;
  total_routes: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user?: string;
}

// New Authentication System Types
export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportVehicle {
  id: string;
  vehicle_id: string;
  registration_number: string;
  model: string | null;
  capacity: number | null;
  year: number | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverAuth {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  phone: string;
  license_number: string;
  vehicle_id: string | null;
  is_active: boolean;
  is_tracking: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  last_location_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentAuth {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentAuth {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  grade: string | null;
  parent_id: string | null;
  vehicle_id: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GPSTrackingLog {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recorded_at: string;
  created_at: string;
}

export type AuthUserRole = 'admin' | 'driver' | 'student' | 'parent';

export interface LoginCredentials {
  username: string;
  password: string;
  role: AuthUserRole;
}

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  role: AuthUserRole;
  email?: string | null;
  phone?: string | null;
  vehicle_id?: string | null;
  is_tracking?: boolean;
}

export interface DriverWithVehicle extends DriverAuth {
  vehicle?: TransportVehicle | null;
}

export interface StudentWithRelations extends StudentAuth {
  parent?: ParentAuth | null;
  vehicle?: TransportVehicle | null;
}

// System Settings Types
export type SettingDataType = 'string' | 'number' | 'boolean' | 'json' | 'color';
export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
export type TargetAudience = 'all' | 'students' | 'drivers' | 'admins' | 'parents';

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  data_type: SettingDataType;
  description: string | null;
  is_public: boolean;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  target_audience: TargetAudience;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsAuditLog {
  id: string;
  setting_category: string;
  setting_key: string;
  old_value: any;
  new_value: any;
  changed_by: string | null;
  changed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface SettingsByCategory {
  [category: string]: {
    [key: string]: any;
  };
}

export interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_mode_enabled: boolean;
  custom_logo_url: string;
}

export interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
}

export interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  notify_trip_start: boolean;
  notify_approaching_stop: boolean;
  notify_trip_delay: boolean;
  notification_quiet_hours_start: string;
  notification_quiet_hours_end: string;
}

export interface LocalizationSettings {
  default_language: string;
  default_timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  distance_unit: string;
}

export interface UploadSettings {
  max_file_size_mb: number;
  allowed_file_types: string[];
  max_files_per_upload: number;
  enable_virus_scan: boolean;
}

export interface ApplicationSettings {
  app_name: string;
  support_email: string;
  support_phone: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  terms_url: string;
  privacy_url: string;
}

export interface TrackingSettings {
  location_update_interval: number;
  location_history_days: number;
  geofence_radius_meters: number;
  speed_limit_kmh: number;
}
