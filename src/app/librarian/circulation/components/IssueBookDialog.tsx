"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, BookOpen, User, Calendar } from 'lucide-react'
import { issueBook, searchPatrons, searchItems } from '../actions/circulation'

interface IssueBookDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Patron {
  patronId: number
  patronFirstName: string
  patronLastName: string
  patronEmail: string
}

interface Item {
  itemId: number
  title: string
  author: string
  isbn: string
  totalCopies: number
  availableCopies: number
  location: string
}

export function IssueBookDialog({ isOpen, onClose, onSuccess }: IssueBookDialogProps) {
  const [patronQuery, setPatronQuery] = useState('')
  const [itemQuery, setItemQuery] = useState('')
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [patronResults, setPatronResults] = useState<Patron[]>([])
  const [itemResults, setItemResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [searchingPatrons, setSearchingPatrons] = useState(false)
  const [searchingItems, setSearchingItems] = useState(false)
  const [error, setError] = useState('')

  const searchPatronsHandler = async (query: string) => {
    if (query.length < 2) {
      setPatronResults([])
      return
    }

    setSearchingPatrons(true)
    try {
      const result = await searchPatrons(query)
      if (result.success) {
        setPatronResults(result.patrons)
      } else {
        setError('Error searching patrons')
      }
    } catch (error) {
      setError('Error searching patrons')
    } finally {
      setSearchingPatrons(false)
    }
  }

  const searchItemsHandler = async (query: string) => {
    if (query.length < 2) {
      setItemResults([])
      return
    }

    setSearchingItems(true)
    try {
      const result = await searchItems(query)
      if (result.success) {
        setItemResults(result.items.filter(item => item.availableCopies > 0))
      } else {
        setError('Error searching items')
      }
    } catch (error) {
      setError('Error searching items')
    } finally {
      setSearchingItems(false)
    }
  }

  const handleIssueBook = async () => {
    if (!selectedPatron || !selectedItem) return

    setLoading(true)
    setError('')
    
    try {
      const result = await issueBook(selectedPatron.patronId, selectedItem.itemId)
      
      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError(result.error || 'Failed to issue book')
      }
    } catch (error) {
      setError('An error occurred while issuing the book')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPatronQuery('')
    setItemQuery('')
    setSelectedPatron(null)
    setSelectedItem(null)
    setPatronResults([])
    setItemResults([])
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Issue Book
          </DialogTitle>
          <DialogDescription>
            Select a patron and an available book to create a new loan
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Patron Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="patron-search" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Search Patron
              </Label>
              <div className="relative">
                <Input
                  id="patron-search"
                  placeholder="Search by name, email, or ID..."
                  value={patronQuery}
                  onChange={(e) => {
                    setPatronQuery(e.target.value)
                    searchPatronsHandler(e.target.value)
                  }}
                />
                {searchingPatrons && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
            </div>

            {selectedPatron ? (
              <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedPatron.patronFirstName} {selectedPatron.patronLastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedPatron.patronEmail}</p>
                    <p className="text-xs text-gray-500">ID: {selectedPatron.patronId}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPatron(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {patronResults.map((patron) => (
                  <div
                    key={patron.patronId}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPatron(patron)}
                  >
                    <p className="font-medium">
                      {patron.patronFirstName} {patron.patronLastName}
                    </p>
                    <p className="text-sm text-gray-600">{patron.patronEmail}</p>
                    <p className="text-xs text-gray-500">ID: {patron.patronId}</p>
                  </div>
                ))}
                {patronQuery.length >= 2 && patronResults.length === 0 && !searchingPatrons && (
                  <p className="text-gray-500 text-center py-4">No patrons found</p>
                )}
              </div>
            )}
          </div>

          {/* Item Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Book
              </Label>
              <div className="relative">
                <Input
                  id="item-search"
                  placeholder="Search by title, author, or ISBN..."
                  value={itemQuery}
                  onChange={(e) => {
                    setItemQuery(e.target.value)
                    searchItemsHandler(e.target.value)
                  }}
                />
                {searchingItems && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
            </div>

            {selectedItem ? (
              <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedItem.title}</p>
                    <p className="text-sm text-gray-600">by {selectedItem.author}</p>
                    <p className="text-xs text-gray-500">ISBN: {selectedItem.isbn}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        Available: {selectedItem.availableCopies}
                      </Badge>
                      <Badge variant="outline">
                        Location: {selectedItem.location}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedItem(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {itemResults.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">by {item.author}</p>
                    <p className="text-xs text-gray-500">ISBN: {item.isbn}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Available: {item.availableCopies}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.location}
                      </Badge>
                    </div>
                  </div>
                ))}
                {itemQuery.length >= 2 && itemResults.length === 0 && !searchingItems && (
                  <p className="text-gray-500 text-center py-4">No available books found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedPatron && selectedItem && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Loan Details</span>
            </div>
            <p className="text-sm text-gray-600">
              This book will be issued to <strong>{selectedPatron.patronFirstName} {selectedPatron.patronLastName}</strong> 
              {' '}for a standard loan period of <strong>14 days</strong>.
            </p>
          </div>
        )}

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
            onClick={handleIssueBook} 
            disabled={!selectedPatron || !selectedItem || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Issuing...
              </>
            ) : (
              'Issue Book'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
