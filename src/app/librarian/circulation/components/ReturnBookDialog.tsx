"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, RotateCcw, AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { returnBook, getActiveTransactions, collectFine } from '../actions/circulation'

interface ReturnBookDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Transaction {
  transactionId: number
  patronId: number
  itemId: number
  borrowedAt: Date
  dueDate: Date
  isOverdue: boolean
  daysUntilDue: number
  calculatedFine: number
  patron: {
    patronFirstName: string
    patronLastName: string
    patronEmail: string
  }
  item: {
    title: string
    author: string
    isbn: string
  }
}

export function ReturnBookDialog({ isOpen, onClose, onSuccess }: ReturnBookDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [collectingFine, setCollectingFine] = useState(false)

  const searchTransactions = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const result = await getActiveTransactions()
      if (result.success) {
        // Filter transactions by patron name, book title, or transaction ID
        const filtered = result.transactions.filter((transaction: Transaction) => {
          const patronName = `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`.toLowerCase()
          const bookTitle = transaction.item.title.toLowerCase()
          const transactionId = transaction.transactionId.toString()
          const queryLower = query.toLowerCase()
          
          return patronName.includes(queryLower) ||
                 bookTitle.includes(queryLower) ||
                 transactionId.includes(queryLower)
        })
        setSearchResults(filtered)
      } else {
        setError('Error searching transactions')
      }
    } catch (error) {
      setError('Error searching transactions')
    } finally {
      setSearching(false)
    }
  }

  const handleReturnBook = async (withFineCollection = false) => {
    if (!selectedTransaction) return

    setLoading(true)
    setError('')
    
    try {
      const result = await returnBook(selectedTransaction.transactionId)
      
      if (result.success) {
        // If there was a fine and we collected it, record the payment
        if (withFineCollection && selectedTransaction.calculatedFine > 0) {
          await collectFine(selectedTransaction.transactionId, selectedTransaction.calculatedFine)
        }
        
        onSuccess()
        handleClose()
      } else {
        setError(result.error || 'Failed to return book')
      }
    } catch (error) {
      setError('An error occurred while returning the book')
    } finally {
      setLoading(false)
    }
  }

  const handleCollectFine = async () => {
    if (!selectedTransaction || selectedTransaction.calculatedFine <= 0) return

    setCollectingFine(true)
    try {
      const result = await collectFine(selectedTransaction.transactionId, selectedTransaction.calculatedFine)
      if (result.success) {
        // Update the selected transaction to reflect fine collection
        setSelectedTransaction({
          ...selectedTransaction,
          calculatedFine: 0
        })
      } else {
        setError('Failed to collect fine')
      }
    } catch (error) {
      setError('Error collecting fine')
    } finally {
      setCollectingFine(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedTransaction(null)
    setSearchResults([])
    setError('')
    onClose()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return Book
          </DialogTitle>
          <DialogDescription>
            Search for an active loan to process the return
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div>
            <Label htmlFor="transaction-search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Active Books
            </Label>
            <div className="relative">
              <Input
                id="transaction-search"
                placeholder="Search by patron name, book title, or transaction ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchTransactions(e.target.value)
                }}
              />
              {searching && (
                <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* Selected Transaction Details */}
          {selectedTransaction ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Loan Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Book:</span> {selectedTransaction.item.title}</p>
                        <p><span className="font-medium">Author:</span> {selectedTransaction.item.author}</p>
                        <p><span className="font-medium">ISBN:</span> {selectedTransaction.item.isbn}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Patron:</span> {selectedTransaction.patron.patronFirstName} {selectedTransaction.patron.patronLastName}</p>
                        <p><span className="font-medium">Email:</span> {selectedTransaction.patron.patronEmail}</p>
                        <p><span className="font-medium">Transaction ID:</span> {selectedTransaction.transactionId}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Date Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Issue Date</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(selectedTransaction.borrowedAt)}</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Due Date</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(selectedTransaction.dueDate)}</p>
                </div>
                
                <div className={`p-3 border rounded-lg ${
                  selectedTransaction.isOverdue ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedTransaction.isOverdue ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <p className={`text-sm ${
                    selectedTransaction.isOverdue ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedTransaction.isOverdue 
                      ? `${Math.abs(selectedTransaction.daysUntilDue)} days overdue`
                      : selectedTransaction.daysUntilDue > 0 
                        ? `${selectedTransaction.daysUntilDue} days remaining`
                        : 'Due today'
                    }
                  </p>
                </div>
              </div>

              {/* Fine Information */}
              {selectedTransaction.calculatedFine > 0 && (
                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-semibold text-orange-800">Overdue Fine</h4>
                        <p className="text-sm text-orange-700">
                          ${selectedTransaction.calculatedFine.toFixed(2)} fine accumulated
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCollectFine}
                      disabled={collectingFine}
                      className="border-orange-300 hover:bg-orange-100"
                    >
                      {collectingFine ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Collecting...
                        </>
                      ) : (
                        'Collect Fine'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((transaction) => (
                <div
                  key={transaction.transactionId}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    transaction.isOverdue ? 'border-red-200 bg-red-25' : ''
                  }`}
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.item.title}</p>
                      <p className="text-sm text-gray-600">
                        Borrowed by {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={transaction.isOverdue ? "destructive" : "secondary"} className="text-xs">
                          {transaction.isOverdue 
                            ? `${Math.abs(transaction.daysUntilDue)} days overdue`
                            : `Due in ${transaction.daysUntilDue} days`
                          }
                        </Badge>
                        {transaction.calculatedFine > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Fine: ${transaction.calculatedFine.toFixed(2)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          ID: {transaction.transactionId}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                <p className="text-gray-500 text-center py-4">No active Books found</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleReturnBook()} 
            disabled={!selectedTransaction || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Return Book'
            )}
          </Button>
          {selectedTransaction?.calculatedFine > 0 && (
            <Button 
              onClick={() => handleReturnBook(true)} 
              disabled={!selectedTransaction || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Return & Collect Fine'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
