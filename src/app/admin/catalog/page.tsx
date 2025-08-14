'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Users, DollarSign } from 'lucide-react'
import { getAllItems, getCatalogStatistics, deleteItem, toggleItemVisibility, updateItem, createItem } from '@/app/actions/catalogActions'

interface Item {
  itemId: number
  title: string
  author: string
  isbn?: string
  subject?: string
  itemType: string
  price: number
  totalCopies: number
  availableCopies: number
  isVisible: boolean
  createdAt: Date
}

interface CatalogStats {
  totalItems: number
  visibleItems: number
  hiddenItems: number
  totalCopies: number
  availableCopies: number
  borrowedCopies: number
  uniqueAuthors: number
  itemTypes: { type: string; count: number }[]
}

function CatalogPage() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit/Add dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    subject: '',
    keywords: '',
    itemType: 'Book',
    price: 0,
    totalCopies: 1,
    availableCopies: 1,
    isVisible: true
  })

  // Fetch catalog data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [itemsResult, statsResult] = await Promise.all([
        getAllItems(),
        getCatalogStatistics()
      ])

      if (itemsResult.success) {
        setItems(itemsResult.data)
        setFilteredItems(itemsResult.data)
      } else {
        setError(itemsResult.error || 'Failed to fetch items')
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (err) {
      setError('Failed to load catalog data')
      console.error('Error fetching catalog data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter items based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        
        switch (searchField) {
          case 'title':
            return item.title.toLowerCase().includes(searchLower)
          case 'author':
            return item.author.toLowerCase().includes(searchLower)
          case 'isbn':
            return item.isbn?.toLowerCase().includes(searchLower)
          case 'subject':
            return item.subject?.toLowerCase().includes(searchLower)
          case 'itemType':
            return item.itemType.toLowerCase().includes(searchLower)
          case 'all':
          default:
            return item.title.toLowerCase().includes(searchLower) ||
                   item.author.toLowerCase().includes(searchLower) ||
                   item.isbn?.toLowerCase().includes(searchLower) ||
                   item.subject?.toLowerCase().includes(searchLower) ||
                   item.itemType.toLowerCase().includes(searchLower)
        }
      })
      setFilteredItems(filtered)
    }
  }, [searchTerm, searchField, items])

  // Handle delete item
  const handleDeleteItem = async (itemId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const result = await deleteItem(itemId)
      if (result.success) {
        await fetchData() // Refresh data
        alert(result.message)
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to delete item')
      console.error('Error deleting item:', err)
    }
  }

  // Handle toggle visibility
  const handleToggleVisibility = async (itemId: number) => {
    try {
      const result = await toggleItemVisibility(itemId)
      if (result.success) {
        await fetchData() // Refresh data
        alert(result.message)
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to update item visibility')
      console.error('Error toggling visibility:', err)
    }
  }

  // Handle edit item
  const handleEditItem = (item: Item) => {
    setCurrentItem(item)
    setFormData({
      title: item.title,
      author: item.author,
      isbn: item.isbn || '',
      subject: item.subject || '',
      keywords: '',
      itemType: item.itemType,
      price: item.price,
      totalCopies: item.totalCopies,
      availableCopies: item.availableCopies,
      isVisible: item.isVisible
    })
    setIsDialogOpen(true)
  }

  // Handle add new item
  const handleAddNewItem = () => {
    setCurrentItem(null)
    setFormData({
      title: '',
      author: '',
      isbn: '',
      subject: '',
      keywords: '',
      itemType: 'Book',
      price: 0,
      totalCopies: 1,
      availableCopies: 1,
      isVisible: true
    })
    setIsDialogOpen(true)
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.title || !formData.author) {
      alert('Please fill in required fields (Title and Author)')
      return
    }

    try {
      setFormLoading(true)
      let result

      if (currentItem?.itemId) {
        result = await updateItem(currentItem.itemId, formData)
      } else {
        result = await createItem({
          ...formData,
          availableCopies: formData.totalCopies // Set available copies equal to total copies for new items
        })
      }

      if (result.success) {
        await fetchData() // Refresh data
        alert(result.message)
        setIsDialogOpen(false)
      } else {
        alert(result.error || 'Failed to save item')
      }
    } catch (err) {
      alert('An error occurred while saving the item')
      console.error('Error saving item:', err)
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading catalog...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Catalog</p>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Catalog Management</h1>
        <p className="text-gray-600">Manage your library's collection of books and resources</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border shadow p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-2xl font-bold">{stats.totalItems}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg border shadow p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-600">Available Copies</h3>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.availableCopies}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg border shadow p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-600">Borrowed Copies</h3>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">{stats.borrowedCopies}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button and Search */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddNewItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
        
        <div className="flex items-center gap-2">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
            <option value="subject">Subject</option>
            <option value="itemType">Item Type</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder={searchField === 'all' ? 'Search in all fields...' : `Search by ${searchField}...`}
              className="pl-10 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item.itemId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">by {item.author}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Badge variant="outline" className="mb-1">{item.itemType}</Badge>
                      {item.subject && (
                        <div className="text-sm text-gray-500">{item.subject}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.isbn || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <span className="text-green-600">{item.availableCopies}</span> / {item.totalCopies}
                    </div>
                    <div className="text-xs text-gray-500">Available / Total</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.isVisible ? "default" : "secondary"}>
                      {item.isVisible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleVisibility(item.itemId)}
                      >
                        {item.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteItem(item.itemId, item.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? (
                    <div>
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No items found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div>
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No items in catalog yet</p>
                      <p className="text-sm mt-1">Add your first item to get started</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input 
                value={formData.title} 
                onChange={handleInputChange} 
                name="title" 
                required
                placeholder="Enter item title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <Input 
                value={formData.author} 
                onChange={handleInputChange} 
                name="author" 
                required
                placeholder="Enter author name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <Input 
                value={formData.isbn} 
                onChange={handleInputChange} 
                name="isbn" 
                placeholder="Enter ISBN number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input 
                value={formData.subject} 
                onChange={handleInputChange} 
                name="subject" 
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
              <select 
                value={formData.itemType} 
                onChange={handleInputChange} 
                name="itemType" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Book">Book</option>
                <option value="Magazine">Magazine</option>
                <option value="Journal">Journal</option>
                <option value="Reference">Reference</option>
                <option value="Atlas">Atlas</option>
                <option value="Encyclopedia">Encyclopedia</option>
                <option value="Multimedia">Multimedia</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.price} 
                  onChange={handleInputChange} 
                  name="price" 
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
                <Input 
                  type="number" 
                  value={formData.totalCopies} 
                  onChange={handleInputChange} 
                  name="totalCopies" 
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="isVisible"
                name="isVisible"
                checked={formData.isVisible} 
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">Visible to public</label>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading || !formData.title || !formData.author}>
              {formLoading ? 'Saving...' : (currentItem ? 'Update Item' : 'Add Item')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CatalogPage
