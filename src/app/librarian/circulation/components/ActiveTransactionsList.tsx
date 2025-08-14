"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Loader2, Search, RefreshCw, User, BookOpen, Calendar, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { renewBook } from '../actions/circulation'

interface ActiveTransactionsListProps {
  transactions: any[]
  onUpdate: () => void
}

type FilterType = 'all' | 'due-soon' | 'overdue' | 'normal'

export function ActiveTransactionsList({ transactions, onUpdate }: ActiveTransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [renewingIds, setRenewingIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  const handleRenewBook = async (transactionId: number) => {
    setRenewingIds(prev => new Set([...prev, transactionId]))
    setError('')
    
    try {
      const result = await renewBook(transactionId)
      
      if (result.success) {
        onUpdate() // Refresh the transactions
      } else {
        setError(`Failed to renew book: ${result.error}`)
      }
    } catch (error) {
      setError('An error occurred while renewing the book')
    } finally {
      setRenewingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(transactionId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (transaction: any) => {
    if (transaction.isOverdue) {
      return (
        <Badge variant="destructive" className="text-xs">
          {Math.abs(transaction.daysUntilDue)} days overdue
        </Badge>
      )
    } else if (transaction.daysUntilDue <= 3) {
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          Due in {transaction.daysUntilDue} days
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          {transaction.daysUntilDue} days remaining
        </Badge>
      )
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase()
    const patronName = `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`.toLowerCase()
    const bookTitle = transaction.item.title.toLowerCase()
    const transactionId = transaction.transactionId.toString()
    
    const matchesSearch = searchQuery === '' || 
      patronName.includes(searchLower) ||
      bookTitle.includes(searchLower) ||
      transactionId.includes(searchLower)

    if (!matchesSearch) return false

    // Apply status filter
    switch (filter) {
      case 'overdue':
        return transaction.isOverdue
      case 'due-soon':
        return !transaction.isOverdue && transaction.daysUntilDue <= 3
      case 'normal':
        return !transaction.isOverdue && transaction.daysUntilDue > 3
      default:
        return true
    }
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Active Books ({transactions.length})
          </CardTitle>
          <CardDescription>
            Manage currently borrowed books and renewals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by patron name, book title, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due-soon">Due Soon (≤3 days)</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-800">
              {error}
            </div>
          )}

          {/* Transactions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book & Patron</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery || filter !== 'all' ? 'No loans match the current filters' : 'No active loans found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{transaction.item.title}</div>
                          <div className="text-xs text-gray-600">by {transaction.item.author}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {transaction.transactionId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(transaction.borrowedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(transaction.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction)}
                      </TableCell>
                      <TableCell>
                        {transaction.calculatedFine > 0 ? (
                          <Badge variant="outline" className="text-xs text-red-600">
                            ${transaction.calculatedFine.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">$0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRenewBook(transaction.transactionId)}
                          disabled={renewingIds.has(transaction.transactionId) || transaction.isOverdue}
                          className="text-xs"
                        >
                          {renewingIds.has(transaction.transactionId) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Renewing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renew
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          {filteredTransactions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</div>
                <div className="text-xs text-gray-500">Total Shown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredTransactions.filter(t => t.isOverdue).length}
                </div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredTransactions.filter(t => !t.isOverdue && t.daysUntilDue <= 3).length}
                </div>
                <div className="text-xs text-gray-500">Due Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${filteredTransactions.reduce((sum, t) => sum + t.calculatedFine, 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Total Fines</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
