'use client'

import React, { useState, useEffect } from 'react'
import { 
  getDashboardStats,
  getPopularBooksReport,
  getPatronActivityReport,
  getOverdueItemsReport,
  getMonthlyCirculationReport,
  getSubjectDistributionReport,
  getFineCollectionReport
} from '@/app/actions/analyticsActions'

function ReportsPage() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalPatrons: 0,
    overdueLoans: 0,
    totalReservations: 0,
    availableBooks: 0,
    totalFines: 0
  })
  const [popularBooks, setPopularBooks] = useState([])
  const [patronActivity, setPatronActivity] = useState([])
  const [overdueItems, setOverdueItems] = useState([])
  const [monthlyCirculation, setMonthlyCirculation] = useState([])
  const [subjectDistribution, setSubjectDistribution] = useState([])
  const [fineCollection, setFineCollection] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAllReports() {
      try {
        setLoading(true)
        const [
          statsResult,
          popularBooksResult,
          patronActivityResult,
          overdueItemsResult,
          monthlyCirculationResult,
          subjectDistributionResult,
          fineCollectionResult
        ] = await Promise.all([
          getDashboardStats(),
          getPopularBooksReport(),
          getPatronActivityReport(),
          getOverdueItemsReport(),
          getMonthlyCirculationReport(),
          getSubjectDistributionReport(),
          getFineCollectionReport()
        ])

        if (statsResult.success) setStats(statsResult.data)
        if (popularBooksResult.success) setPopularBooks(popularBooksResult.data)
        if (patronActivityResult.success) setPatronActivity(patronActivityResult.data)
        if (overdueItemsResult.success) setOverdueItems(overdueItemsResult.data)
        if (monthlyCirculationResult.success) setMonthlyCirculation(monthlyCirculationResult.data)
        if (subjectDistributionResult.success) setSubjectDistribution(subjectDistributionResult.data)
        if (fineCollectionResult.success) setFineCollection(fineCollectionResult.data)
      } catch (err) {
        setError('Error loading reports')
      } finally {
        setLoading(false)
      }
    }
    fetchAllReports()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-blue-100">Comprehensive insights into library operations</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patrons</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatrons}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueLoans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Popular Books</h2>
            <p className="text-sm text-gray-600">Most borrowed books</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {popularBooks.slice(0, 5).map((book, index) => (
                <div key={book.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500">by {book.author}</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    {book.timesLost} borrows
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Subject Distribution</h2>
            <p className="text-sm text-gray-600">Books by subject category</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {subjectDistribution.slice(0, 5).map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-xs text-gray-500">{subject.totalBooks} books</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{subject.availableCopies} available</p>
                    <p className="text-xs text-gray-500">{subject.circulationRate.toFixed(1)}% in circulation</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Items Table */}
      {overdueItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Overdue Items</h2>
            <p className="text-sm text-gray-600">Items that need immediate attention</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patron</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueItems.slice(0, 10).map((item) => (
                  <tr key={item.transactionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.bookTitle}</div>
                        <div className="text-sm text-gray-500">{item.bookAuthor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.patronName}</div>
                      <div className="text-sm text-gray-500">{item.patronEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {item.daysOverdue} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.calculatedFine.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Circulation & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Circulation */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Circulation</h2>
            <p className="text-sm text-gray-600">Borrowing trends over time</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyCirculation.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{month.month}</p>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">{month.borrowed} borrowed</span>
                    <span className="text-green-600">{month.returned} returned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
            <p className="text-sm text-gray-600">Fine collection overview</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded">
                <span className="text-sm font-medium text-gray-900">Total Collected</span>
                <span className="text-lg font-bold text-green-600">
                  ${fineCollection?.summary.totalCollected.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded">
                <span className="text-sm font-medium text-gray-900">Pending Collection</span>
                <span className="text-lg font-bold text-yellow-600">
                  ${fineCollection?.summary.totalPending.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
                <span className="text-sm font-medium text-gray-900">Total Fines</span>
                <span className="text-lg font-bold text-blue-600">
                  ${fineCollection?.summary.totalFines.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage
