'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

/**
 * 📚 LEARNING: TypeScript Interface for User Data
 * 
 * This defines the structure of user data from our backend.
 * Having clear types helps prevent bugs and makes code more maintainable.
 */
interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * 📚 LEARNING: User Table Row Component
 * 
 * Breaking the table into smaller components makes the code easier to read
 * and allows us to handle actions for individual users.
 */
interface UserRowProps {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
  onToggleRole: (userId: string, newRole: AdminUser['role']) => void;
}

function UserRow({ user, onEdit, onDelete, onToggleRole }: UserRowProps) {
  const [showActions, setShowActions] = useState(false);

  // 📚 LEARNING: Helper Functions for Data Formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'moderator': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center">
          {user.emailVerified ? (
            <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <ShieldExclamationIcon className="h-5 w-5 text-yellow-500 mr-2" />
          )}
          <span className="text-sm text-muted-foreground">
            {user.emailVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-6 py-4 text-sm text-muted-foreground">
        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
      </td>

      <td className="px-6 py-4 text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {/* 📚 LEARNING: Dropdown Menu */}
          {/* This shows/hides based on showActions state */}
          {showActions && (
            <>
              {/* Backdrop to close dropdown when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit User
                </button>

                <button
                  onClick={() => {
                    // Toggle between user and moderator (admin can't be changed)
                    const newRole = user.role === 'user' ? 'moderator' : 'user';
                    onToggleRole(user.id, newRole);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                  disabled={user.role === 'admin'}
                >
                  {user.role === 'user' ? 'Promote to Moderator' : 'Demote to User'}
                </button>

                <button
                  onClick={() => {
                    onDelete(user.id);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center"
                  disabled={user.role === 'admin'}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete User
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * 📚 LEARNING: Main User Management Component
 */
export default function UserManagement() {
  // 📚 LEARNING: Multiple State Variables
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 📚 LEARNING: useEffect for Data Fetching
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);

        // 📚 LEARNING: Simulated API Call
        // In real app, this would be: await apiClient.get('/admin/users')
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock user data
        const mockUsers: AdminUser[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'user',
            emailVerified: true,
            createdAt: '2024-01-15T10:00:00Z',
            lastLoginAt: '2024-01-20T14:30:00Z',
            isActive: true,
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'moderator',
            emailVerified: true,
            createdAt: '2024-01-10T09:00:00Z',
            lastLoginAt: '2024-01-19T11:15:00Z',
            isActive: true,
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            role: 'user',
            emailVerified: false,
            createdAt: '2024-01-18T16:20:00Z',
            isActive: true,
          },
          {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com',
            role: 'admin',
            emailVerified: true,
            createdAt: '2024-01-01T08:00:00Z',
            lastLoginAt: '2024-01-20T09:45:00Z',
            isActive: true,
          },
        ];

        setUsers(mockUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 📚 LEARNING: useMemo for Performance
  // This only recalculates when users, searchTerm, or roleFilter change
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // 📚 LEARNING: Event Handler Functions
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // In real app: await apiClient.delete(`/admin/users/${userId}`)
        setUsers(users.filter(user => user.id !== userId));
        console.log('User deleted:', userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleRole = async (userId: string, newRole: AdminUser['role']) => {
    try {
      // In real app: await apiClient.patch(`/admin/users/${userId}`, { role: newRole })
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      console.log('User role updated:', userId, newRole);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  // 📚 LEARNING: Loading State
  if (isLoading) {
    return (
      <AdminLayout title="User Management" subtitle="Manage user accounts and permissions">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management" subtitle="Manage user accounts and permissions">

      {/* 📚 LEARNING: Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="input min-w-[120px]"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Add User Button */}
        <button className="btn-primary flex items-center">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* 📚 LEARNING: Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* 📚 LEARNING: Data Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleRole={handleToggleRole}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlusIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been registered yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* 📚 LEARNING: Modal Dialog (Edit User) */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Edit User: {selectedUser.firstName} {selectedUser.lastName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.firstName}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.lastName}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Role</label>
                <select defaultValue={selectedUser.role} className="input">
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-outline px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In real app: save changes here
                  setShowEditModal(false);
                }}
                className="btn-primary px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/**
 * 📚 LEARNING: What You've Learned in This Component
 * 
 * 🎯 Advanced React Concepts:
 * ✅ useMemo for performance optimization
 * ✅ Complex state management with multiple useState hooks
 * ✅ Event handling with function parameters
 * ✅ Conditional rendering for dropdowns and modals
 * ✅ Array manipulation (filter, map)
 * ✅ Component composition (UserRow as a sub-component)
 * 
 * 🎯 User Interface Patterns:
 * ✅ Data tables with interactive rows
 * ✅ Search and filtering functionality
 * ✅ Modal dialogs for editing
 * ✅ Dropdown menus with actions
 * ✅ Loading and empty states
 * ✅ Responsive design with CSS Grid
 * 
 * 🎯 Real-World Features:
 * ✅ User management (CRUD operations)
 * ✅ Role-based actions
 * ✅ Confirmation dialogs
 * ✅ Data formatting and display
 * ✅ Accessibility considerations
 * 
 * Next, we'll create some backend API endpoints to power these admin features!
 */