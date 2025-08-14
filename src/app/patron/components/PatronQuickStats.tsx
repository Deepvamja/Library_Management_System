'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BookOpen, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { getCurrentBorrowedItems, getPatronFines, getPatronReservations } from '../../actions/patronActions'

interface PatronQuickStatsProps {
  patronId: number
}

interface QuickStats {
  borrowedCount: number
  reservationsCount: number
  pendingFines: number
  overdueCount: number
}

const REFRESH_INTERVAL = 10000 // 10 seconds for testing

const PatronQuickStats: React.FC<PatronQuickStatsProps> = ({ patronId }) => {
  const [stats, setStats] = useState<QuickStats>({
    borrowedCount: 0,
    reservationsCount: 0,
    pendingFines: 0,
    overdueCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Single async function to fetch data
  const fetchStats = async (isManualRefresh = false) => {
    console.log('Fetching stats...', isManualRefresh ? 'Manual' : 'Auto') // Debug log
    
    if (isManualRefresh) {
      setRefreshing(true)
    }
    if (!lastUpdated && !isManualRefresh) {
      setLoading(true)
    }
    
    setError(null)

    try {
      const [currentItemsResult, finesResult, reservationsResult] = await Promise.all([
        getCurrentBorrowedItems(patronId),
        getPatronFines(patronId),
        getPatronReservations(patronId)
      ])

      let borrowedCount = 0
      let overdueCount = 0

      if (currentItemsResult.success && currentItemsResult.transactions) {
        borrowedCount = currentItemsResult.transactions.length
        overdueCount = currentItemsResult.transactions.filter(
          (transaction: any) => new Date(transaction.dueDate) < new Date()
        ).length
      }

      let pendingFines = 0
      if (finesResult.success && finesResult.totalFines !== undefined) {
        pendingFines = finesResult.totalFines
      }

      let reservationsCount = 0
      if (reservationsResult.success && reservationsResult.reservations) {
        reservationsCount = reservationsResult.reservations.length
      }

      setStats({
        borrowedCount,
        reservationsCount,
        pendingFines,
        overdueCount
      })
      setLastUpdated(new Date())
      console.log('Stats updated:', { borrowedCount, reservationsCount, pendingFines, overdueCount }) // Debug log
    } catch (err) {
      console.error('Error fetching stats:', err) // Debug log
      setError('Failed to load stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchStats(true)
  }

  // Effect for initial load and auto-refresh
  useEffect(() => {
    console.log('Setting up auto-refresh for patronId:', patronId) // Debug log
    
    // Initial load
    fetchStats()
    
    // Set up interval for auto-refresh
    intervalRef.current = setInterval(() => {
      console.log('Auto-refresh triggered') // Debug log
      fetchStats()
    }, REFRESH_INTERVAL)

    // Cleanup function
    return () => {
      console.log('Cleaning up interval') // Debug log
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [patronId]) // Only depend on patronId


  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h3>
        <div className="space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Retry"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              error ? 'bg-red-400' : 'bg-green-400 animate-pulse'
            }`} title={error ? 'Offline' : 'Live updates active'}></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {formatLastUpdated(lastUpdated)}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              refreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Refresh stats"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Books Borrowed</span>
          </div>
          <span className={`text-sm font-semibold ${
            stats.borrowedCount > 0 ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {stats.borrowedCount}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Reservations</span>
          </div>
          <span className={`text-sm font-semibold ${
            stats.reservationsCount > 0 ? 'text-green-600' : 'text-gray-400'
          }`}>
            {stats.reservationsCount}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-gray-600">Pending Fines</span>
          </div>
          <span className={`text-sm font-semibold ${
            stats.pendingFines > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            ${stats.pendingFines.toFixed(2)}
          </span>
        </div>

        {stats.overdueCount > 0 && (
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-600">Overdue Items</span>
            </div>
            <span className="text-sm font-semibold text-orange-600">
              {stats.overdueCount}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatronQuickStats
