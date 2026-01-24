import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Loader2,
  Shield,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleColors: Record<AppRole, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  doctor: 'bg-primary/10 text-primary border-primary/20',
  user: 'bg-muted text-muted-foreground border-border',
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <ShieldAlert className="h-3 w-3" />,
  doctor: <ShieldCheck className="h-3 w-3" />,
  user: <Shield className="h-3 w-3" />,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    isAdmin,
    isCheckingAdmin,
    users,
    isLoadingUsers,
    toggleActivation,
    addRole,
    removeRole,
    pendingUsers,
    activeUsers,
  } = useAdmin();

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen mesh-gradient-bg flex items-center justify-center">
        <div className="glass-card p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen mesh-gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-card-solid">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have admin privileges to access this page.
            </CardDescription>
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
    <div className="min-h-screen mesh-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card-solid">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users?.length || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card-solid">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{activeUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card-solid">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingUsers.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Tabs */}
        <Card className="glass-card-solid">
          <Tabs defaultValue="pending" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingUsers.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Users
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
                      <UserTable
                        users={pendingUsers}
                        onToggleActivation={(userId, activate) =>
                          toggleActivation.mutate({ userId, activate })
                        }
                        onAddRole={(userId, role) => addRole.mutate({ userId, role })}
                        onRemoveRole={(userId, role) => removeRole.mutate({ userId, role })}
                        isLoading={toggleActivation.isPending || addRole.isPending || removeRole.isPending}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="all" className="mt-0">
                    {!users || users.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    ) : (
                      <UserTable
                        users={users}
                        onToggleActivation={(userId, activate) =>
                          toggleActivation.mutate({ userId, activate })
                        }
                        onAddRole={(userId, role) => addRole.mutate({ userId, role })}
                        onRemoveRole={(userId, role) => removeRole.mutate({ userId, role })}
                        isLoading={toggleActivation.isPending || addRole.isPending || removeRole.isPending}
                      />
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
  users: Array<{
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    is_activated: boolean;
    created_at: string;
    roles: AppRole[];
  }>;
  onToggleActivation: (userId: string, activate: boolean) => void;
  onAddRole: (userId: string, role: AppRole) => void;
  onRemoveRole: (userId: string, role: AppRole) => void;
  isLoading: boolean;
}

function UserTable({ users, onToggleActivation, onAddRole, onRemoveRole, isLoading }: UserTableProps) {
  const allRoles: AppRole[] = ['admin', 'doctor', 'user'];

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Roles</TableHead>
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
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className={`${roleColors[role]} flex items-center gap-1`}
                    >
                      {roleIcons[role]}
                      {role}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-sm text-muted-foreground">No roles</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border shadow-lg">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.is_activated ? (
                      <DropdownMenuItem
                        onClick={() => onToggleActivation(user.user_id, false)}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onToggleActivation(user.user_id, true)}
                        className="text-green-600 focus:text-green-600"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Add Role</DropdownMenuLabel>
                    {allRoles
                      .filter((role) => !user.roles.includes(role))
                      .map((role) => (
                        <DropdownMenuItem
                          key={`add-${role}`}
                          onClick={() => onAddRole(user.user_id, role)}
                        >
                          {roleIcons[role]}
                          <span className="ml-2">Add {role}</span>
                        </DropdownMenuItem>
                      ))}
                    {user.roles.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Remove Role</DropdownMenuLabel>
                        {user.roles.map((role) => (
                          <DropdownMenuItem
                            key={`remove-${role}`}
                            onClick={() => onRemoveRole(user.user_id, role)}
                            className="text-destructive focus:text-destructive"
                          >
                            {roleIcons[role]}
                            <span className="ml-2">Remove {role}</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
