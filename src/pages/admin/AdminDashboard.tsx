import { useEffect, useState } from 'react';
import { Bus, Users, UserCircle, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transportVehiclesApi, driversAuthApi, studentsAuthApi, parentsAuthApi } from '@/db/authApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalStudents: 0,
    totalParents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [vehicles, drivers, students, parents] = await Promise.all([
        transportVehiclesApi.getAll(),
        driversAuthApi.getAll(),
        studentsAuthApi.getAll(),
        parentsAuthApi.getAll()
      ]);

      setStats({
        totalVehicles: vehicles.length,
        totalDrivers: drivers.length,
        totalStudents: students.length,
        totalParents: parents.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Car,
      color: 'text-primary'
    },
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      icon: UserCircle,
      color: 'text-blue-400'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'Total Parents',
      value: stats.totalParents,
      icon: Users,
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your school transportation system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-elegant">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use the sidebar navigation to manage:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Vehicles - Add, edit, or remove vehicles</li>
                <li>Drivers - Manage driver accounts and assignments</li>
                <li>Students - Manage student profiles and routes</li>
                <li>Parents - Manage parent accounts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Status</span>
                <span className="text-sm font-medium text-primary">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-primary">● Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GPS Tracking</span>
                <span className="text-sm font-medium text-primary">● Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
