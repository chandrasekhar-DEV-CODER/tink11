import { supabase } from './supabase';
import type {
  Profile,
  Vehicle,
  Route,
  Stop,
  Student,
  StudentParent,
  Trip,
  LocationLog,
  TripEvent,
  Notification,
  VehicleWithDriver,
  VehicleMaintenanceRecord,
  TripWithDetails,
  StudentWithDetails,
  RouteWithStops,
  DashboardStats,
} from '@/types/types';

export const profilesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const vehiclesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:profiles(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        driver:profiles(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateLocation(id: string, lat: number, lng: number) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        last_location: `POINT(${lng} ${lat})`,
        last_location_time: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const maintenanceApi = {
  async getByVehicle(vehicleId: string) {
    const { data, error } = await supabase
      .from('vehicle_maintenance_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('performed_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAll() {
    const { data, error } = await supabase
      .from('vehicle_maintenance_records')
      .select('*')
      .order('performed_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error} = await supabase
      .from('vehicle_maintenance_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(record: Omit<VehicleMaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('vehicle_maintenance_records')
      .insert(record)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<VehicleMaintenanceRecord>) {
    const { data, error } = await supabase
      .from('vehicle_maintenance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vehicle_maintenance_records')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const routesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        stops(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAllWithDetails() {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        stops(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        stops(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(route: Omit<Route, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('routes')
      .insert(route)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Route>) {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const stopsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('stops')
      .select(`
        *,
        route:routes(*)
      `)
      .order('sequence_order', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByRoute(routeId: string) {
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('route_id', routeId)
      .order('sequence_order', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('stops')
      .select(`
        *,
        route:routes(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(stop: Omit<Stop, 'id' | 'created_at' | 'updated_at'>) {
    const locationStr = typeof stop.location === 'string' 
      ? stop.location 
      : `POINT(${(stop.location as any).lng} ${(stop.location as any).lat})`;
    
    const { data, error } = await supabase
      .from('stops')
      .insert({ ...stop, location: locationStr })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Stop>) {
    const { data, error } = await supabase
      .from('stops')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('stops')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const studentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        pickup_stop:stops!pickup_stop_id(*),
        dropoff_stop:stops!dropoff_stop_id(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        pickup_stop:stops!pickup_stop_id(*),
        dropoff_stop:stops!dropoff_stop_id(*)
      `)
      .eq('is_active', true)
      .order('full_name', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        pickup_stop:stops!pickup_stop_id(*),
        dropoff_stop:stops!dropoff_stop_id(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getParents(studentId: string) {
    const { data, error } = await supabase
      .from('student_parents')
      .select(`
        *,
        parent:profiles(*)
      `)
      .eq('student_id', studentId);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async addParent(studentId: string, parentId: string, relationship: string, isPrimary: boolean = false) {
    const { data, error } = await supabase
      .from('student_parents')
      .insert({
        student_id: studentId,
        parent_id: parentId,
        relationship,
        is_primary: isPrimary,
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async removeParent(studentId: string, parentId: string) {
    const { error } = await supabase
      .from('student_parents')
      .delete()
      .eq('student_id', studentId)
      .eq('parent_id', parentId);
    if (error) throw error;
  },
};

export const tripsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        vehicle:vehicles(*),
        driver:profiles(*),
        route:routes(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        vehicle:vehicles(*),
        driver:profiles(*),
        route:routes(*)
      `)
      .eq('status', 'in_progress')
      .order('actual_start', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        vehicle:vehicles(*),
        driver:profiles(*),
        route:routes(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Trip>) {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async startTrip(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .update({
        status: 'in_progress',
        actual_start: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async endTrip(id: string) {
    const { data, error } = await supabase
      .from('trips')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const locationLogsApi = {
  async getByTrip(tripId: string) {
    const { data, error } = await supabase
      .from('location_logs')
      .select('*')
      .eq('trip_id', tripId)
      .order('recorded_at', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getRecent(vehicleId: string, minutes: number = 60) {
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('location_logs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(log: Omit<LocationLog, 'id' | 'created_at'>) {
    const locationStr = typeof log.location === 'string'
      ? log.location
      : `POINT(${(log.location as any).lng} ${(log.location as any).lat})`;
    
    const { data, error } = await supabase
      .from('location_logs')
      .insert({ ...log, location: locationStr })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const tripEventsApi = {
  async getByTrip(tripId: string) {
    const { data, error } = await supabase
      .from('trip_events')
      .select(`
        *,
        stop:stops(*),
        student:students(*)
      `)
      .eq('trip_id', tripId)
      .order('event_time', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(event: Omit<TripEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('trip_events')
      .insert(event)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const notificationsApi = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUnread(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const [vehicles, trips, students, routes] = await Promise.all([
      supabase.from('vehicles').select('status', { count: 'exact', head: true }),
      supabase.from('trips').select('status', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('routes').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    const maintenanceVehicles = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'maintenance');

    return {
      total_vehicles: vehicles.count || 0,
      active_trips: trips.count || 0,
      total_alerts: 0,
      maintenance_vehicles: maintenanceVehicles.count || 0,
      total_students: students.count || 0,
      total_routes: routes.count || 0,
    };
  },
};
