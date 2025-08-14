'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Book, RefreshCw, X, AlertCircle } from 'lucide-react'
import { getPatronReservations, cancelReservation } from '../../actions/patronActions'

interface ReserveHoldProps {
  patronId: number
  setSelectedItem?: (item: any) => void
  setActiveModule?: (module: string) => void
}

interface Reservation {
  reservationId?: number
  itemId: number
  title: string
  author: string
  reservedAt: string
  item?: {
    itemId: number
    title: string
    author: string
    isbn?: string
    subject?: string
    itemType: string
    price: number
    imageUrl?: string
    totalCopies: number
    availableCopies: number
  }
}

const REFRESH_INTERVAL = 30000 // 30 seconds

const ReserveHold: React.FC<ReserveHoldProps> = ({ patronId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Load reservations function
  const loadReservations = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true)
    } else if (reservations.length === 0) {
      setLoading(true)
    }
    
    setError(null)

    try {
      const result = await getPatronReservations(patronId)

      if (!mountedRef.current) return

      if (result.success && result.reservations) {
        const formattedReservations = result.reservations.map((reservation: any) => ({
          reservationId: reservation.reservationId,
          itemId: reservation.itemId,
          title: reservation.item?.title || 'Unknown Title',
          author: reservation.item?.author || 'Unknown Author',
          reservedAt: new Date(reservation.reservedAt).toLocaleDateString(),
          item: reservation.item
        }))
        setReservations(formattedReservations)
      } else {
        setReservations([])
      }
      
      setLastUpdated(new Date())
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to load reservations')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [patronId, reservations.length])

  // Manual refresh function
  const handleManualRefresh = () => {
    loadReservations(true)
  }

  // Cancel reservation function
  const handleCancelReservation = async (itemId: number) => {
    setCancellingId(itemId)
    try {
      const result = await cancelReservation(patronId, itemId)
      if (result.success) {
        // Refresh the reservations list
        loadReservations()
      } else {
        setError(result.error || 'Failed to cancel reservation')
      }
    } catch (err) {
      setError('Failed to cancel reservation')
    } finally {
      setCancellingId(null)
    }
  }

  // Setup auto-refresh interval
  useEffect(() => {
    loadReservations()
    
    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        loadReservations()
      }
    }, REFRESH_INTERVAL)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [patronId, loadReservations])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
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
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reserve/Hold Items</h2>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="border border-gray-200 p-4 rounded-md">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="border border-gray-200 p-4 rounded-md">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Reserve/Hold Items</h2>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            title="Retry"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center text-red-600 text-sm mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Reserve/Hold Items</h2>
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
            className={`p-2 rounded-md transition-colors duration-200 ${
              refreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Refresh reservations"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <p className="text-gray-600 mb-6">Here you can see the items you have placed on hold.</p>

      <div className="space-y-3">
        {reservations.map(reservation => (
          <div key={reservation.itemId} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Book className="h-4 w-4 text-blue-500" />
                  <h4 className="text-lg font-medium text-gray-900">
                    {reservation.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  by <span className="font-medium">{reservation.author}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Reserved on: {reservation.reservedAt}
                </p>
                {reservation.item && (
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Type: {reservation.item.itemType}</span>
                    {reservation.item.isbn && <span>ISBN: {reservation.item.isbn}</span>}
                    {reservation.item.subject && <span>Subject: {reservation.item.subject}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleCancelReservation(reservation.itemId)}
                disabled={cancellingId === reservation.itemId}
                className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="Cancel reservation"
              >
                {cancellingId === reservation.itemId ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-600">You currently have no reservations.</p>
        </div>
      )}
    </div>
  )
}

export default ReserveHold;

