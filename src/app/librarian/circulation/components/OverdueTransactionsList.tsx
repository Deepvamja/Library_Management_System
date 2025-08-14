"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Loader2, Search, DollarSign, User, BookOpen, Calendar, AlertTriangle } from 'lucide-react'
import { collectFine } from '../actions/circulation'

interface OverdueTransactionsListProps {
  transactions: any[]
  onUpdate: () => void
}

export function OverdueTransactionsList({ transactions, onUpdate }: OverdueTransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [collectingFineIds, setCollectingFineIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  const handleCollectFine = async (transactionId: number, fineAmount: number) => {
    setCollectingFineIds(prev => new Set([...prev, transactionId]))
    setError('')
    
    try {
      const result = await collectFine(transactionId, fineAmount)
      
      if (result.success) {
        onUpdate() // Refresh the transactions
      } else {
        setError(`Failed to collect fine: ${result.error}`)
      }
    } catch (error) {
      setError('An error occurred while collecting the fine')
    } finally {
      setCollectingFineIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(transactionId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    const patronName = `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`.toLowerCase()
    const bookTitle = transaction.item.title.toLowerCase()
    const transactionId = transaction.transactionId.toString()
    
    return patronName.includes(searchLower) ||
           bookTitle.includes(searchLower) ||
           transactionId.includes(searchLower)
  })

  const totalFines = filteredTransactions.reduce((sum, t) => sum + t.calculatedFine, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Overdue Books ({transactions.length})
          </CardTitle>
          <CardDescription>
            Manage overdue books and collect fines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Control */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by patron name, book title, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-800">
              {error}
            </div>
          )}

          {/* Summary Banner */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Overdue Summary</h3>
                    <p className="text-sm text-red-700">
                      {filteredTransactions.length} overdue books with ${totalFines.toFixed(2)} in total fines
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    ${totalFines.toFixed(2)}
                  </div>
                  <div className="text-xs text-red-600">Total Outstanding</div>
                </div>
              </div>
            </div>
          )}

          {/* Overdue Transactions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book & Patron</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Fine Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No overdue books match the search query' : 'No overdue books found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId} className="border-l-4 border-l-red-500">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{transaction.item.title}</div>
                          <div className="text-xs text-gray-600">by {transaction.item.author}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Email: {transaction.patron.patronEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {transaction.transactionId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(transaction.issueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-red-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs">
                          {Math.abs(transaction.daysUntilDue)} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-red-600">
                          ${transaction.calculatedFine.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(transaction.calculatedFine / Math.abs(transaction.daysUntilDue)).toFixed(2)}/day
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCollectFine(transaction.transactionId, transaction.calculatedFine)}
                          disabled={collectingFineIds.has(transaction.transactionId)}
                          className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                        >
                          {collectingFineIds.has(transaction.transactionId) ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Collecting...
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-3 w-3 mr-1" />
                              Collect Fine
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

          {/* Detailed Statistics */}
          {filteredTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <Card className="border-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredTransactions.length}
                  </div>
                  <div className="text-xs text-gray-500">Overdue Books</div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      filteredTransactions.reduce((sum, t) => sum + Math.abs(t.daysUntilDue), 0) / 
                      filteredTransactions.length
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Avg Days Overdue</div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${(totalFines / filteredTransactions.length).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Avg Fine per Book</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {[...new Set(filteredTransactions.map(t => t.patronId))].length}
                  </div>
                  <div className="text-xs text-gray-500">Unique Patrons</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Actions */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Bulk Actions</h4>
              <p className="text-sm text-gray-600 mb-3">
                For multiple fine collections or sending reminder notices, consider using the librarian panel's communication tools.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Reminders (Coming Soon)
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bulk Fine Collection (Coming Soon)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
