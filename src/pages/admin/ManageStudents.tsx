import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Eye, EyeOff, Copy, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { studentsAuthApi, parentsAuthApi, transportVehiclesApi } from '@/db/authApi';
import { generateUsername, generateUsernameFromName, generateSecurePassword, generateStudentId } from '@/utils/accountGenerator';
import type { StudentAuth, ParentAuth, TransportVehicle } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';

interface StudentFormData {
  student_username: string;
  student_password: string;
  full_name: string;
  grade: string;
  parent_username: string;
  parent_password: string;
  parent_full_name: string;
  parent_email: string;
  parent_phone: string;
  parent_address: string;
  vehicle_id: string;
  pickup_location: string;
  pickup_latitude: string;
  pickup_longitude: string;
  dropoff_location: string;
  dropoff_latitude: string;
  dropoff_longitude: string;
}

interface GeneratedCredentials {
  studentUsername: string;
  studentPassword: string;
  parentUsername: string;
  parentPassword: string;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<StudentAuth[]>([]);
  const [parents, setParents] = useState<ParentAuth[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentAuth | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    student_username: '',
    student_password: '',
    full_name: '',
    grade: '',
    parent_username: '',
    parent_password: '',
    parent_full_name: '',
    parent_email: '',
    parent_phone: '',
    parent_address: '',
    vehicle_id: '',
    pickup_location: '',
    pickup_latitude: '',
    pickup_longitude: '',
    dropoff_location: '',
    dropoff_latitude: '',
    dropoff_longitude: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, parentsData, vehiclesData] = await Promise.all([
        studentsAuthApi.getAll(),
        parentsAuthApi.getAll(),
        transportVehiclesApi.getAll()
      ]);
      setStudents(studentsData);
      setParents(parentsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student?: StudentAuth) => {
    if (student) {
      setEditingStudent(student);
      const parent = parents.find(p => p.id === student.parent_id);
      setFormData({
        student_username: student.username,
        student_password: '',
        full_name: student.full_name,
        grade: student.grade || '',
        parent_username: parent?.username || '',
        parent_password: '',
        parent_full_name: parent?.full_name || '',
        parent_email: parent?.email || '',
        parent_phone: parent?.phone || '',
        parent_address: parent?.address || '',
        vehicle_id: student.vehicle_id || '',
        pickup_location: student.pickup_location || '',
        pickup_latitude: student.pickup_latitude?.toString() || '',
        pickup_longitude: student.pickup_longitude?.toString() || '',
        dropoff_location: student.dropoff_location || '',
        dropoff_latitude: student.dropoff_latitude?.toString() || '',
        dropoff_longitude: student.dropoff_longitude?.toString() || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        student_username: '',
        student_password: '',
        full_name: '',
        grade: '',
        parent_username: '',
        parent_password: '',
        parent_full_name: '',
        parent_email: '',
        parent_phone: '',
        parent_address: '',
        vehicle_id: '',
        pickup_location: '',
        pickup_latitude: '',
        pickup_longitude: '',
        dropoff_location: '',
        dropoff_latitude: '',
        dropoff_longitude: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.parent_full_name) {
      toast.error('Student name and parent name are required');
      return;
    }

    if (!editingStudent) {
      if (!formData.student_username || !formData.student_password) {
        toast.error('Student username and password are required');
        return;
      }
      if (!formData.parent_username || !formData.parent_password) {
        toast.error('Parent username and password are required');
        return;
      }
      if (formData.student_password.length < 6 || formData.parent_password.length < 6) {
        toast.error('Passwords must be at least 6 characters');
        return;
      }
    }

    try {
      if (editingStudent) {
        await updateStudent();
      } else {
        await createStudentWithParent();
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const createStudentWithParent = async () => {
    const parentData = {
      username: formData.parent_username,
      password_hash: formData.parent_password,
      full_name: formData.parent_full_name,
      email: formData.parent_email || null,
      phone: formData.parent_phone || null,
      address: formData.parent_address || null,
      is_active: true
    };

    const newParent = await parentsAuthApi.create(parentData);

    const studentData = {
      username: formData.student_username,
      password_hash: formData.student_password,
      full_name: formData.full_name,
      grade: formData.grade || null,
      parent_id: newParent.id,
      vehicle_id: formData.vehicle_id || null,
      pickup_location: formData.pickup_location || null,
      pickup_latitude: formData.pickup_latitude ? parseFloat(formData.pickup_latitude) : null,
      pickup_longitude: formData.pickup_longitude ? parseFloat(formData.pickup_longitude) : null,
      dropoff_location: formData.dropoff_location || null,
      dropoff_latitude: formData.dropoff_latitude ? parseFloat(formData.dropoff_latitude) : null,
      dropoff_longitude: formData.dropoff_longitude ? parseFloat(formData.dropoff_longitude) : null,
      is_active: true
    };

    await studentsAuthApi.create(studentData);

    setGeneratedCredentials({
      studentUsername: formData.student_username,
      studentPassword: formData.student_password,
      parentUsername: formData.parent_username,
      parentPassword: formData.parent_password
    });

    setDialogOpen(false);
    setCredentialsDialogOpen(true);
    loadData();
    toast.success('Student and parent accounts created successfully');
  };

  const updateStudent = async () => {
    if (!editingStudent) return;

    const parent = parents.find(p => p.id === editingStudent.parent_id);
    
    if (parent) {
      await parentsAuthApi.update(parent.id, {
        full_name: formData.parent_full_name,
        email: formData.parent_email || null,
        phone: formData.parent_phone || null,
        address: formData.parent_address || null
      });
    }

    await studentsAuthApi.update(editingStudent.id, {
      full_name: formData.full_name,
      grade: formData.grade || null,
      vehicle_id: formData.vehicle_id || null,
      pickup_location: formData.pickup_location || null,
      pickup_latitude: formData.pickup_latitude ? parseFloat(formData.pickup_latitude) : null,
      pickup_longitude: formData.pickup_longitude ? parseFloat(formData.pickup_longitude) : null,
      dropoff_location: formData.dropoff_location || null,
      dropoff_latitude: formData.dropoff_latitude ? parseFloat(formData.dropoff_latitude) : null,
      dropoff_longitude: formData.dropoff_longitude ? parseFloat(formData.dropoff_longitude) : null
    });

    setDialogOpen(false);
    loadData();
    toast.success('Student updated successfully');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This will also deactivate the associated parent account.')) return;

    try {
      await studentsAuthApi.delete(id);
      toast.success('Student deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = parents.find(p => p.id === parentId);
    return parent?.full_name || '-';
  };

  const getVehicleName = (vehicleId: string | null) => {
    if (!vehicleId) return '-';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.vehicle_id || '-';
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const parent = parents.find(p => p.id === student.parent_id);
    return (
      student.full_name.toLowerCase().includes(searchLower) ||
      student.username.toLowerCase().includes(searchLower) ||
      student.grade?.toLowerCase().includes(searchLower) ||
      parent?.full_name.toLowerCase().includes(searchLower) ||
      parent?.email?.toLowerCase().includes(searchLower) ||
      parent?.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold gradient-text">Manage Students</h1>
          <p className="text-muted-foreground mt-1 text-sm xl:text-base">Add, edit, or remove students and their parent accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? 'Update student and parent information' 
                  : 'Enter student details and set login credentials for both student and parent.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="Grade 5"
                      />
                    </div>
                  </div>
                  
                  {!editingStudent && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student_username">Student Username *</Label>
                        <Input
                          id="student_username"
                          value={formData.student_username}
                          onChange={(e) => setFormData({ ...formData, student_username: e.target.value })}
                          placeholder="johndoe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student_password">Student Password *</Label>
                        <div className="relative">
                          <Input
                            id="student_password"
                            type={showPasswords ? 'text' : 'password'}
                            value={formData.student_password}
                            onChange={(e) => setFormData({ ...formData, student_password: e.target.value })}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPasswords(!showPasswords)}
                          >
                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
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

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_full_name">Parent Full Name *</Label>
                      <Input
                        id="parent_full_name"
                        value={formData.parent_full_name}
                        onChange={(e) => setFormData({ ...formData, parent_full_name: e.target.value })}
                        placeholder="Jane Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_phone">Phone Number</Label>
                      <Input
                        id="parent_phone"
                        value={formData.parent_phone}
                        onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                  
                  {!editingStudent && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parent_username">Parent Username *</Label>
                        <Input
                          id="parent_username"
                          value={formData.parent_username}
                          onChange={(e) => setFormData({ ...formData, parent_username: e.target.value })}
                          placeholder="janedoe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_password">Parent Password *</Label>
                        <Input
                          id="parent_password"
                          type={showPasswords ? 'text' : 'password'}
                          value={formData.parent_password}
                          onChange={(e) => setFormData({ ...formData, parent_password: e.target.value })}
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent_email">Email</Label>
                      <Input
                        id="parent_email"
                        type="email"
                        value={formData.parent_email}
                        onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                        placeholder="parent@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_address">Address</Label>
                      <Input
                        id="parent_address"
                        value={formData.parent_address}
                        onChange={(e) => setFormData({ ...formData, parent_address: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary">Pickup & Dropoff Locations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup_location">Pickup Location</Label>
                      <Input
                        id="pickup_location"
                        value={formData.pickup_location}
                        onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                        placeholder="Home Address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropoff_location">Dropoff Location</Label>
                      <Input
                        id="dropoff_location"
                        value={formData.dropoff_location}
                        onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                        placeholder="School Address"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup_latitude">Pickup Latitude</Label>
                      <Input
                        id="pickup_latitude"
                        type="number"
                        step="any"
                        value={formData.pickup_latitude}
                        onChange={(e) => setFormData({ ...formData, pickup_latitude: e.target.value })}
                        placeholder="17.3850"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickup_longitude">Pickup Longitude</Label>
                      <Input
                        id="pickup_longitude"
                        type="number"
                        step="any"
                        value={formData.pickup_longitude}
                        onChange={(e) => setFormData({ ...formData, pickup_longitude: e.target.value })}
                        placeholder="78.4867"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropoff_latitude">Dropoff Latitude</Label>
                      <Input
                        id="dropoff_latitude"
                        type="number"
                        step="any"
                        value={formData.dropoff_latitude}
                        onChange={(e) => setFormData({ ...formData, dropoff_latitude: e.target.value })}
                        placeholder="17.3850"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropoff_longitude">Dropoff Longitude</Label>
                      <Input
                        id="dropoff_longitude"
                        type="number"
                        step="any"
                        value={formData.dropoff_longitude}
                        onChange={(e) => setFormData({ ...formData, dropoff_longitude: e.target.value })}
                        placeholder="78.4867"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Create Student & Parent'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Accounts Created Successfully!</DialogTitle>
            <DialogDescription>
              Save these credentials securely. They will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary">Student Account</h4>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {generatedCredentials.studentUsername}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.studentUsername, 'student-username')}
                      >
                        {copiedField === 'student-username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {showPasswords ? generatedCredentials.studentPassword : '••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.studentPassword, 'student-password')}
                      >
                        {copiedField === 'student-password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary">Parent Account</h4>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {generatedCredentials.parentUsername}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.parentUsername, 'parent-username')}
                      >
                        {copiedField === 'parent-username' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Password:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {showPasswords ? generatedCredentials.parentPassword : '••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCredentials.parentPassword, 'parent-password')}
                      >
                        {copiedField === 'parent-password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPasswords ? 'Hide' : 'Show'} Passwords
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)} className="w-full sm:w-auto">
              I've Saved the Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="card-elegant">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Directory ({filteredStudents.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No students found matching "${searchTerm}"` : 'No students found. Add your first student to get started.'}
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead>Pickup Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.grade || '-'}</TableCell>
                    <TableCell>{getParentName(student.parent_id)}</TableCell>
                    <TableCell>{getVehicleName(student.vehicle_id)}</TableCell>
                    <TableCell>{student.pickup_location || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? 'default' : 'secondary'}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(student)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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

      <Card className="card-elegant bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-primary">🔐 Automatic Account Generation:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>When you add a student, both student and parent accounts are created automatically</li>
              <li>Usernames are generated based on full names (e.g., john.doe)</li>
              <li>Secure random passwords are generated for both accounts</li>
              <li>Credentials are shown once after creation - make sure to save them</li>
              <li>Parent accounts are automatically linked to their students</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
