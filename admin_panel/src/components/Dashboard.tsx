import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  Settings,
  BarChart3,
  UserCheck,
  Eye
} from 'lucide-react'
import { analyticsAPI } from '@/app/api'
import type { AnalyticsOverview } from '@/app/api'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getOverview()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      icon: Plus,
      action: () => navigate('/admin/products'),
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Orders',
      description: 'View and update orders',
      icon: ShoppingCart,
      action: () => navigate('/admin/orders'),
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'bg-purple-500'
    },
    {
      title: 'Community',
      description: 'Monitor community activity',
      icon: MessageSquare,
      action: () => navigate('/admin/community'),
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to OneTee Admin Panel</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {analytics && (
        <>
          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.users.new_today} new today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.products.active}</div>
                <p className="text-xs text-muted-foreground">
                  of {analytics.products.total} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.orders.today}</div>
                <p className="text-xs text-muted-foreground">
                  of {analytics.orders.total} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.today_cents)}</div>
                <p className="text-xs text-muted-foreground">
                  Total: {formatCurrency(analytics.revenue.total_cents)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Community Overview</CardTitle>
              <CardDescription>Social engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.community.threads.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Threads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.community.likes.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.community.follows.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Follows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {analytics.community.likes > 0 && analytics.community.threads > 0 
                      ? (analytics.community.likes / analytics.community.threads).toFixed(1)
                      : '0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Likes/Thread</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Navigation Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Sections</CardTitle>
          <CardDescription>Navigate to different administrative areas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            
                         <TabsContent value="overview" className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Button variant="outline" className="h-20" onClick={() => navigate('/admin/analytics')}>
                   <BarChart3 className="w-6 h-6 mr-2" />
                   Analytics
                 </Button>
                 <Button variant="outline" className="h-20" onClick={() => navigate('/admin/dashboard')}>
                   <Settings className="w-6 h-6 mr-2" />
                   Settings
                 </Button>
                 <Button variant="outline" className="h-20" onClick={() => navigate('/admin/analytics')}>
                   <Eye className="w-6 h-6 mr-2" />
                   Reports
                 </Button>
               </div>
             </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/products')}>
                  <Package className="w-5 h-5 mr-2" />
                  Manage Products
                </Button>
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/products/new')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Product
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/orders')}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Orders
                </Button>
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/orders?status=pending')}>
                  <Badge variant="secondary">Pending</Badge>
                  Pending Orders
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/users')}>
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/users?verified=false')}>
                  <UserCheck className="w-5 h-5 mr-2" />
                  Unverified Users
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/community')}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Community Management
                </Button>
                <Button variant="outline" className="h-16" onClick={() => navigate('/admin/community/threads')}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  View Threads
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 