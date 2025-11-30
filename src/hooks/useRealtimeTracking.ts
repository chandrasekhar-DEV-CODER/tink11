import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import type { DriverAuth } from '@/types/types';

interface VehicleLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'moving' | 'stopped' | 'offline';
  speed?: number;
  heading?: number;
  lastUpdate?: string;
}

export function useRealtimeTracking() {
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();

    const channel = supabase
      .channel('driver_locations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers_auth'
        },
        (payload) => {
          const driver = payload.new as DriverAuth;
          if (driver.is_tracking && driver.current_latitude && driver.current_longitude) {
            updateVehicleLocation(driver);
          }
        }
      )
      .subscribe();

    const pollInterval = setInterval(loadInitialData, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers_auth')
        .select('*')
        .eq('is_tracking', true)
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null);

      if (error) throw error;

      const vehicleData: VehicleLocation[] = (data || []).map(driver => ({
        id: driver.id,
        name: driver.full_name,
        lat: driver.current_latitude!,
        lng: driver.current_longitude!,
        status: determineStatus(driver.last_location_update),
        lastUpdate: driver.last_location_update || undefined
      }));

      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVehicleLocation = (driver: DriverAuth) => {
    setVehicles(prev => {
      const existing = prev.find(v => v.id === driver.id);
      const newVehicle: VehicleLocation = {
        id: driver.id,
        name: driver.full_name,
        lat: driver.current_latitude!,
        lng: driver.current_longitude!,
        status: determineStatus(driver.last_location_update),
        lastUpdate: driver.last_location_update || undefined
      };

      if (existing) {
        return prev.map(v => v.id === driver.id ? newVehicle : v);
      } else {
        return [...prev, newVehicle];
      }
    });
  };

  const determineStatus = (lastUpdate: string | null): 'moving' | 'stopped' | 'offline' => {
    if (!lastUpdate) return 'offline';
    
    const updateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    const diffMinutes = (now - updateTime) / 1000 / 60;

    if (diffMinutes > 5) return 'offline';
    if (diffMinutes > 2) return 'stopped';
    return 'moving';
  };

  return { vehicles, loading, refresh: loadInitialData };
}
