"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ItemList } from './components/item-list'
import { deleteItem, addItem, updateItem, getItems } from './actions/items'
import { ItemDialog } from './components/ItemDialog'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type ItemWithStatus = {
  itemId: number
  title: string
  author: string
  isbn: string | null
  subject: string | null
  itemType: string
  price: number
  totalCopies: number
  availableCopies: number
  isVisible: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

export default function LibrarianCatalogPage() {
  const [items, setItems] = useState<ItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<ItemWithStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const items = await getItems()
      setItems(items)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (itemId: number) => {
    setCurrentItem(items.find(item => item.itemId === itemId) || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const result = await deleteItem(itemId)
      if (result.success) {
        setItems(items.filter(item => item.itemId !== itemId))
      } else {
        alert(result.error)
      }
    }
  }

  const handleAddNew = () => {
    setCurrentItem(null)
    setIsDialogOpen(true)
  }

  // Filter items based on search term and filters
  const filteredItems = items.filter(item => {
    // Search field filtering
    let matchesSearch = true
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      switch (searchField) {
        case 'title':
          matchesSearch = item.title.toLowerCase().includes(searchLower)
          break
        case 'author':
          matchesSearch = item.author.toLowerCase().includes(searchLower)
          break
        case 'isbn':
          matchesSearch = item.isbn?.toLowerCase().includes(searchLower) || false
          break
        case 'subject':
          matchesSearch = item.subject?.toLowerCase().includes(searchLower) || false
          break
        case 'itemType':
          matchesSearch = item.itemType.toLowerCase().includes(searchLower)
          break
        case 'all':
        default:
          matchesSearch = item.title.toLowerCase().includes(searchLower) ||
                        item.author.toLowerCase().includes(searchLower) ||
                        (item.isbn && item.isbn.toLowerCase().includes(searchLower)) ||
                        (item.subject && item.subject.toLowerCase().includes(searchLower)) ||
                        item.itemType.toLowerCase().includes(searchLower)
      }
    }
    
    // Status filtering
    const matchesStatusFilter = statusFilter === 'all' || 
      item.itemType.toLowerCase() === statusFilter.toLowerCase() ||
      item.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatusFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Book Catalog Management</h1>
        <p className="text-gray-600">Manage the library's book collection, magazines, and other items</p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="all">All Fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
            <option value="subject">Subject</option>
            <option value="itemType">Item Type</option>
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchField === 'all' ? 'Search in all fields...' : `Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
        >
          <option value="all">All Status</option>
          <option value="book">Books</option>
          <option value="magazine">Magazines</option>
          <option value="journal">Journals</option>
          <option value="reference">Reference</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{items.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {items.filter(item => item.status === 'Available').length}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {items.filter(item => item.status === 'Issued').length}
          </div>
          <div className="text-sm text-gray-600">Issued</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {items.filter(item => item.status === 'Reserved').length}
          </div>
          <div className="text-sm text-gray-600">Reserved</div>
        </div>
      </div>
      
      {/* Items List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Catalog Items {filteredItems.length !== items.length && `(${filteredItems.length} of ${items.length})`}
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading items...</p>
          </div>
        ) : (
          <ItemList 
            items={filteredItems} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}

        {/* Item Dialog for Add/Edit */}
        <ItemDialog 
          item={currentItem} 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          onAddOrUpdate={loadItems} 
        />
      </div>
    </div>
  )
}
