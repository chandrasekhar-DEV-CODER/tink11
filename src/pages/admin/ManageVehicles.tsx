import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { transportVehiclesApi } from '@/db/authApi';
import type { TransportVehicle } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<TransportVehicle | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    registration_number: '',
    model: '',
    capacity: '',
    year: '',
    color: '',
    is_active: true
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await transportVehiclesApi.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle?: TransportVehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicle_id: vehicle.vehicle_id,
        registration_number: vehicle.registration_number,
        model: vehicle.model || '',
        capacity: vehicle.capacity?.toString() || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        is_active: vehicle.is_active
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicle_id: '',
        registration_number: '',
        model: '',
        capacity: '',
        year: '',
        color: '',
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.registration_number) {
      toast.error('Vehicle ID and Registration Number are required');
      return;
    }

    try {
      const vehicleData = {
        vehicle_id: formData.vehicle_id,
        registration_number: formData.registration_number,
        model: formData.model || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        year: formData.year ? parseInt(formData.year) : null,
        color: formData.color || null,
        is_active: formData.is_active
      };

      if (editingVehicle) {
        await transportVehiclesApi.update(editingVehicle.id, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        await transportVehiclesApi.create(vehicleData);
        toast.success('Vehicle created successfully');
      }

      setDialogOpen(false);
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await transportVehiclesApi.delete(id);
      toast.success('Vehicle deleted successfully');
      loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold gradient-text">Manage Vehicles</h1>
          <p className="text-muted-foreground mt-1 text-sm xl:text-base">Add, edit, or remove vehicles from your fleet</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update vehicle information' : 'Enter vehicle details to add to your fleet'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_id">Vehicle ID *</Label>
                  <Input
                    id="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    placeholder="BUS001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="School Bus XL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2023"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Yellow"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicle ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Vehicle Fleet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vehicles found. Add your first vehicle to get started.
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                    <TableCell>{vehicle.registration_number}</TableCell>
                    <TableCell>{vehicle.model || '-'}</TableCell>
                    <TableCell>{vehicle.capacity || '-'}</TableCell>
                    <TableCell>{vehicle.year || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                        {vehicle.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(vehicle)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
