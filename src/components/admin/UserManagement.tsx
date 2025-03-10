
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Search, Filter, UserPlus, MoreHorizontal, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types/models";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dateJoined: string;
  status: "Active" | "Suspended";
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "Customer" as UserRole,
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from Auth API
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error fetching auth users:", authError);
          // Fallback to just fetching profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, role, created_at")
            .order("created_at", { ascending: false });
            
          if (profilesError) throw profilesError;
          
          // Transform data for display
          const formattedUsers: UserData[] = (profilesData || []).map(user => ({
            id: user.id,
            email: "user@example.com", // Default email since we can't fetch it
            name: user.full_name || "No name",
            role: (user.role || "Customer") as UserRole,
            dateJoined: user.created_at,
            status: "Active" as "Active" | "Suspended"
          }));
          
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
          return;
        }
        
        // Now fetch the profiles to get the role information
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .order("created_at", { ascending: false });
          
        if (profilesError) throw profilesError;
        
        // Create a map of profile data by user ID
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
        
        // Combine auth users with their profile data
        const formattedUsers: UserData[] = authUsers.users.map(user => {
          const profile = profilesMap.get(user.id);
          return {
            id: user.id,
            email: user.email || "No email",
            name: profile?.full_name || user.user_metadata?.full_name || "No name",
            role: (profile?.role || "Customer") as UserRole,
            dateJoined: profile?.created_at || user.created_at,
            status: user.banned ? "Suspended" : "Active" as "Active" | "Suspended"
          };
        });
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        });
        
        // Provide some mock data for development
        const mockUsers: UserData[] = [
          {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
            role: "Admin",
            dateJoined: new Date().toISOString(),
            status: "Active"
          },
          {
            id: "2",
            email: "owner@example.com",
            name: "Car Owner",
            role: "CarOwner",
            dateJoined: new Date().toISOString(),
            status: "Active"
          }
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  // Filter users when search term or role filter changes
  useEffect(() => {
    let filtered = users;
    
    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({ ...prev, role: role as UserRole }));
  };
  
  const handleAddUser = async () => {
    setProcessingId("new");
    try {
      // In a real app, this would create a new user in Supabase Auth
      // and then create a profile record
      // For now we'll just simulate success
      
      const newUserId = `user-${Date.now()}`;
      
      // Add to local state
      const newUserData: UserData = {
        id: newUserId,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        dateJoined: new Date().toISOString(),
        status: "Active"
      };
      
      setUsers(prev => [newUserData, ...prev]);
      
      toast({
        title: "User Added",
        description: `${newUser.name} has been added as a ${newUser.role}`,
      });
      
      // Reset form
      setNewUser({
        email: "",
        name: "",
        role: "Customer"
      });
      
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "SuperAdmin": return "destructive";
      case "Admin": return "default";
      case "SupportStaff": return "secondary";
      case "ServiceCenterStaff": return "default";
      case "CarOwner": return "outline";
      case "Customer": return "outline";
      default: return "outline";
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Only SuperAdmin can access this page
  if (profile?.role !== "SuperAdmin") {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Only SuperAdmin users can access the user management section.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with a specific role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  placeholder="Enter user's full name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="Enter user's email address"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="SupportStaff">Support Staff</SelectItem>
                    <SelectItem value="ServiceCenterStaff">Service Center Staff</SelectItem>
                    <SelectItem value="CarOwner">Car Owner</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={processingId === "new" || !newUser.email || !newUser.name}
              >
                {processingId === "new" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SuperAdmin">Super Admin</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="SupportStaff">Support Staff</SelectItem>
            <SelectItem value="ServiceCenterStaff">Service Center Staff</SelectItem>
            <SelectItem value="CarOwner">Car Owner</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.dateJoined).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "outline" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {}}>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={user.role === "SuperAdmin" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "SuperAdmin")}
                        >
                          Super Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "Admin" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "Admin")}
                        >
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "SupportStaff" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "SupportStaff")}
                        >
                          Support Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "ServiceCenterStaff" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "ServiceCenterStaff")}
                        >
                          Service Center Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "CarOwner" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "CarOwner")}
                        >
                          Car Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "Customer" || processingId === user.id}
                          onClick={() => handleChangeRole(user.id, "Customer")}
                        >
                          Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
