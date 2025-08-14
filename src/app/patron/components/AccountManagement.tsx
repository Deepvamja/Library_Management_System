'use client'

import React, { useState, useEffect } from 'react'
import { History, DollarSign, BookOpen, AlertCircle } from 'lucide-react'
import { getPatronBorrowingHistory, getCurrentBorrowedItems, getPatronFines } from '../../actions/patronActions'

interface AccountManagementProps {
  patronId: number
}

const AccountManagement: React.FC<AccountManagementProps> = ({ patronId }) => {
  const [borrowingHistory, setBorrowingHistory] = useState<any[]>([])
  const [currentBorrowedItems, setCurrentBorrowedItems] = useState<any[]>([])
  const [pendingFines, setPendingFines] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadAccountData()
  }, [patronId])
  
  const loadAccountData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading account data for patronId:', patronId)
      
      // Validate patronId
      if (!patronId || patronId <= 0) {
        throw new Error('Invalid patron ID')
      }
      
      const [historyResult, currentItemsResult, finesResult] = await Promise.all([
        getPatronBorrowingHistory(patronId),
        getCurrentBorrowedItems(patronId),
        getPatronFines(patronId)
      ])
      
      console.log('Results:', { historyResult, currentItemsResult, finesResult })
      
      if (historyResult.success && Array.isArray(historyResult.transactions)) {
        setBorrowingHistory(historyResult.transactions || [])
      } else {
        console.error('History error:', historyResult.error)
        setBorrowingHistory([])
      }
      
      if (currentItemsResult.success && Array.isArray(currentItemsResult.transactions)) {
        setCurrentBorrowedItems(currentItemsResult.transactions || [])
      } else {
        console.error('Current items error:', currentItemsResult.error)
        setCurrentBorrowedItems([])
      }
      
      if (finesResult.success && typeof finesResult.totalFines === 'number') {
        setPendingFines(finesResult.totalFines)
      } else {
        console.error('Fines error:', finesResult.error)
        setPendingFines(0)
      }
      
      if (!historyResult.success || !currentItemsResult.success || !finesResult.success) {
        const errors = []
        if (!historyResult.success) errors.push(`History: ${historyResult.error}`)
        if (!currentItemsResult.success) errors.push(`Current items: ${currentItemsResult.error}`)
        if (!finesResult.success) errors.push(`Fines: ${finesResult.error}`)
        setError(`Failed to load account data: ${errors.join(', ')}`)
      }
    } catch (err) {
      console.error('Account data loading error:', err)
      setError(`An error occurred while loading account data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Unknown'
    try {
      return new Date(date).toLocaleDateString()
    } catch (error) {
      return 'Invalid Date'
    }
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Management</h2>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-700 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Currently Borrowed Items */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 text-gray-500 mr-2" /> Currently Borrowed Items
        </h3>
        {currentBorrowedItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No items currently borrowed</p>
            <p className="text-sm text-gray-500 mt-2">Start browsing our collection to borrow books!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBorrowedItems.map((transaction, index) => (
              <div key={transaction.transactionId || index} className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {transaction.item?.title || 'Unknown Title'}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.dueDate && new Date(transaction.dueDate) < new Date() 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {transaction.dueDate && new Date(transaction.dueDate) < new Date() ? 'Overdue' : 'Active'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">by {transaction.item?.author || 'Unknown Author'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Borrowed:</span> {transaction.borrowedAt ? formatDate(transaction.borrowedAt) : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {transaction.dueDate ? formatDate(transaction.dueDate) : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Item Type:</span> {transaction.item?.itemType || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Fine Paid:</span> ${transaction.finePaid?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Borrowing History */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <History className="h-5 w-5 text-gray-500 mr-2" /> Borrowing History
        </h3>
        {borrowingHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No borrowing history yet</p>
            <p className="text-sm text-gray-500 mt-2">Your past transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {borrowingHistory.map((transaction, index) => (
              <div key={transaction.transactionId || index} className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {transaction.item?.title || 'Unknown Title'}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.isReturned 
                      ? 'bg-blue-100 text-blue-800' 
                      : transaction.dueDate && new Date(transaction.dueDate) < new Date()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {transaction.isReturned ? 'Returned' : (transaction.dueDate && new Date(transaction.dueDate) < new Date() ? 'Overdue' : 'Active')}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">by {transaction.item?.author || 'Unknown Author'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Borrowed:</span> {transaction.borrowedAt ? formatDate(transaction.borrowedAt) : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {transaction.dueDate ? formatDate(transaction.dueDate) : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Returned:</span> {transaction.returnedAt ? formatDate(transaction.returnedAt) : 'Not returned'}
                  </div>
                  <div>
                    <span className="font-medium">Fine Paid:</span> ${transaction.finePaid?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Fines */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 text-red-500 mr-2" /> Pending Fines
        </h3>
        {pendingFines > 0 ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">
              You have ${pendingFines.toFixed(2)} in pending fines.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Please visit the library or contact staff to resolve your outstanding fines.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-700">
              ✓ No pending fines. Your account is in good standing!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AccountManagement


