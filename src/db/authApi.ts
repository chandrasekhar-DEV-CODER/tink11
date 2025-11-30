import { supabase } from './supabase';
import type {
  Admin,
  DriverAuth,
  ParentAuth,
  StudentAuth,
  TransportVehicle,
  GPSTrackingLog,
  LoginCredentials,
  AuthUser,
  AuthUserRole,
  DriverWithVehicle,
  StudentWithRelations
} from '@/types/types';

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    const { username, password, role } = credentials;

    try {
      let tableName = '';
      switch (role) {
        case 'admin':
          tableName = 'admins';
          break;
        case 'driver':
          tableName = 'drivers_auth';
          break;
        case 'parent':
          tableName = 'parents_auth';
          break;
        case 'student':
          tableName = 'students_auth';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        console.error('Login error:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        full_name: data.full_name || username,
        role,
        email: data.email,
        phone: data.phone,
        vehicle_id: data.vehicle_id,
        is_tracking: data.is_tracking
      };
    } catch (error) {
      console.error('Login exception:', error);
      return null;
    }
  },

  async getCurrentUser(userId: string, role: AuthUserRole): Promise<AuthUser | null> {
    try {
      let tableName = '';
      switch (role) {
        case 'admin':
          tableName = 'admins';
          break;
        case 'driver':
          tableName = 'drivers_auth';
          break;
        case 'parent':
          tableName = 'parents_auth';
          break;
        case 'student':
          tableName = 'students_auth';
          break;
        default:
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        full_name: data.full_name || data.username,
        role,
        email: data.email,
        phone: data.phone,
        vehicle_id: data.vehicle_id,
        is_tracking: data.is_tracking
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};

// Admin API
export const adminApi = {
  async getAll(): Promise<Admin[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .insert(admin)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, admin: Partial<Admin>): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .update(admin)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Transport Vehicles API
export const transportVehiclesApi = {
  async getAll(): Promise<TransportVehicle[]> {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<TransportVehicle | null> {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(vehicle: Omit<TransportVehicle, 'id' | 'created_at' | 'updated_at'>): Promise<TransportVehicle> {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .insert(vehicle)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, vehicle: Partial<TransportVehicle>): Promise<TransportVehicle> {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .update(vehicle)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transport_vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Drivers API
export const driversAuthApi = {
  async getAll(): Promise<DriverAuth[]> {
    const { data, error } = await supabase
      .from('drivers_auth')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllWithVehicles(): Promise<DriverWithVehicle[]> {
    const { data, error } = await supabase
      .from('drivers_auth')
      .select(`
        *,
        vehicle:transport_vehicles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<DriverAuth | null> {
    const { data, error } = await supabase
      .from('drivers_auth')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(driver: Omit<DriverAuth, 'id' | 'created_at' | 'updated_at'>): Promise<DriverAuth> {
    const { data, error } = await supabase
      .from('drivers_auth')
      .insert(driver)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, driver: Partial<DriverAuth>): Promise<DriverAuth> {
    const { data, error } = await supabase
      .from('drivers_auth')
      .update(driver)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLocation(id: string, latitude: number, longitude: number): Promise<void> {
    const { error } = await supabase
      .from('drivers_auth')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        last_location_update: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async startTracking(id: string): Promise<void> {
    const { error } = await supabase
      .from('drivers_auth')
      .update({ is_tracking: true })
      .eq('id', id);

    if (error) throw error;
  },

  async stopTracking(id: string): Promise<void> {
    const { error } = await supabase
      .from('drivers_auth')
      .update({ is_tracking: false })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('drivers_auth')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Parents API
export const parentsAuthApi = {
  async getAll(): Promise<ParentAuth[]> {
    const { data, error } = await supabase
      .from('parents_auth')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<ParentAuth | null> {
    const { data, error } = await supabase
      .from('parents_auth')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(parent: Omit<ParentAuth, 'id' | 'created_at' | 'updated_at'>): Promise<ParentAuth> {
    const { data, error } = await supabase
      .from('parents_auth')
      .insert(parent)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, parent: Partial<ParentAuth>): Promise<ParentAuth> {
    const { data, error } = await supabase
      .from('parents_auth')
      .update(parent)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('parents_auth')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Students API
export const studentsAuthApi = {
  async getAll(): Promise<StudentAuth[]> {
    const { data, error } = await supabase
      .from('students_auth')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllWithRelations(): Promise<StudentWithRelations[]> {
    const { data, error } = await supabase
      .from('students_auth')
      .select(`
        *,
        parent:parents_auth(*),
        vehicle:transport_vehicles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<StudentAuth | null> {
    const { data, error } = await supabase
      .from('students_auth')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByParentId(parentId: string): Promise<StudentAuth[]> {
    const { data, error } = await supabase
      .from('students_auth')
      .select('*')
      .eq('parent_id', parentId)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(student: Omit<StudentAuth, 'id' | 'created_at' | 'updated_at'>): Promise<StudentAuth> {
    const { data, error } = await supabase
      .from('students_auth')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, student: Partial<StudentAuth>): Promise<StudentAuth> {
    const { data, error } = await supabase
      .from('students_auth')
      .update(student)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students_auth')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// GPS Tracking API
export const gpsTrackingApi = {
  async logLocation(log: Omit<GPSTrackingLog, 'id' | 'created_at'>): Promise<GPSTrackingLog> {
    const { data, error } = await supabase
      .from('gps_tracking_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentByDriver(driverId: string, limit: number = 100): Promise<GPSTrackingLog[]> {
    const { data, error } = await supabase
      .from('gps_tracking_logs')
      .select('*')
      .eq('driver_id', driverId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getRecentByVehicle(vehicleId: string, limit: number = 100): Promise<GPSTrackingLog[]> {
    const { data, error } = await supabase
      .from('gps_tracking_logs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getLatestByDriver(driverId: string): Promise<GPSTrackingLog | null> {
    const { data, error } = await supabase
      .from('gps_tracking_logs')
      .select('*')
      .eq('driver_id', driverId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllActiveTracking(): Promise<GPSTrackingLog[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('gps_tracking_logs')
      .select('*')
      .gte('recorded_at', oneHourAgo)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};
