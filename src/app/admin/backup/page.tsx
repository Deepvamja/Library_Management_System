'use client'

import React, { useState, useEffect } from 'react'
import { 
  createDatabaseBackup,
  getBackupList,
  deleteBackup,
  restoreDatabase,
  getDatabaseStats,
  testDatabaseConnection
} from '@/app/actions/backupActions'

function BackupPage() {
  const [backups, setBackups] = useState([])
  const [dbStats, setDbStats] = useState(null)
  const [dbConnected, setDbConnected] = useState(false)
  const [dbError, setDbError] = useState('')
  const [loading, setLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedBackup, setSelectedBackup] = useState('')

  const fetchBackups = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await getBackupList()
      if (result.success) {
        setBackups(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch backups')
      }
    } catch (error) {
      setError('Failed to fetch backups')
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseConnection = async () => {
    try {
      const result = await testDatabaseConnection()
      setDbConnected(result.success)
      if (!result.success) {
        setDbError(result.error || 'Database connection failed')
      } else {
        setDbError('')
      }
      return result.success
    } catch (error) {
      setDbConnected(false)
      setDbError('Database connection test failed')
      return false
    }
  }

  const fetchDatabaseStats = async () => {
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      setDbStats(null)
      return
    }
    
    try {
      const result = await getDatabaseStats()
      if (result.success) {
        setDbStats(result.data)
      } else {
        setDbError(result.error || 'Failed to fetch database statistics')
        setDbStats(null)
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error)
      setDbError('Failed to fetch database statistics')
      setDbStats(null)
    }
  }

  const handleBackup = async () => {
    setError('')
    setMessage('')
    setBackupLoading(true)
    try {
      const result = await createDatabaseBackup()
      if (result.success) {
        setMessage(`Backup created successfully: ${result.data?.filename}`)
        fetchBackups()
      } else {
        setError(result.error || 'Failed to create backup')
      }
    } catch (error) {
      setError('Failed to create backup')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleDelete = async (filename) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return
    }
    
    setError('')
    setMessage('')
    try {
      const result = await deleteBackup(filename)
      if (result.success) {
        setMessage('Backup deleted successfully')
        fetchBackups()
      } else {
        setError(result.error || 'Failed to delete backup')
      }
    } catch (error) {
      setError('Failed to delete backup')
    }
  }

  const handleRestore = async (filename) => {
    if (!confirm(`Are you sure you want to restore from backup: ${filename}? This will overwrite your current database!`)) {
      return
    }
    
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const result = await restoreDatabase(filename)
      if (result.success) {
        setMessage('Database restored successfully! Please refresh the page.')
      } else {
        setError(result.error || 'Failed to restore database')
      }
    } catch (error) {
      setError('Failed to restore database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
    fetchDatabaseStats()
  }, [])

  if (loading && backups.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Backup & Restore Tools</h1>
        <p className="text-green-100">Protect your library data with automated backup and restore capabilities</p>
      </div>

      {/* Database Status Banner */}
      {!dbConnected ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Database Connection Failed:</strong> {dbError}
              <div className="mt-1 text-sm">
                <strong>To fix this:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Make sure MySQL server is running</li>
                  <li>Check that database "lib" exists</li>
                  <li>Verify your credentials in .env file</li>
                  <li>Run: <code className="bg-red-200 px-1 rounded">npm run db:push</code> to create tables</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span><strong>Database Connected:</strong> MySQL database is connected and ready for backup operations.</span>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Success:</strong> {message}
        </div>
      )}

      {/* Database Statistics */}
      {dbStats && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Database Overview</h2>
            <p className="text-sm text-gray-600">Current database statistics</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{dbStats.patrons}</p>
                <p className="text-sm text-gray-600">Patrons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dbStats.items}</p>
                <p className="text-sm text-gray-600">Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{dbStats.transactions}</p>
                <p className="text-sm text-gray-600">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{dbStats.reservations}</p>
                <p className="text-sm text-gray-600">Reservations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{dbStats.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{dbStats.totalRecords}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Actions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Backup Actions</h2>
          <p className="text-sm text-gray-600">Create new backups or manage existing ones</p>
        </div>
        <div className="p-6">
          <button 
            onClick={handleBackup}
            disabled={backupLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
          >
            {backupLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Backup...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Create New Backup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Available Backups</h2>
          <p className="text-sm text-gray-600">Manage your database backups</p>
        </div>
        
        {backups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (KB)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{backup.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(backup.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.size.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <button 
                          onClick={() => handleRestore(backup.filename)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1 rounded text-xs"
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => handleDelete(backup.filename)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No backups available</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first backup.</p>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Backups are stored locally in the <code className="bg-yellow-100 px-1 rounded">backups/</code> directory</li>
                <li>Restoring a backup will completely overwrite your current database</li>
                <li>Always create a backup before performing major operations</li>
                <li>Regular automated backups are recommended for production environments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackupPage
