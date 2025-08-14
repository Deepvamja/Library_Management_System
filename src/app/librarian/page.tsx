'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Activity,
  Calendar,
  BookCheck
} from 'lucide-react'
import {
  getDashboardStats,
  getOverdueItemsReport,
  getPopularBooksReport,
  getMonthlyCirculationReport,
  getSubjectDistributionReport,
  getFineCollectionReport
} from '@/app/actions/analyticsActions'

interface DashboardStats {
  totalBooks: number
  totalPatrons: number
  activeLoans: number
  overdueLoans: number
  totalReservations: number
  availableBooks: number
  totalFines: number
}

interface OverdueItem {
  transactionId: string
  bookTitle: string
  bookAuthor: string
  patronName: string
  patronEmail: string
  daysOverdue: number
  calculatedFine: number
  dueDate: Date
}

interface PopularBook {
  itemId: string
  title: string
  author: string
  subject: string
  timesLost: number
  currentReservations: number
  popularityScore: number
}

interface MonthlyData {
  month: string
  borrowed: number
  returned: number
}

interface SubjectData {
  subject: string
  totalBooks: number
  totalCopies: number
  availableCopies: number
  circulationRate: number
}

export default function LibrarianDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([])
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [subjectData, setSubjectData] = useState<SubjectData[]>([])
  const [fineData, setFineData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDashboardData = async () => {
    try {
      const [
        statsResult,
        overdueResult,
        popularResult,
        monthlyResult,
        subjectResult,
        fineResult
      ] = await Promise.all([
        getDashboardStats(),
        getOverdueItemsReport(),
        getPopularBooksReport(5),
        getMonthlyCirculationReport(6),
        getSubjectDistributionReport(),
        getFineCollectionReport()
      ])

      if (statsResult.success) setStats(statsResult.data)
      if (overdueResult.success) setOverdueItems(overdueResult.data.slice(0, 10))
      if (popularResult.success) setPopularBooks(popularResult.data)
      if (monthlyResult.success) setMonthlyData(monthlyResult.data)
      if (subjectResult.success) setSubjectData(subjectResult.data.slice(0, 8))
      if (fineResult.success) setFineData(fineResult.data)

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 10 seconds
    intervalRef.current = setInterval(fetchDashboardData, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalBooks}</div>
              <p className="text-xs text-gray-500">
                {stats.availableBooks} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalPatrons}</div>
              <p className="text-xs text-gray-500">
                {stats.totalReservations} reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalFines)}
              </div>
              {fineData && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(fineData.summary.totalPending)} pending
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Items Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Overdue Items
              <Badge variant="destructive" className="ml-2">
                {overdueItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No overdue items!</p>
              ) : (
                overdueItems.slice(0, 5).map((item) => (
                  <div key={item.transactionId} className="flex justify-between items-start p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.bookTitle}</h4>
                      <p className="text-xs text-gray-600">{item.patronName}</p>
                      <p className="text-xs text-red-600">
                        {item.daysOverdue} days overdue
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {formatCurrency(item.calculatedFine)}
                    </Badge>
                  </div>
                ))
              )}
              {overdueItems.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{overdueItems.length - 5} more overdue items
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Most Popular Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                popularBooks.map((book, index) => (
                  <div key={book.itemId} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium text-sm">{book.title}</h4>
                        <p className="text-xs text-gray-600">{book.author}</p>
                        <p className="text-xs text-gray-500">{book.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {book.currentReservations} reservations
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Circulation Trend */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Monthly Circulation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="font-medium">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-blue-600">{month.borrowed} borrowed</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-600">{month.returned} returned</span>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${month.borrowed > 0 ? (month.returned / month.borrowed) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Distribution */}
      {subjectData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Collection by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectData.map((subject) => (
                <div key={subject.subject} className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">{subject.subject}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Books: {subject.totalBooks}</span>
                      <span>Copies: {subject.totalCopies}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Available: {subject.availableCopies}</span>
                      <span>Circulation: {subject.circulationRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${subject.circulationRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
