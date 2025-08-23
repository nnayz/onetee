import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  BarChart3,
  Calendar
} from 'lucide-react'
import { analyticsAPI } from '@/app/api'
import type { AnalyticsOverview, RevenueData, TopProduct } from '@/app/api'

export function Analytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [revenuePeriod, setRevenuePeriod] = useState('7d')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const [overviewData, revenueData, topProductsData] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getRevenue(revenuePeriod),
        analyticsAPI.getTopProducts(10)
      ])
      
      setOverview(overviewData)
      setRevenueData(revenueData)
      setTopProducts(topProductsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [revenuePeriod])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }



  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.revenue.total_cents)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                Today: {formatCurrency(overview.revenue.today_cents)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.orders.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                Today: {overview.orders.today}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.users.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                New today: {overview.users.new_today}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.products.active}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                Total: {overview.products.total}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Analytics */}
      {revenueData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Revenue trends over time</CardDescription>
                </div>
                <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Period</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(revenueData.start_date)} - {formatDate(revenueData.end_date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Total Revenue</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(revenueData.daily_data.reduce((sum, day) => sum + day.revenue_cents, 0))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {revenueData.daily_data.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(day.date)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(day.revenue_cents)}</div>
                        <div className="text-xs text-muted-foreground">{day.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{product.total_sold} sold</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.total_revenue_cents)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Community Analytics */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>Community Analytics</CardTitle>
            <CardDescription>Social engagement and community metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{overview.community.threads.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Threads</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{overview.community.likes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{overview.community.follows.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Follows</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {overview.community.likes > 0 && overview.community.threads > 0 
                    ? (overview.community.likes / overview.community.threads).toFixed(1)
                    : '0'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Avg Likes/Thread</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview && overview.users.total > 0 
                ? ((overview.orders.total / overview.users.total) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <div className="text-xs text-muted-foreground">
              Orders per user
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview && overview.orders.total > 0 
                ? formatCurrency(overview.revenue.total_cents / overview.orders.total)
                : formatCurrency(0)
              }
            </div>
            <div className="text-xs text-muted-foreground">
              Per order
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Product Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview && overview.products.total > 0 
                ? ((overview.products.active / overview.products.total) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <div className="text-xs text-muted-foreground">
              Active products
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 