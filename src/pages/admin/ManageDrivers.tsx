import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserCircle, Eye, EyeOff, Copy, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { driversAuthApi, transportVehiclesApi } from '@/db/authApi';
import { generateUsernameFromName, generateSecurePassword, generateLicenseNumber } from '@/utils/accountGenerator';
import type { DriverAuth, TransportVehicle } from '@/types/types';

interface DriverFormData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_id: string;
}

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState<DriverAuth[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<DriverAuth | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    vehicle_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [driversData, vehiclesData] = await Promise.all([
        driversAuthApi.getAll(),
        transportVehiclesApi.getAll()
      ]);
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (driver?: DriverAuth) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        username: driver.username,
        password: '',
        full_name: driver.full_name,
        email: driver.email || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        vehicle_id: driver.vehicle_id || ''
      });
    } else {
      setEditingDriver(null);
      const existingLicenses = drivers.map(d => d.license_number).filter(Boolean) as string[];
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        license_number: generateLicenseNumber(existingLicenses),
        vehicle_id: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name) {
      toast.error('Driver name is required');
      return;
    }

    if (!editingDriver) {
      if (!formData.username) {
        toast.error('Username is required');
        return;
      }
      if (!formData.password) {
        toast.error('Password is required');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    try {
      if (editingDriver) {
        await updateDriver();
      } else {
        await createDriver();
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    }
  };

  const createDriver = async () => {
    const driverData = {
      username: formData.username,
      password_hash: formData.password,
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      license_number: formData.license_number || null,
      vehicle_id: formData.vehicle_id || null,
      is_active: true,
      is_tracking: false,
      current_latitude: null,
      current_longitude: null,
      last_location_update: null
    };

    await driversAuthApi.create(driverData);

    setGeneratedCredentials({ username: formData.username, password: formData.password });
    setDialogOpen(false);
    setCredentialsDialogOpen(true);
    loadData();
    toast.success('Driver account created successfully');
  };

  const updateDriver = async () => {
    if (!editingDriver) return;

    await driversAuthApi.update(editingDriver.id, {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      license_number: formData.license_number || null,
      vehicle_id: formData.vehicle_id || null
    });

    setDialogOpen(false);
    loadData();
    toast.success('Driver updated successfully');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver account?')) return;

    try {
      await driversAuthApi.delete(id);
      toast.success('Driver deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getVehicleName = (vehicleId: string | null) => {
    if (!vehicleId) return '-';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.vehicle_id} (${vehicle.registration_number})` : '-';
  };

  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase();
    return (
      driver.full_name.toLowerCase().includes(searchLower) ||
      driver.username.toLowerCase().includes(searchLower) ||
      driver.email?.toLowerCase().includes(searchLower) ||
      driver.phone?.toLowerCase().includes(searchLower) ||
      driver.license_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Manage Drivers</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove driver accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
              <DialogDescription>
                {editingDriver 
                  ? 'Update driver information' 
                  : 'Enter driver details and set login credentials.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Driver"
                    required
                  />
                </div>
                
                {!editingDriver && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="johndriver"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="DL-A12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_id">Assigned Vehicle</Label>
                  <select
                    id="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background"
                  >
                    <option value="">No Vehicle Assigned</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_id} - {vehicle.registration_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDriver ? 'Update' : 'Create Driver'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Driver Account Created!</DialogTitle>
            <DialogDescription>
              Save these credentials securely. They will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary">Login Credentials</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {generatedCredentials.username}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.username, 'username')}
                      >
                        {copiedField === 'username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {showPassword ? generatedCredentials.password : '••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                      >
                        {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPassword ? 'Hide' : 'Show'} Password
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)}>
              I've Saved the Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Driver Directory ({filteredDrivers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading drivers...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No drivers found matching "${searchTerm}"` : 'No drivers found. Add your first driver to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.full_name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{driver.username}</code>
                    </TableCell>
                    <TableCell>{driver.email || '-'}</TableCell>
                    <TableCell>{driver.phone || '-'}</TableCell>
                    <TableCell>{driver.license_number || '-'}</TableCell>
                    <TableCell>{getVehicleName(driver.vehicle_id)}</TableCell>
                    <TableCell>
                      <Badge variant={driver.is_tracking ? 'default' : 'secondary'}>
                        {driver.is_tracking ? '● Active' : '○ Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(driver)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(driver.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="card-elegant bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-primary">🔐 Driver Account Management:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Driver accounts are created with automatically generated usernames and passwords</li>
              <li>Usernames are based on the driver's full name (e.g., john.driver)</li>
              <li>Secure random passwords are generated for each account</li>
              <li>Drivers can start GPS tracking from their dashboard</li>
              <li>Assign vehicles to drivers for route management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
