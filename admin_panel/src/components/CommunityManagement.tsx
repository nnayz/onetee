import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MessageSquare, 
  Eye,
  Trash2,
  Heart,
  Repeat,
  Bookmark,
  Users,
  Activity
} from 'lucide-react'
import { communityAPI } from '@/app/api'
import type { Thread, CommunityStats } from '@/app/api'

export function CommunityManagement() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalThreads, setTotalThreads] = useState(0)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [isThreadDetailsOpen, setIsThreadDetailsOpen] = useState(false)

  const itemsPerPage = 10

  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true)
      const [threadsResponse, statsResponse] = await Promise.all([
        communityAPI.listThreads({ limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage }),
        communityAPI.getStats()
      ])
      
      setThreads(threadsResponse.threads)
      setTotalThreads(threadsResponse.total)
      setStats(statsResponse)
    } catch (error) {
      console.error('Failed to load community data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    loadCommunityData()
  }, [loadCommunityData])

  const handleDeleteThread = async (threadId: string) => {
    if (confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      try {
        await communityAPI.deleteThread(threadId)
        loadCommunityData()
      } catch (error) {
        console.error('Failed to delete thread:', error)
      }
    }
  }

  const handleViewThread = (thread: Thread) => {
    setSelectedThread(thread)
    setIsThreadDetailsOpen(true)
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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const totalPages = Math.ceil(totalThreads / itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Management</h1>
          <p className="text-muted-foreground">Monitor and moderate community activity</p>
        </div>
        <Button onClick={loadCommunityData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Community Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_threads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recent_threads} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_likes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recent_likes} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reposts</CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reposts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Community engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Follows</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_follows.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Network connections
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Threads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Threads ({totalThreads})</CardTitle>
          <CardDescription>Monitor and moderate community threads</CardDescription>
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
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">@{thread.author_username}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {thread.author_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="text-sm">{truncateText(thread.content, 150)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm">{thread.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Repeat className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{thread.reposts_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bookmark className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{thread.bookmarks_count}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(thread.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewThread(thread)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteThread(thread.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalThreads)} of {totalThreads} threads
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

      {/* Thread Details Dialog */}
      <Dialog open={isThreadDetailsOpen} onOpenChange={setIsThreadDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Thread Details</DialogTitle>
            <DialogDescription>View complete thread information</DialogDescription>
          </DialogHeader>
          {selectedThread && (
            <div className="space-y-6">
              {/* Thread Header */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">@{selectedThread.author_username}</h3>
                    <p className="text-muted-foreground">Author ID: {selectedThread.author_id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Posted</div>
                    <div className="font-medium">{formatDate(selectedThread.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Thread Content */}
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedThread.content}</p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold">{selectedThread.likes_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Repeat className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold">{selectedThread.reposts_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Reposts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Bookmark className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold">{selectedThread.bookmarks_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Bookmarks</div>
                </div>
              </div>

              {/* Thread ID */}
              <div>
                <Label className="text-sm font-medium">Thread ID</Label>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                  {selectedThread.id}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsThreadDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleDeleteThread(selectedThread.id)
                    setIsThreadDetailsOpen(false)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Thread
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 