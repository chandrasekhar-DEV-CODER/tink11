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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, Archive } from 'lucide-react';
import { studentsApi, stopsApi } from '@/db/api';
import type { Student, StudentWithDetails, Stop } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Students() {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_number: '',
    full_name: '',
    grade: '',
    class: '',
    pickup_stop_id: '',
    dropoff_stop_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, stopsData] = await Promise.all([
        studentsApi.getAll(),
        stopsApi.getAll(),
      ]);
      setStudents(studentsData);
      setStops(stopsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const studentData = {
        student_number: formData.student_number,
        full_name: formData.full_name,
        grade: formData.grade || null,
        class: formData.class || null,
        pickup_stop_id: formData.pickup_stop_id && formData.pickup_stop_id !== 'none' ? formData.pickup_stop_id : null,
        dropoff_stop_id: formData.dropoff_stop_id && formData.dropoff_stop_id !== 'none' ? formData.dropoff_stop_id : null,
        pickup_location: null,
        dropoff_location: null,
        is_active: formData.is_active,
      };

      if (editingStudent) {
        await studentsApi.update(editingStudent.id, studentData);
        toast.success('Student updated successfully');
      } else {
        await studentsApi.create(studentData);
        toast.success('Student created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_number: student.student_number,
      full_name: student.full_name,
      grade: student.grade || '',
      class: student.class || '',
      pickup_stop_id: student.pickup_stop_id || '',
      dropoff_stop_id: student.dropoff_stop_id || '',
      is_active: student.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsApi.delete(id);
      toast.success('Student deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleToggleActive = async (student: Student) => {
    try {
      await studentsApi.update(student.id, { is_active: !student.is_active });
      toast.success(`Student ${!student.is_active ? 'activated' : 'archived'} successfully`);
      loadData();
    } catch (error) {
      console.error('Error toggling student status:', error);
      toast.error('Failed to update student status');
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      student_number: '',
      full_name: '',
      grade: '',
      class: '',
      pickup_stop_id: '',
      dropoff_stop_id: '',
      is_active: true,
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Archived</Badge>
    );
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
          <h1 className="text-3xl font-bold gradient-text">Students</h1>
          <p className="text-muted-foreground mt-1">Manage student profiles and assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information' : 'Add a new student to the system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_number">Student Number *</Label>
                <Input
                  id="student_number"
                  value={formData.student_number}
                  onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                  placeholder="e.g., STU-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., 5th Grade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="e.g., 5A"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_stop_id">Pickup Stop</Label>
                <Select value={formData.pickup_stop_id} onValueChange={(value) => setFormData({ ...formData, pickup_stop_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup stop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No stop assigned</SelectItem>
                    {stops.map((stop) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff_stop_id">Dropoff Stop</Label>
                <Select value={formData.dropoff_stop_id} onValueChange={(value) => setFormData({ ...formData, dropoff_stop_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dropoff stop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No stop assigned</SelectItem>
                    {stops.map((stop) => (
                      <SelectItem key={stop.id} value={stop.id}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active Student</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students found. Add your first student to get started.</p>
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Pickup Stop</TableHead>
                    <TableHead>Dropoff Stop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_number}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.grade || '-'}</TableCell>
                      <TableCell>{student.class || '-'}</TableCell>
                      <TableCell>{student.pickup_stop?.name || 'Unassigned'}</TableCell>
                      <TableCell>{student.dropoff_stop?.name || 'Unassigned'}</TableCell>
                      <TableCell>{getStatusBadge(student.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleActive(student)}
                            title={student.is_active ? 'Archive' : 'Activate'}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
