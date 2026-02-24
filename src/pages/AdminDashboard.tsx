import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Loader2, Shield, Users, UserCheck, UserX, ShieldAlert, Clock, Check, Ban,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    isAdmin, isCheckingAdmin, users, isLoadingUsers,
    activateUser, banUser, pendingUsers, activeUsers,
  } = useAdmin();

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage users and access control</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users?.length || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-success">{activeUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-warning">{pendingUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="pending" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Pending ({pendingUsers.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> All Users
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="pending" className="mt-0">
                    {pendingUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending users</p>
                      </div>
                    ) : (
                      <UserTable users={pendingUsers} onActivate={(userId) => activateUser.mutate(userId)} onBan={(userId) => banUser.mutate(userId)} isLoading={activateUser.isPending || banUser.isPending} />
                    )}
                  </TabsContent>
                  <TabsContent value="all" className="mt-0">
                    {!users || users.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    ) : (
                      <UserTable users={users} onActivate={(userId) => activateUser.mutate(userId)} onBan={(userId) => banUser.mutate(userId)} isLoading={activateUser.isPending || banUser.isPending} />
                    )}
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

interface UserTableProps {
  users: Array<{ id: string; user_id: string; full_name: string; email: string; is_activated: boolean; created_at: string; roles: string[] }>;
  onActivate: (userId: string) => void;
  onBan: (userId: string) => void;
  isLoading: boolean;
}

function UserTable({ users, onActivate, onBan, isLoading }: UserTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                {user.is_activated ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    <UserCheck className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {!user.is_activated ? (
                    <Button size="sm" variant="outline" className="bg-success/10 text-success border-success/20 hover:bg-success/20" onClick={() => onActivate(user.user_id)} disabled={isLoading}>
                      <Check className="h-4 w-4 mr-1" /> Activate
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" onClick={() => onBan(user.user_id)} disabled={isLoading}>
                      <Ban className="h-4 w-4 mr-1" /> Ban
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
