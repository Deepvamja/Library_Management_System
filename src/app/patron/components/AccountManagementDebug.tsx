'use client'

import React, { useState, useEffect } from 'react'
import { History, DollarSign, BookOpen, AlertCircle } from 'lucide-react'
import { getPatronBorrowingHistory, getCurrentBorrowedItems, getPatronFines } from '../../actions/patronActions'

interface AccountManagementProps {
  patronId: number
}

const AccountManagementDebug: React.FC<AccountManagementProps> = ({ patronId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  useEffect(() => {
    loadAccountData()
  }, [patronId])
  
  const loadAccountData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Debug - patronId:', patronId, typeof patronId)
      
      if (!patronId || patronId <= 0) {
        throw new Error('Invalid patron ID')
      }
      
      const historyResult = await getPatronBorrowingHistory(patronId)
      console.log('Debug - historyResult:', historyResult)
      
      const currentItemsResult = await getCurrentBorrowedItems(patronId)
      console.log('Debug - currentItemsResult:', currentItemsResult)
      
      const finesResult = await getPatronFines(patronId)
      console.log('Debug - finesResult:', finesResult)
      
      setDebugInfo({
        historyResult,
        currentItemsResult,
        finesResult
      })
      
    } catch (err) {
      console.error('Debug - Account data loading error:', err)
      setError(`An error occurred while loading account data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <p>Loading account data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Management Debug</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-700 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <pre className="text-xs overflow-auto max-h-96 bg-white p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {debugInfo && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">History Result Success: {String(debugInfo.historyResult?.success)}</h3>
            <p>Transactions Length: {debugInfo.historyResult?.transactions?.length || 0}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Items Result Success: {String(debugInfo.currentItemsResult?.success)}</h3>
            <p>Transactions Length: {debugInfo.currentItemsResult?.transactions?.length || 0}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Fines Result Success: {String(debugInfo.finesResult?.success)}</h3>
            <p>Total Fines: {debugInfo.finesResult?.totalFines || 0}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountManagementDebug
