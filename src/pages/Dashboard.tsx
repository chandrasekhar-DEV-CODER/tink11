import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Activity, AlertTriangle, Wrench, Users, Route as RouteIcon } from 'lucide-react';
import { dashboardApi, tripsApi } from '@/db/api';
import type { DashboardStats, TripWithDetails } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTrips, setActiveTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tripsData] = await Promise.all([
        dashboardApi.getStats(),
        tripsApi.getActive(),
      ]);
      setStats(statsData);
      setActiveTrips(tripsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hourlyData = [
    { hour: '00:00', vehicles: 0 },
    { hour: '06:00', vehicles: 2 },
    { hour: '07:00', vehicles: 8 },
    { hour: '08:00', vehicles: 12 },
    { hour: '09:00', vehicles: 5 },
    { hour: '12:00', vehicles: 3 },
    { hour: '14:00', vehicles: 6 },
    { hour: '15:00', vehicles: 10 },
    { hour: '16:00', vehicles: 8 },
    { hour: '18:00', vehicles: 2 },
    { hour: '20:00', vehicles: 0 },
  ];

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card className="card-elegant hover:scale-105 transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of your school bus fleet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats?.total_vehicles || 0}
          icon={<Bus className="w-5 h-5 text-primary-foreground" />}
          color="bg-primary"
        />
        <StatCard
          title="Active Trips"
          value={stats?.active_trips || 0}
          icon={<Activity className="w-5 h-5 text-primary-foreground" />}
          color="bg-primary"
        />
        <StatCard
          title="Maintenance"
          value={stats?.maintenance_vehicles || 0}
          icon={<Wrench className="w-5 h-5 text-primary-foreground" />}
          color="bg-secondary"
        />
        <StatCard
          title="Total Students"
          value={stats?.total_students || 0}
          icon={<Users className="w-5 h-5 text-primary-foreground" />}
          color="bg-primary"
        />
        <StatCard
          title="Active Routes"
          value={stats?.total_routes || 0}
          icon={<RouteIcon className="w-5 h-5 text-primary-foreground" />}
          color="bg-primary"
        />
        <StatCard
          title="Alerts"
          value={stats?.total_alerts || 0}
          icon={<AlertTriangle className="w-5 h-5 text-primary-foreground" />}
          color="bg-destructive"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Hourly Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active trips at the moment
                </div>
              ) : (
                activeTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{trip.vehicle?.plate_number || 'Unknown Vehicle'}</p>
                        <p className="text-sm text-muted-foreground">{trip.route?.name || 'No route'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      In Progress
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
