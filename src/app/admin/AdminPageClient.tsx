'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  User
} from 'lucide-react'
import { getDashboardStats, getRecentActivities, getPopularItems, getOverdueItems } from '../actions/dashboardActions'
import { SessionPayload } from '../../lib/session'

interface DashboardStats {
  totalPatrons: number
  totalItems: number
  totalTransactions: number
  totalReservations: number
  totalAdmins: number
  totalLibrarians: number
  activeTransactions: number
  overdueTransactions: number
  availableItems: number
  totalRevenue: number
  totalUsers: number
}

interface Activity {
  id: string
  type: string
  action: string
  user: string
  item: string
  timestamp: Date
  status: string
}

interface PopularItem {
  itemId: number
  title: string
  author: string
  itemType: string
  borrowCount: number
  availableCopies: number
  totalCopies: number
}

interface OverdueItem {
  transactionId: number
  patronName: string
  patronEmail: string
  itemTitle: string
  dueDate: Date
  daysOverdue: number
}

interface AdminPageClientProps {
  session: SessionPayload
}

const REFRESH_INTERVAL = 15000 // 15 seconds for real-time updates

function AdminPageClient({ session }: AdminPageClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch all dashboard data
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true)
    }
    if (!lastUpdated && !isManualRefresh) {
      setLoading(true)
    }

    setError(null)

    try {
      const [statsResult, activitiesResult, popularResult, overdueResult] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getPopularItems(),
        getOverdueItems()
      ])

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }

      if (activitiesResult.success && activitiesResult.data) {
        setActivities(activitiesResult.data)
      }

      if (popularResult.success && popularResult.data) {
        setPopularItems(popularResult.data)
      }

      if (overdueResult.success && overdueResult.data) {
        setOverdueItems(overdueResult.data)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchDashboardData(true)
  }

  // Setup auto-refresh
  useEffect(() => {
    fetchDashboardData()

    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      fetchDashboardData()
    }, REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-1 ml-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.firstName} {session.lastName}
              </span>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Updated {formatLastUpdated(lastUpdated)}
                </span>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  refreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Refresh dashboard"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={Users} 
              color="blue" 
              subtitle={`${stats.totalPatrons} patrons`}
            />
            <StatCard 
              title="Library Items" 
              value={stats.totalItems} 
              icon={BookOpen} 
              color="green"
              subtitle={`${stats.availableItems} available`}
            />
            <StatCard 
              title="Overdue Items" 
              value={stats.overdueTransactions} 
              icon={AlertTriangle} 
              color="red"
              subtitle={`Need attention`}
            />
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-400' :
                  activity.status === 'active' ? 'bg-blue-400' :
                  'bg-yellow-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action} 
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No recent activities</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {popularItems.length > 0 ? popularItems.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">by {item.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{item.borrowCount} borrows</p>
                    <p className="text-xs text-gray-500">
                      {item.availableCopies}/{item.totalCopies} available
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No popular items data</p>
              )}
            </div>
          </div>

          {/* Overdue Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overdue Items</h3>
              <Clock className="h-5 w-5 text-red-400" />
            </div>
            <div className="space-y-3">
              {overdueItems.length > 0 ? overdueItems.map((item) => (
                <div key={item.transactionId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.itemTitle}</p>
                    <p className="text-xs text-gray-500">{item.patronName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {item.daysOverdue} days overdue
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No overdue items</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'red'
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default AdminPageClient
