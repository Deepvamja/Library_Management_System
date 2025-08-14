"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { LostDamagedTab } from './components/LostDamagedTab'
import { getInventoryStats } from './actions/inventory'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const statsResult = await getInventoryStats()

      if (statsResult.success) {
        setStats(statsResult.stats)
      }
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-gray-600">Track and manage lost/damaged items</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalCopies || 0} total copies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.availableCopies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.checkedOutItems || 0} currently borrowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(stats?.lostItems || 0) + (stats?.damagedItems || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.lostItems || 0} lost, {stats?.damagedItems || 0} damaged
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Lost/Damaged</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common inventory management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('issues')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Lost/Damaged Item
                </Button>
              </CardContent>
            </Card>

            {/* Inventory Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Recent Issues
                </CardTitle>
                <CardDescription>Lost and damaged items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">The Great Gatsby</p>
                      <p className="text-xs text-gray-600">Lost - Routine check</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Lost</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">To Kill a Mockingbird</p>
                      <p className="text-xs text-gray-600">Water damage</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Damaged</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('issues')}
                  >
                    View All Issues
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        <TabsContent value="issues">
          <LostDamagedTab onUpdate={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
