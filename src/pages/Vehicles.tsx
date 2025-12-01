import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bus } from 'lucide-react';
import { vehiclesApi, profilesApi } from '@/db/api';
import type { Vehicle, VehicleWithDriver, Profile } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    capacity: '',
    imei: '',
    status: 'active' as 'active' | 'maintenance' | 'retired',
    driver_id: '',
    vin: '',
    year: '',
    insurance_expiry: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    maintenance_notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, driversData] = await Promise.all([
        vehiclesApi.getAll(),
        profilesApi.getByRole('driver'),
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vehicleData = {
        plate_number: formData.plate_number,
        model: formData.model || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        imei: formData.imei || null,
        status: formData.status,
        driver_id: formData.driver_id && formData.driver_id !== 'none' ? formData.driver_id : null,
        vin: formData.vin || null,
        year: formData.year ? parseInt(formData.year) : null,
        insurance_expiry: formData.insurance_expiry || null,
        last_maintenance_date: formData.last_maintenance_date || null,
        next_maintenance_date: formData.next_maintenance_date || null,
        maintenance_notes: formData.maintenance_notes || null,
        last_location: null,
        last_location_time: null,
      };

      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        await vehiclesApi.create(vehicleData);
        toast.success('Vehicle created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate_number: vehicle.plate_number,
      model: vehicle.model || '',
      capacity: vehicle.capacity?.toString() || '',
      imei: vehicle.imei || '',
      status: vehicle.status,
      driver_id: vehicle.driver_id || '',
      vin: vehicle.vin || '',
      year: vehicle.year?.toString() || '',
      insurance_expiry: vehicle.insurance_expiry || '',
      last_maintenance_date: vehicle.last_maintenance_date || '',
      next_maintenance_date: vehicle.next_maintenance_date || '',
      maintenance_notes: vehicle.maintenance_notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await vehiclesApi.delete(id);
      toast.success('Vehicle deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      plate_number: '',
      model: '',
      capacity: '',
      imei: '',
      status: 'active',
      driver_id: '',
      vin: '',
      year: '',
      insurance_expiry: '',
      last_maintenance_date: '',
      next_maintenance_date: '',
      maintenance_notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      maintenance: { variant: 'secondary', label: 'Maintenance' },
      retired: { variant: 'destructive', label: 'Retired' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <h1 className="text-3xl font-bold gradient-text">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage your school bus fleet</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plate_number">Plate Number *</Label>
                <Input
                  id="plate_number"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI (GPS Device)</Label>
                <Input
                  id="imei"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_id">Assigned Driver</Label>
                <Select value={formData.driver_id} onValueChange={(value) => setFormData({ ...formData, driver_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No driver</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name || driver.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="17-character VIN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2023"
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                <Input
                  id="insurance_expiry"
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
                <Input
                  id="last_maintenance_date"
                  type="date"
                  value={formData.last_maintenance_date}
                  onChange={(e) => setFormData({ ...formData, last_maintenance_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_maintenance_date">Next Maintenance Date</Label>
                <Input
                  id="next_maintenance_date"
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance_notes">Maintenance Notes</Label>
                <Textarea
                  id="maintenance_notes"
                  value={formData.maintenance_notes}
                  onChange={(e) => setFormData({ ...formData, maintenance_notes: e.target.value })}
                  placeholder="General maintenance notes and history"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicle ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>All Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Bus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vehicles found. Add your first vehicle to get started.</p>
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                    <TableCell>{vehicle.model || '-'}</TableCell>
                    <TableCell>{vehicle.capacity || '-'}</TableCell>
                    <TableCell>{vehicle.driver?.full_name || vehicle.driver?.email || 'Unassigned'}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
