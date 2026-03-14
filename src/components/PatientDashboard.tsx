import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useDoctor, useEnsureDoctor } from '@/hooks/useDoctor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Users, LogOut, User, Sparkles, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { PatientActionsMenu } from './dashboard/PatientActionsMenu';

export function PatientDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients, isLoading } = usePatients();
  const { signOut, isPreviewMode } = useAuth();
  const { isAdmin } = useAdmin();
  const { data: doctor } = useDoctor();
  const ensureDoctor = useEnsureDoctor();
  const navigate = useNavigate();

  // Ensure doctor record exists, then refetch
  useEffect(() => {
    if (!isPreviewMode && !doctor) {
      ensureDoctor.mutate(undefined, {
        onSuccess: () => {
          // doctor query will auto-refetch via queryClient invalidation in useEnsureDoctor
        },
      });
    }
  }, [isPreviewMode, doctor]);

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flat-nav sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 5 6 8c0 2 .5 3 1 4s1 2 1 4v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c0-2 .5-3 1-4s1-2 1-4c0-3-2.5-6-6-6z" />
                  <path d="M9 22h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Ortho Smart Suite
                  {isPreviewMode && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Preview
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Clinical Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-xs text-muted-foreground">Doctor ID:</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {doctor?.doctor_code || 'Loading...'}
                </span>
              </div>
              {/* System Operational Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                System Operational
              </div>
              {/* New Case button */}
              <Button onClick={() => navigate('/patient/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Case
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  title="Admin Dashboard"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              )}
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Patients</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Active Cases</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 5 6 8c0 2 .5 3 1 4s1 2 1 4v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c0-2 .5-3 1-4s1-2 1-4c0-3-2.5-6-6-6z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">This Week</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">
                {patients?.filter(
                  (p) => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-foreground font-bold">Patient Records</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredPatients?.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                <Users className="mb-2 h-12 w-12" />
                <p className="font-medium">No patients found</p>
                <Button
                  variant="link"
                  className="mt-2 text-primary font-semibold"
                  onClick={() => navigate('/patient/new')}
                >
                  Add your first patient
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold">Patient ID</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Age</TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground font-semibold">Phone</TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground font-semibold">Chief Complaint</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Last Visit</TableHead>
                      <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients?.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        <TableCell className="font-mono text-sm text-primary font-semibold">
                          {(patient as any).patient_code || '—'}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{patient.name}</TableCell>
                        <TableCell className="text-foreground">{patient.age}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {(patient as any).phone_number || '—'}
                        </TableCell>
                        <TableCell className="hidden max-w-xs truncate md:table-cell text-muted-foreground">
                          {patient.chief_complaint || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(patient.updated_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <PatientActionsMenu
                            patientId={patient.id}
                            patientName={patient.name}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
