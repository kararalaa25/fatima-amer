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
import { Search, Plus, Stethoscope, Users, LogOut, User, Sparkles, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { PatientActionsMenu } from './dashboard/PatientActionsMenu';

export function PatientDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients, isLoading } = usePatients();
  const { signOut, isPreviewMode } = useAuth();
  const navigate = useNavigate();

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen mesh-gradient-bg relative">
      {/* Header */}
      <header className="relative z-10 glass-nav sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-card">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Ortho Smart Suite
                  {isPreviewMode && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Preview
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Clinical Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/case-management')}
                className="rounded-2xl glass-card text-muted-foreground hover:text-foreground transition-smooth"
                title="Case Management"
              >
                <FolderOpen className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl glass-card text-muted-foreground hover:text-foreground transition-smooth"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut}
                className="rounded-2xl glass-card text-muted-foreground hover:text-foreground transition-smooth"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10 pb-24">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="glass-card border-0 transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Total Patients
              </CardTitle>
              <div className="h-10 w-10 rounded-2xl glass-card-solid flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Active Cases
              </CardTitle>
              <div className="h-10 w-10 rounded-2xl glass-card-solid flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{patients?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 transition-smooth hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                This Week
              </CardTitle>
              <div className="h-10 w-10 rounded-2xl glass-card-solid flex items-center justify-center">
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
        <Card className="glass-card border-0 overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-foreground font-bold">Patient Records</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 glass-input rounded-2xl h-11 text-foreground placeholder:text-muted-foreground"
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
              <div className="overflow-x-auto rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Age</TableHead>
                      <TableHead className="hidden md:table-cell text-muted-foreground font-semibold">Chief Complaint</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Last Visit</TableHead>
                      <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients?.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer border-border/30 hover:bg-primary/5 transition-smooth"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        <TableCell className="font-semibold text-foreground">{patient.name}</TableCell>
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

      {/* Floating Add Case Button - iOS Style */}
      <button
        onClick={() => navigate('/patient/new')}
        className="fixed bottom-6 right-6 z-50 fab-glass w-16 h-16 flex items-center justify-center"
        aria-label="Add new patient"
      >
        <Plus className="h-7 w-7 text-primary-foreground" />
      </button>
    </div>
  );
}
