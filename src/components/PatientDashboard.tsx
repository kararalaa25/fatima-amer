import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
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
import { Search, UserPlus, Stethoscope, Users, LogOut, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { PatientActionsMenu } from './dashboard/PatientActionsMenu';

export function PatientDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients, isLoading } = usePatients();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen cosmic-bg relative">
      {/* Planet decoration */}
      <div className="cosmic-planet animate-float" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 animate-glow-pulse">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Ortho Smart Suite
                  <Sparkles className="h-5 w-5 text-accent" />
                </h1>
                <p className="text-sm text-muted-foreground">Luxurious Clinical Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/patient/new')} 
                size="lg"
                className="glow-border transition-smooth"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Add New Patient
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="glass-card border-0 glow-border transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 glow-border-accent transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Cases
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 glow-border transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {patients?.filter(
                  (p) => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Table */}
        <Card className="glass-card border-0 glow-border overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-foreground">Patient Records</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground"
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
                <p>No patients found</p>
                <Button
                  variant="link"
                  className="mt-2 text-primary"
                  onClick={() => navigate('/patient/new')}
                >
                  Add your first patient
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-muted/30">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Age</TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground">Chief Complaint</TableHead>
                      <TableHead className="text-muted-foreground">Last Visit</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients?.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer border-border/30 hover:bg-primary/5 transition-smooth"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        <TableCell className="font-medium text-foreground">{patient.name}</TableCell>
                        <TableCell className="text-foreground">{patient.age}</TableCell>
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
