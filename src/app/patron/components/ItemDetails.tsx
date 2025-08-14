'use client'

import React, { useState } from 'react'
import { MapPin, Eye, BookOpen, Calendar, DollarSign, Hash, Tag, FileText, Copy, Clock, CheckCircle, XCircle, ArrowLeft, Book, AlertCircle } from 'lucide-react'
import PurchaseRequestDialog from './PurchaseRequestDialog'
import { borrowItem, createReservation } from '../../actions/patronActions'

interface ItemDetailsProps {
  selectedItem: Item | null
  setSelectedItem: (item: Item | null) => void
  setActiveModule?: (module: string) => void
  patronId: number
}

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

const ItemDetails: React.FC<ItemDetailsProps> = ({ selectedItem, setSelectedItem, setActiveModule, patronId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'availability'>('overview')
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isBorrowing, setIsBorrowing] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const handleGoBack = () => {
    setSelectedItem(null)
    if (setActiveModule) {
      setActiveModule('search')
    }
  }

  const handleBorrow = async () => {
    if (!selectedItem) return

    setIsBorrowing(true)
    setMessage(null)

    try {
      const result = await borrowItem(patronId, selectedItem.itemId)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Item borrowed successfully!' })
        // Update the selected item to reflect the new available copies
        setSelectedItem({
          ...selectedItem,
          availableCopies: selectedItem.availableCopies - 1
        })
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to borrow item' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while borrowing the item' })
    } finally {
      setIsBorrowing(false)
    }
  }

  const handleReserve = async () => {
    if (!selectedItem) return

    setIsReserving(true)
    setMessage(null)

    try {
      const result = await createReservation(patronId, selectedItem.itemId)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Reservation created successfully!' })
        // Auto-hide success message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create reservation' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while creating the reservation' })
    } finally {
      setIsReserving(false)
    }
  }

  const handleRequestPurchase = () => {
    setIsPurchaseDialogOpen(true)
  }

  if (!selectedItem) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No item selected</h3>
        <p className="text-gray-600">Please select an item to view details.</p>
      </div>
    )
  }

  const getAvailabilityStatus = () => {
    if (selectedItem.availableCopies > 5) {
      return { status: 'High Availability', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle }
    } else if (selectedItem.availableCopies > 0) {
      return { status: 'Limited Availability', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock }
    } else {
      return { status: 'Currently Unavailable', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: XCircle }
    }
  }

  const availability = getAvailabilityStatus()
  const AvailabilityIcon = availability.icon

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </button>
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Item ID: {selectedItem.itemId}</span>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image and Quick Actions */}
        <div className="lg:col-span-1">
          {/* Item Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="aspect-w-3 aspect-h-4 bg-gray-100">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-80 bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white p-6" 
                style={{ display: selectedItem.imageUrl ? 'none' : 'flex' }}
              >
                <BookOpen className="h-20 w-20 mb-4 opacity-90" />
                <span className="text-lg font-semibold text-center leading-tight">
                  {selectedItem.title.length > 50 ? selectedItem.title.substring(0, 50) + '...' : selectedItem.title}
                </span>
                <span className="text-sm text-center mt-2 opacity-80">
                  by {selectedItem.author}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Status Card */}
          <div className={`rounded-xl border-2 p-4 mb-6 ${availability.bgColor}`}>
            <div className="flex items-center mb-3">
              <AvailabilityIcon className={`h-5 w-5 mr-2 ${availability.color}`} />
              <h3 className={`font-semibold ${availability.color}`}>{availability.status}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available:</span>
                <span className={`font-semibold ${availability.color}`}>
                  {selectedItem.availableCopies}/{selectedItem.totalCopies} copies
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Location:</span>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-3 w-3 mr-1" />
                  Main Library - Section A
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {selectedItem.availableCopies > 0 ? (
              <button 
                onClick={handleBorrow}
                disabled={isBorrowing}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBorrowing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Borrowing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Borrow This Item
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleReserve}
                disabled={isReserving}
                className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReserving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Reserving...
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Reserve Item
                  </>
                )}
              </button>
            )}
            <button 
              onClick={handleRequestPurchase}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Request Purchase
            </button>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          {/* Title and Author */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{selectedItem.title}</h1>
            <p className="text-xl text-gray-700 mb-4">by {selectedItem.author}</p>
            
            {/* Item Type Badge */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Book className="h-4 w-4 mr-1" />
                {selectedItem.itemType}
              </span>
              {selectedItem.subject && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Tag className="h-4 w-4 mr-1" />
                  {selectedItem.subject}
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: FileText },
                { id: 'details', name: 'Details', icon: Hash },
                { id: 'availability', name: 'Availability', icon: Copy }
              ].map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <TabIcon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    This {selectedItem.itemType.toLowerCase()} by {selectedItem.author} is available in our library collection. 
                    {selectedItem.subject && `It belongs to the ${selectedItem.subject} subject area and `}
                    is catalogued with comprehensive metadata for easy discovery.
                  </p>
                </div>
                
                {selectedItem.keywords && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.keywords.split(',').map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Library Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">Main Library - Section A</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Loan Period</p>
                        <p className="text-sm text-gray-600">14 days (renewable)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bibliographic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">ISBN:</span>
                      <span className="text-gray-900">{selectedItem.isbn || 'Not Available'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Author:</span>
                      <span className="text-gray-900">{selectedItem.author}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Item Type:</span>
                      <span className="text-gray-900">{selectedItem.itemType}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Subject:</span>
                      <span className="text-gray-900">{selectedItem.subject || 'Not Specified'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Price:</span>
                      <span className="text-gray-900">${selectedItem.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Item ID:</span>
                      <span className="text-gray-900">{selectedItem.itemId}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600">Visibility:</span>
                      <span className="text-gray-900">{selectedItem.isVisible ? 'Public' : 'Restricted'}</span>
                    </div>
                    {selectedItem.createdAt && (
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="font-medium text-gray-600">Added:</span>
                        <span className="text-gray-900">
                          {new Date(selectedItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Information</h3>
                
                {/* Availability Summary */}
                <div className={`rounded-lg border-2 p-4 ${availability.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <AvailabilityIcon className={`h-6 w-6 mr-3 ${availability.color}`} />
                      <h4 className={`text-lg font-semibold ${availability.color}`}>{availability.status}</h4>
                    </div>
                    <span className={`text-2xl font-bold ${availability.color}`}>
                      {selectedItem.availableCopies}/{selectedItem.totalCopies}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${
                        selectedItem.availableCopies / selectedItem.totalCopies > 0.7 
                          ? 'bg-green-500' 
                          : selectedItem.availableCopies / selectedItem.totalCopies > 0.3 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${(selectedItem.availableCopies / selectedItem.totalCopies) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {selectedItem.availableCopies > 0 
                      ? `${selectedItem.availableCopies} cop${selectedItem.availableCopies === 1 ? 'y' : 'ies'} currently available for borrowing.`
                      : 'All copies are currently checked out. Consider placing a reservation.'}
                  </p>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Location Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">Main Library Building</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">Section A - {selectedItem.subject || 'General Collection'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Hash className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-700">Call Number: {selectedItem.itemType.substring(0, 3).toUpperCase()}-{selectedItem.itemId.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                </div>

                {/* Borrowing Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Borrowing Information</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Loan Period:</strong> 14 days (renewable once if no reservations)</p>
                    <p><strong>Renewal:</strong> Can be renewed online or at circulation desk</p>
                    <p><strong>Late Fees:</strong> $1.00 per day after due date</p>
                    <p><strong>Reservation:</strong> {selectedItem.availableCopies === 0 ? 'Available' : 'Not needed - copies available'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Purchase Request Dialog */}
      <PurchaseRequestDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        onSuccess={() => {
          // Navigate back to search after successful purchase request
          if (setActiveModule) {
            setActiveModule('search')
          }
          setSelectedItem(null)
        }}
        patronId={patronId}
        selectedItem={selectedItem ? {
          title: selectedItem.title,
          author: selectedItem.author,
          isbn: selectedItem.isbn,
          subject: selectedItem.subject,
          itemType: selectedItem.itemType,
          price: selectedItem.price
        } : null}
      />
    </div>
  )
}

export default ItemDetails

