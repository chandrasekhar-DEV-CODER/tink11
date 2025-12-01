import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { stopsApi, routesApi } from '@/db/api';
import type { Stop, StopWithRoute, Route } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Stops() {
  const [stops, setStops] = useState<StopWithRoute[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    route_id: '',
    latitude: '',
    longitude: '',
    sequence_order: '',
    estimated_arrival_time: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stopsData, routesData] = await Promise.all([
        stopsApi.getAll(),
        routesApi.getActive(),
      ]);
      setStops(stopsData);
      setRoutes(routesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load stops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide latitude and longitude');
      return;
    }

    try {
      const stopData = {
        name: formData.name,
        route_id: formData.route_id || null,
        location: `POINT(${formData.longitude} ${formData.latitude})`,
        sequence_order: formData.sequence_order ? parseInt(formData.sequence_order) : 0,
        estimated_arrival_time: formData.estimated_arrival_time || null,
      };

      if (editingStop) {
        await stopsApi.update(editingStop.id, stopData);
        toast.success('Stop updated successfully');
      } else {
        await stopsApi.create(stopData);
        toast.success('Stop created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving stop:', error);
      toast.error('Failed to save stop');
    }
  };

  const handleEdit = (stop: Stop) => {
    setEditingStop(stop);
    const locationMatch = stop.location?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    const longitude = locationMatch ? locationMatch[1] : '';
    const latitude = locationMatch ? locationMatch[2] : '';
    
    setFormData({
      name: stop.name,
      route_id: stop.route_id || '',
      latitude,
      longitude,
      sequence_order: stop.sequence_order?.toString() || '',
      estimated_arrival_time: stop.estimated_arrival_time || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;
    
    try {
      await stopsApi.delete(id);
      toast.success('Stop deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting stop:', error);
      toast.error('Failed to delete stop');
    }
  };

  const resetForm = () => {
    setEditingStop(null);
    setFormData({
      name: '',
      route_id: '',
      latitude: '',
      longitude: '',
      sequence_order: '',
      estimated_arrival_time: '',
    });
  };

  if (loading) {
    return (
      <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Stops</h1>
          <p className="text-muted-foreground mt-1">Manage bus stop locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Stop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStop ? 'Edit Stop' : 'Add New Stop'}</DialogTitle>
              <DialogDescription>
                {editingStop ? 'Update stop information' : 'Create a new bus stop'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stop Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Street & 5th Ave"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route_id">Route</Label>
                <Select value={formData.route_id} onValueChange={(value) => setFormData({ ...formData, route_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No route</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sequence_order">Sequence Order</Label>
                <Input
                  id="sequence_order"
                  type="number"
                  value={formData.sequence_order}
                  onChange={(e) => setFormData({ ...formData, sequence_order: e.target.value })}
                  placeholder="Order in route (e.g., 1, 2, 3)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_arrival_time">Estimated Arrival Time</Label>
                <Input
                  id="estimated_arrival_time"
                  type="time"
                  value={formData.estimated_arrival_time}
                  onChange={(e) => setFormData({ ...formData, estimated_arrival_time: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStop ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>All Stops</CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No stops found. Add your first stop to get started.</p>
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stop Name</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Sequence</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stops.map((stop) => {
                    const locationMatch = stop.location?.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                    const coords = locationMatch ? `${locationMatch[2]}, ${locationMatch[1]}` : '-';
                    
                    return (
                      <TableRow key={stop.id}>
                        <TableCell className="font-medium">{stop.name}</TableCell>
                        <TableCell>{stop.route?.name || 'Unassigned'}</TableCell>
                        <TableCell>{stop.sequence_order}</TableCell>
                        <TableCell>{stop.estimated_arrival_time || '-'}</TableCell>
                        <TableCell className="text-xs">{coords}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(stop)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(stop.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
