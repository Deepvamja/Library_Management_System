'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, BookOpen, User as UserIcon, Calendar, MapPin, Eye, Clock, CheckCircle, RefreshCw } from 'lucide-react'
import { getItems, getUniqueSubjects, getUniqueItemTypes, createReservation } from '../../actions/patronActions'

interface Item {
  itemId: number
  title: string
  author: string
  isbn?: string
  subject?: string
  keywords?: string
  itemType: string
  price: number
  imageUrl?: string
  totalCopies: number
  availableCopies: number
  isVisible: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface SearchBrowseProps {
  setSelectedItem: (item: Item | null) => void
  setActiveModule: (module: string) => void
  patronId?: number
}

const SearchBrowse: React.FC<SearchBrowseProps> = ({ setSelectedItem, setActiveModule, patronId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [allItems, setAllItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservingItemId, setReservingItemId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadAllItems()
  }, [])

  // Dynamic search effect
  useEffect(() => {
    handleDynamicSearch()
  }, [searchQuery, allItems])

  const loadAllItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getItems()
      if (result.success && result.items) {
        // Transform the data to match our interface
        const transformedItems = result.items.map(item => ({
          ...item,
          isbn: item.isbn || undefined,
          subject: item.subject || undefined,
          keywords: item.keywords || undefined,
          imageUrl: item.imageUrl || undefined
        }))
        setAllItems(transformedItems)
        setFilteredItems(transformedItems)
      } else {
        setError(result.error || 'Failed to load items')
      }
    } catch (err) {
      setError('An error occurred while loading items')
    } finally {
      setLoading(false)
    }
  }

  const handleDynamicSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(allItems)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = allItems.filter(item => {
      // Search across all fields: title, author, ISBN, subject, keywords
      const searchFields = [
        item.title?.toLowerCase() || '',
        item.author?.toLowerCase() || '',
        item.isbn?.toLowerCase() || '',
        item.subject?.toLowerCase() || '',
        item.keywords?.toLowerCase() || ''
      ]
      
      return searchFields.some(field => field.includes(query))
    })

    setFilteredItems(filtered)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item)
    setActiveModule('details')
  }

  const handleReserveItem = async (item: Item) => {
    if (!patronId) {
      setError('Please log in to reserve items')
      return
    }

    setReservingItemId(item.itemId)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await createReservation(patronId, item.itemId)
      
      if (result.success) {
        setSuccessMessage(`Successfully reserved "${item.title}". You'll be notified when it becomes available.`)
        // Refresh the items list to get updated data
        await loadAllItems()
      } else {
        setError(result.error || 'Failed to create reservation')
      }
    } catch (err) {
      setError('An error occurred while creating the reservation')
    } finally {
      setReservingItemId(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Search & Browse Library</h2>
        
        {/* Dynamic Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for library items by title, author, ISBN, subject, keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Search results update automatically as you type
            </p>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.itemId} className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="aspect-w-3 aspect-h-4 bg-gray-200">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white p-4" 
                style={{ display: item.imageUrl ? 'none' : 'flex' }}
              >
                <BookOpen className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium text-center leading-tight">
                  {item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-gray-600 mb-2 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {item.author}
              </p>
              
              {item.subject && (
                <p className="text-sm text-gray-500 mb-2">{item.subject}</p>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.availableCopies > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.availableCopies > 0 ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-sm text-gray-600">
                  {item.availableCopies}/{item.totalCopies} copies
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </button>
                {item.availableCopies === 0 && (
                  <button
                    onClick={() => handleReserveItem(item)}
                    disabled={reservingItemId === item.itemId}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm transition-colors duration-200 ${
                      reservingItemId === item.itemId
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {reservingItemId === item.itemId ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-1" />
                    )}
                    {reservingItemId === item.itemId ? 'Reserving...' : 'Reserve'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && !error && allItems.length > 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? `No items found for "${searchQuery}"` : 'No items found'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try searching with different keywords or check your spelling.' 
              : 'Try adjusting your search criteria.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      )}
    </div>
  )
}

export default SearchBrowse
