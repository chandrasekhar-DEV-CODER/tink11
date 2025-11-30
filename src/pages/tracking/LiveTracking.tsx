import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Users, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeTracking } from '@/hooks/useRealtimeTracking';
import { studentsAuthApi } from '@/db/authApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LiveMap from '@/components/map/LiveMap';

export default function LiveTracking() {
  const { user } = useAuth();
  const { vehicles, loading, refresh } = useRealtimeTracking();
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [assignedVehicleId, setAssignedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    loadUserVehicles();
  }, [user, vehicles]);

  const loadUserVehicles = async () => {
    if (!user) return;

    try {
      if (user.role === 'admin') {
        setFilteredVehicles(vehicles);
      } else if (user.role === 'student') {
        const student = await studentsAuthApi.getById(user.id);
        if (student?.vehicle_id) {
          setAssignedVehicleId(student.vehicle_id);
          const assignedVehicle = vehicles.find(v => v.id === student.vehicle_id);
          setFilteredVehicles(assignedVehicle ? [assignedVehicle] : []);
        }
      } else if (user.role === 'parent') {
        const students = await studentsAuthApi.getByParentId(user.id);
        const vehicleIds = students.map(s => s.vehicle_id).filter(Boolean);
        const parentVehicles = vehicles.filter(v => vehicleIds.includes(v.id));
        setFilteredVehicles(parentVehicles);
      } else if (user.role === 'driver') {
        if (user.vehicle_id) {
          const driverVehicle = vehicles.find(v => v.id === user.id);
          setFilteredVehicles(driverVehicle ? [driverVehicle] : []);
        }
      }
    } catch (error) {
      console.error('Error loading user vehicles:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving':
        return 'bg-primary text-primary-foreground';
      case 'stopped':
        return 'bg-yellow-500 text-yellow-950';
      case 'offline':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'moving':
        return '●';
      case 'stopped':
        return '◐';
      case 'offline':
        return '○';
      default:
        return '○';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Live Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Real-time GPS tracking of active vehicles
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Vehicles
            </CardTitle>
            <Navigation className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : filteredVehicles.length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moving
            </CardTitle>
            <MapPin className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {filteredVehicles.filter(v => v.status === 'moving').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stopped
            </CardTitle>
            <MapPin className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {filteredVehicles.filter(v => v.status === 'stopped').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offline
            </CardTitle>
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {filteredVehicles.filter(v => v.status === 'offline').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Live Map View
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[600px] flex items-center justify-center bg-card rounded-lg">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="h-[600px] flex items-center justify-center bg-card rounded-lg border border-border">
                  <div className="text-center space-y-3 p-6">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-lg font-semibold">No Active Vehicles</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {user?.role === 'admin' 
                        ? 'No drivers are currently tracking their location. Ask drivers to start their trips.'
                        : 'Your assigned vehicle is not currently tracking. The driver may not have started their trip yet.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[600px]">
                  <LiveMap 
                    vehicles={filteredVehicles}
                    center={filteredVehicles[0] ? [filteredVehicles[0].lat, filteredVehicles[0].lng] : undefined}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Vehicle List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading vehicles...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vehicles tracking
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="bg-card/50 border-border">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{vehicle.name}</span>
                            <Badge className={getStatusColor(vehicle.status)}>
                              {getStatusIcon(vehicle.status)} {vehicle.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="font-mono">
                                {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                              </span>
                            </div>
                            {vehicle.speed !== undefined && (
                              <div className="flex items-center gap-2">
                                <Navigation className="w-3 h-3" />
                                <span>{vehicle.speed} km/h</span>
                              </div>
                            )}
                            {vehicle.lastUpdate && (
                              <div className="text-xs text-muted-foreground">
                                Updated: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="card-elegant bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
            <div className="space-y-1">
              <p className="font-semibold text-primary">Real-time Updates Active</p>
              <p className="text-sm text-muted-foreground">
                Vehicle locations are updated automatically every 10-15 seconds. 
                The map refreshes in real-time using Supabase Realtime subscriptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
