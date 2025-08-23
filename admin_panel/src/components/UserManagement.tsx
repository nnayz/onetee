import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Calendar,
  Mail
} from 'lucide-react'
import { usersAPI } from '@/app/api'
import type { User } from '@/app/api'

interface UserParams {
  limit: number
  offset: number
  search?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)

  const itemsPerPage = 10

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params: UserParams = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      }
      
      if (searchTerm) params.search = searchTerm

      const response = await usersAPI.listUsers(params)
      let filteredUsers = response.users

      // Apply additional filters
      if (statusFilter && statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          statusFilter === 'active' ? user.is_active : !user.is_active
        )
      }

      if (verifiedFilter && verifiedFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          verifiedFilter === 'verified' ? user.is_verified : !user.is_verified
        )
      }

      setUsers(filteredUsers)
      setTotalUsers(filteredUsers.length)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, verifiedFilter, itemsPerPage])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersAPI.updateUserStatus(userId, isActive)
      loadUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const handleUpdateUserAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      await usersAPI.updateUserAdminStatus(userId, isAdmin)
      loadUsers()
    } catch (error) {
      console.error('Failed to update user admin status:', error)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="verified">Verification</Label>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setVerifiedFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalUsers})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {user.avatar_url && (
                            <img
                              src={user.avatar_url}
                              alt={user.display_name || user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{user.display_name || user.username}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{user.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_verified ? "default" : "outline"}>
                          {user.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_admin ? "destructive" : "outline"}>
                          {user.is_admin ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(user.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select 
                            value={user.is_active ? "active" : "inactive"} 
                            onValueChange={(value) => handleUpdateUserStatus(user.id, value === "active")}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select 
                            value={user.is_admin ? "admin" : "user"} 
                            onValueChange={(value) => handleUpdateUserAdminStatus(user.id, value === "admin")}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4">
                {selectedUser.avatar_url && (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.display_name || selectedUser.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.display_name || selectedUser.username}</h3>
                  <p className="text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <div className="font-mono text-sm">{selectedUser.id}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm">{selectedUser.email || 'No email'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Display Name</Label>
                  <div className="text-sm">{selectedUser.display_name || 'Not set'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bio</Label>
                  <div className="text-sm">{selectedUser.bio || 'No bio'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-sm">{formatDate(selectedUser.created_at)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="text-sm">{formatDate(selectedUser.updated_at)}</div>
                </div>
              </div>

              {/* User Status */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateUserStatus(selectedUser.id, !selectedUser.is_active)}
                    >
                      {selectedUser.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {selectedUser.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedUser.is_verified ? "default" : "outline"}>
                      {selectedUser.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Admin Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedUser.is_admin ? "destructive" : "outline"}>
                      {selectedUser.is_admin ? "Admin" : "User"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateUserAdminStatus(selectedUser.id, !selectedUser.is_admin)}
                    >
                      {selectedUser.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      {selectedUser.is_admin ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUserDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 