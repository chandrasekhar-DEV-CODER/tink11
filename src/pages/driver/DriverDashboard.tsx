import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Gauge, Clock, Power } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { driversAuthApi, gpsTrackingApi } from '@/db/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  useEffect(() => {
    checkTrackingStatus();
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const checkTrackingStatus = async () => {
    if (!user) return;
    
    try {
      const driver = await driversAuthApi.getById(user.id);
      if (driver && driver.is_tracking) {
        setIsTracking(true);
        startGPSTracking();
      }
    } catch (error) {
      console.error('Error checking tracking status:', error);
    }
  };

  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed, heading: gpsHeading, accuracy: gpsAccuracy } = position.coords;
        
        setCurrentLocation({ lat: latitude, lng: longitude });
        setCurrentSpeed(speed ? Math.round(speed * 3.6) : 0);
        setHeading(gpsHeading);
        setAccuracy(gpsAccuracy);
        setLastUpdate(new Date());

        const now = Date.now();
        if (now - lastLogTimeRef.current >= 10000) {
          lastLogTimeRef.current = now;

          try {
            await gpsTrackingApi.logLocation({
              driver_id: user!.id,
              vehicle_id: user!.vehicle_id || null,
              latitude,
              longitude,
              speed: speed ? Math.round(speed * 3.6) : null,
              heading: gpsHeading || null,
              accuracy: gpsAccuracy || null,
              recorded_at: new Date().toISOString()
            });

            await driversAuthApi.updateLocation(user!.id, latitude, longitude);
          } catch (error) {
            console.error('Error logging GPS data:', error);
          }
        }
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error(`GPS Error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleStartTracking = async () => {
    if (!user) return;

    try {
      await driversAuthApi.startTracking(user.id);
      setIsTracking(true);
      startGPSTracking();
      toast.success('GPS tracking started successfully');
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start tracking');
    }
  };

  const handleStopTracking = async () => {
    if (!user) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    try {
      await driversAuthApi.stopTracking(user.id);
      setIsTracking(false);
      setCurrentLocation(null);
      setCurrentSpeed(0);
      toast.success('GPS tracking stopped');
    } catch (error) {
      console.error('Error stopping tracking:', error);
      toast.error('Failed to stop tracking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isTracking ? 'bg-primary/20 animate-pulse' : 'bg-muted'
            }`}>
              <Navigation className={`w-10 h-10 ${isTracking ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Driver Console</h1>
          <p className="text-muted-foreground">
            {isTracking ? 'Broadcasting your location every 10 seconds' : 'Start tracking to broadcast your location'}
          </p>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tracking Status</span>
              <Badge variant={isTracking ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                {isTracking ? '● ON AIR' : '○ OFFLINE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              size="lg"
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              variant={isTracking ? 'destructive' : 'default'}
              className="w-full h-20 text-2xl font-bold"
            >
              <Power className="w-8 h-8 mr-3" />
              {isTracking ? 'STOP TRIP' : 'START TRIP'}
            </Button>

            {isTracking && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Gauge className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Current Speed</span>
                    </div>
                    <div className="text-4xl font-bold text-primary">{currentSpeed} km/h</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">GPS Accuracy</span>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {accuracy ? `${Math.round(accuracy)}m` : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                {currentLocation && (
                  <>
                    <Card className="bg-card/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-muted-foreground">Latitude</span>
                        </div>
                        <div className="text-2xl font-mono text-foreground">
                          {currentLocation.lat.toFixed(6)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-muted-foreground">Longitude</span>
                        </div>
                        <div className="text-2xl font-mono text-foreground">
                          {currentLocation.lng.toFixed(6)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {heading !== null && (
                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Navigation className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Heading</span>
                      </div>
                      <div className="text-3xl font-bold text-primary">{Math.round(heading)}°</div>
                    </CardContent>
                  </Card>
                )}

                {lastUpdate && (
                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Last Update</span>
                      </div>
                      <div className="text-lg font-medium text-foreground">
                        {lastUpdate.toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant bg-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-primary">📡 How GPS Tracking Works:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your location is captured using high-accuracy GPS</li>
                <li>Position updates are sent to the server every 10 seconds</li>
                <li>Admin and parents can see your real-time location on the map</li>
                <li>All data is encrypted and secure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
