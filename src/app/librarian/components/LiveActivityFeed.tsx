'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Activity,
  BookOpen,
  BookCheck,
  Users,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'borrow' | 'return' | 'register' | 'overdue' | 'reservation'
  message: string
  timestamp: Date
  severity: 'info' | 'success' | 'warning' | 'error'
  details?: {
    bookTitle?: string
    patronName?: string
    amount?: number
  }
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Simulate real-time activity updates
  const generateMockActivity = (): ActivityItem => {
    const types: ActivityItem['type'][] = ['borrow', 'return', 'register', 'overdue', 'reservation']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const activities = {
      borrow: {
        message: 'Book borrowed',
        severity: 'info' as const,
        details: {
          bookTitle: `Book ${Math.floor(Math.random() * 1000)}`,
          patronName: `User ${Math.floor(Math.random() * 100)}`
        }
      },
      return: {
        message: 'Book returned',
        severity: 'success' as const,
        details: {
          bookTitle: `Book ${Math.floor(Math.random() * 1000)}`,
          patronName: `User ${Math.floor(Math.random() * 100)}`
        }
      },
      register: {
        message: 'New member registered',
        severity: 'info' as const,
        details: {
          patronName: `User ${Math.floor(Math.random() * 100)}`
        }
      },
      overdue: {
        message: 'Overdue notice sent',
        severity: 'warning' as const,
        details: {
          bookTitle: `Book ${Math.floor(Math.random() * 1000)}`,
          patronName: `User ${Math.floor(Math.random() * 100)}`,
          amount: Math.floor(Math.random() * 20) + 1
        }
      },
      reservation: {
        message: 'Book reserved',
        severity: 'info' as const,
        details: {
          bookTitle: `Book ${Math.floor(Math.random() * 1000)}`,
          patronName: `User ${Math.floor(Math.random() * 100)}`
        }
      }
    }

    const activityData = activities[type]

    return {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message: activityData.message,
      timestamp: new Date(),
      severity: activityData.severity,
      details: activityData.details
    }
  }

  const fetchRecentActivity = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from your API
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      
      const mockActivities = Array.from({ length: 10 }, () => generateMockActivity())
      setActivities(mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 15 seconds
  useEffect(() => {
    fetchRecentActivity()
    const interval = setInterval(() => {
      // Add new activity occasionally
      if (Math.random() < 0.3) {
        const newActivity = generateMockActivity()
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep latest 20
        setLastUpdated(new Date())
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'borrow': return <BookOpen className="h-4 w-4" />
      case 'return': return <BookCheck className="h-4 w-4" />
      case 'register': return <Users className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      case 'reservation': return <Clock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'return': return 'success' as const
      case 'overdue': return 'warning' as const
      case 'register': return 'info' as const
      default: return 'default' as const
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Live Activity Feed
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecentActivity}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {formatTime(lastUpdated)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && activities.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {activity.message}
                        </span>
                        <Badge 
                          variant={getBadgeVariant(activity.type)}
                          className="text-xs"
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      {activity.details && (
                        <div className="text-xs space-y-1">
                          {activity.details.bookTitle && (
                            <p>Book: {activity.details.bookTitle}</p>
                          )}
                          {activity.details.patronName && (
                            <p>Member: {activity.details.patronName}</p>
                          )}
                          {activity.details.amount && (
                            <p>Amount: ${activity.details.amount}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
