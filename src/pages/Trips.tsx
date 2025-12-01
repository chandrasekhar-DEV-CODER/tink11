import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { History, Filter, Download } from 'lucide-react';
import { tripsApi } from '@/db/api';
import type { TripWithDetails, TripStatus } from '@/types/types';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Trips() {
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsData = await tripsApi.getAll();
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    if (filters.status !== 'all') {
      filtered = filtered.filter(trip => trip.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(trip => {
        const tripDate = trip.actual_start || trip.scheduled_start;
        return tripDate && new Date(tripDate) >= new Date(filters.dateFrom);
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(trip => {
        const tripDate = trip.actual_start || trip.scheduled_start;
        return tripDate && new Date(tripDate) <= new Date(filters.dateTo);
      });
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.vehicle?.plate_number?.toLowerCase().includes(searchLower) ||
        trip.driver?.full_name?.toLowerCase().includes(searchLower) ||
        trip.route?.name?.toLowerCase().includes(searchLower) ||
        trip.route?.code?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTrips(filtered);
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ['Trip ID', 'Vehicle', 'Driver', 'Route', 'Status', 'Scheduled Start', 'Actual Start', 'Actual End'].join(','),
        ...filteredTrips.map(trip => [
          trip.id,
          trip.vehicle?.plate_number || '-',
          trip.driver?.full_name || '-',
          trip.route?.name || '-',
          trip.status,
          trip.scheduled_start || '-',
          trip.actual_start || '-',
          trip.actual_end || '-',
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Trip history exported successfully');
    } catch (error) {
      console.error('Error exporting trips:', error);
      toast.error('Failed to export trip history');
    }
  };

  const getStatusBadge = (status: TripStatus) => {
    const variants: Record<TripStatus, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '-';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
          <h1 className="text-3xl font-bold gradient-text">Trip History</h1>
          <p className="text-muted-foreground mt-1">View past trips and analytics</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Vehicle, driver, route..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Trip Records ({filteredTrips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {trips.length === 0 
                  ? 'No trip history found.' 
                  : 'No trips match the current filters.'}
              </p>
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Ended</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.vehicle?.plate_number || '-'}
                      </TableCell>
                      <TableCell>{trip.driver?.full_name || '-'}</TableCell>
                      <TableCell>
                        {trip.route ? (
                          <div>
                            <div className="font-medium">{trip.route.name}</div>
                            <div className="text-xs text-muted-foreground">{trip.route.code}</div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(trip.scheduled_start)}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(trip.actual_start)}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(trip.actual_end)}</TableCell>
                      <TableCell>{calculateDuration(trip.actual_start, trip.actual_end)}</TableCell>
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
