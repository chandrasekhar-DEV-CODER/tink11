import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, Clock, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { studentPortalApi, locationTrackingApi } from '@/db/api';
import type { VehicleOnRoute } from '@/types/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentPortal() {
  const [studentNumber, setStudentNumber] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [vehiclesOnRoute, setVehiclesOnRoute] = useState<VehicleOnRoute[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOnRoute | null>(null);
  const [etaInfo, setEtaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn && studentInfo) {
      const interval = setInterval(() => {
        refreshBusLocations();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, studentInfo]);

  const handleLogin = async () => {
    if (!studentNumber.trim()) {
      toast.error('Please enter your student number');
      return;
    }

    try {
      setLoading(true);
      const student = await studentPortalApi.getStudentByNumber(studentNumber);
      
      if (!student) {
        toast.error('Student not found. Please check your student number.');
        return;
      }

      const busInfo = await studentPortalApi.getStudentBusInfo(student.id);
      
      if (!busInfo) {
        toast.error('No bus route assigned to your account.');
        return;
      }

      setStudentInfo(busInfo);
      setVehiclesOnRoute(busInfo.vehicles_on_route || []);
      setIsLoggedIn(true);
      toast.success(`Welcome, ${student.full_name}!`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshBusLocations = async () => {
    if (!studentInfo?.route?.id) return;

    try {
      const vehicles = await locationTrackingApi.getVehiclesOnRoute(studentInfo.route.id);
      setVehiclesOnRoute(vehicles);

      // Update selected vehicle if it's still active
      if (selectedVehicle) {
        const updatedVehicle = vehicles.find(v => v.vehicle_id === selectedVehicle.vehicle_id);
        if (updatedVehicle) {
          setSelectedVehicle(updatedVehicle);
          calculateETA(updatedVehicle);
        }
      }
    } catch (error) {
      console.error('Error refreshing locations:', error);
    }
  };

  const handleSelectVehicle = (vehicle: VehicleOnRoute) => {
    setSelectedVehicle(vehicle);
    calculateETA(vehicle);
  };

  const calculateETA = async (vehicle: VehicleOnRoute) => {
    if (!studentInfo?.pickup_stop?.location) return;

    try {
      // Parse stop location (POINT format)
      const locationMatch = studentInfo.pickup_stop.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (!locationMatch) return;

      const stopLng = parseFloat(locationMatch[1]);
      const stopLat = parseFloat(locationMatch[2]);

      const eta = await studentPortalApi.calculateETA(
        vehicle.latest_latitude,
        vehicle.latest_longitude,
        stopLat,
        stopLng,
        vehicle.latest_speed || 0
      );

      setEtaInfo(eta);
    } catch (error) {
      console.error('Error calculating ETA:', error);
    }
  };

  const handleGetDirections = () => {
    if (!selectedVehicle || !studentInfo?.pickup_stop?.location) return;

    const locationMatch = studentInfo.pickup_stop.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!locationMatch) return;

    const stopLng = parseFloat(locationMatch[1]);
    const stopLat = parseFloat(locationMatch[2]);

    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&origin=${selectedVehicle.latest_latitude},${selectedVehicle.latest_longitude}&destination=${stopLat},${stopLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const isBusMissed = (vehicle: VehicleOnRoute) => {
    if (!etaInfo || !studentInfo?.pickup_stop?.location) return false;

    // Parse stop location
    const locationMatch = studentInfo.pickup_stop.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!locationMatch) return false;

    const stopLng = parseFloat(locationMatch[1]);
    const stopLat = parseFloat(locationMatch[2]);

    // Check if bus has passed the stop (simple check based on heading and distance)
    // This is a simplified version - in production, you'd use more sophisticated logic
    return etaInfo.distance_km > 5 && vehicle.latest_heading !== null;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md card-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl gradient-text">Student Bus Tracker</CardTitle>
            <p className="text-muted-foreground mt-2">Track your school bus in real-time</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="studentNumber" className="text-sm font-medium">
                Student Number
              </label>
              <Input
                id="studentNumber"
                type="text"
                placeholder="Enter your student number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Track My Bus'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Bus Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {studentInfo?.student?.full_name}
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
          Logout
        </Button>
      </div>

      {/* Student Info Card */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>My Route Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-medium">Route:</span>
            <span>{studentInfo?.route?.name} ({studentInfo?.route?.code})</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">Pickup Stop:</span>
            <span>{studentInfo?.pickup_stop?.name}</span>
          </div>
          {studentInfo?.pickup_stop?.estimated_arrival_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">Scheduled Time:</span>
              <span>{studentInfo.pickup_stop.estimated_arrival_time}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buses on Route */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Buses on Your Route ({vehiclesOnRoute.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vehiclesOnRoute.length === 0 ? (
            <div className="text-center py-8">
              <Bus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No buses currently active on your route</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiclesOnRoute.map((vehicle) => (
                <Card
                  key={vehicle.vehicle_id}
                  className={`cursor-pointer transition-all ${
                    selectedVehicle?.vehicle_id === vehicle.vehicle_id
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-1 hover:ring-primary/50'
                  }`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="w-5 h-5 text-primary" />
                        <span className="font-bold">{vehicle.plate_number}</span>
                      </div>
                      <Badge variant={vehicle.trip_status === 'in_progress' ? 'default' : 'secondary'}>
                        {vehicle.trip_status === 'in_progress' ? 'Active' : vehicle.trip_status}
                      </Badge>
                    </div>
                    {vehicle.model && (
                      <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(vehicle.last_update).toLocaleTimeString()}</span>
                      </div>
                      {vehicle.latest_speed !== null && (
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          <span>{Math.round(vehicle.latest_speed)} km/h</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Bus Details */}
      {selectedVehicle && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Bus Details - {selectedVehicle.plate_number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {etaInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">Distance</span>
                  </div>
                  <p className="text-2xl font-bold">{etaInfo.distance_km} km</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">ETA</span>
                  </div>
                  <p className="text-2xl font-bold">{etaInfo.eta_minutes} min</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {etaInfo.is_approaching ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-lg font-bold">
                    {etaInfo.is_approaching ? 'Approaching!' : 'On the way'}
                  </p>
                </div>
              </div>
            )}

            {isBusMissed(selectedVehicle) && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">
                  This bus may have passed your stop
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleGetDirections} className="flex-1 gap-2">
                <Navigation className="w-4 h-4" />
                Get Directions & ETA
              </Button>
              <Button variant="outline" onClick={refreshBusLocations}>
                Refresh Location
              </Button>
            </div>

            {/* Map placeholder - you can integrate a real map here */}
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Map view - Click "Get Directions" to view in Google Maps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
