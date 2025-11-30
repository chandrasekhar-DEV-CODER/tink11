import { useEffect, useState } from 'react';
import { Pencil, Trash2, Users, UserCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { parentsAuthApi, studentsAuthApi } from '@/db/authApi';
import type { ParentAuth, StudentAuth } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';

export default function ManageParents() {
  const [parents, setParents] = useState<ParentAuth[]>([]);
  const [students, setStudents] = useState<StudentAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentAuth | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [parentsData, studentsData] = await Promise.all([
        parentsAuthApi.getAll(),
        studentsAuthApi.getAll()
      ]);
      setParents(parentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (parent: ParentAuth) => {
    setEditingParent(parent);
    setFormData({
      full_name: parent.full_name,
      email: parent.email || '',
      phone: parent.phone || '',
      address: parent.address || '',
      is_active: parent.is_active
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name) {
      toast.error('Parent name is required');
      return;
    }

    if (!editingParent) return;

    try {
      await parentsAuthApi.update(editingParent.id, {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        is_active: formData.is_active
      });

      setDialogOpen(false);
      loadData();
      toast.success('Parent updated successfully');
    } catch (error) {
      console.error('Error updating parent:', error);
      toast.error('Failed to update parent');
    }
  };

  const handleDelete = async (id: string) => {
    const linkedStudents = students.filter(s => s.parent_id === id);
    
    if (linkedStudents.length > 0) {
      toast.error(`Cannot delete parent. ${linkedStudents.length} student(s) are linked to this account.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this parent account?')) return;

    try {
      await parentsAuthApi.delete(id);
      toast.success('Parent deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting parent:', error);
      toast.error('Failed to delete parent');
    }
  };

  const getLinkedStudents = (parentId: string) => {
    return students.filter(s => s.parent_id === parentId);
  };

  const filteredParents = parents.filter(parent => {
    const searchLower = searchTerm.toLowerCase();
    const linkedStudents = getLinkedStudents(parent.id);
    const studentNames = linkedStudents.map(s => s.full_name).join(' ');
    return (
      parent.full_name.toLowerCase().includes(searchLower) ||
      parent.username.toLowerCase().includes(searchLower) ||
      parent.email?.toLowerCase().includes(searchLower) ||
      parent.phone?.toLowerCase().includes(searchLower) ||
      parent.address?.toLowerCase().includes(searchLower) ||
      studentNames.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 xl:p-6 space-y-4 xl:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold gradient-text">Manage Parents</h1>
          <p className="text-muted-foreground mt-1 text-sm xl:text-base">View and edit parent accounts</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Parent Account</DialogTitle>
            <DialogDescription>
              Update parent information. Username and password cannot be changed here.
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
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="parent@example.com"
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
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
                <Label htmlFor="is_active">Active Account</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Parent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Parents
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : parents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </CardTitle>
            <UserCheck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {parents.filter(p => p.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked Students
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {students.filter(s => s.parent_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Parent Directory ({filteredParents.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search parents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading parents...</div>
          ) : filteredParents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No parents found matching "${searchTerm}"` : 'No parents found. Parent accounts are created automatically when you add students.'}
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Linked Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.map((parent) => {
                  const linkedStudents = getLinkedStudents(parent.id);
                  return (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">{parent.full_name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{parent.username}</code>
                      </TableCell>
                      <TableCell>{parent.email || '-'}</TableCell>
                      <TableCell>{parent.phone || '-'}</TableCell>
                      <TableCell>
                        {linkedStudents.length > 0 ? (
                          <div className="space-y-1">
                            {linkedStudents.map(student => (
                              <div key={student.id} className="text-sm">
                                {student.full_name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No students</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={parent.is_active ? 'default' : 'secondary'}>
                          {parent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(parent)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(parent.id)}
                            disabled={linkedStudents.length > 0}
                          >
                            <Trash2 className="w-4 h-4" />
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

      <Card className="card-elegant bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-primary">ℹ️ Parent Account Management:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Parent accounts are automatically created when you add a student</li>
              <li>Each parent can be linked to multiple students</li>
              <li>You cannot delete a parent account if students are still linked to it</li>
              <li>To remove a parent, first delete or reassign all linked students</li>
              <li>Deactivating a parent account prevents login but preserves the data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
