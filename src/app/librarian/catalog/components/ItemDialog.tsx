"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addItem, updateItem } from '../actions/items'

interface ItemDialogProps {
  item?: any; // Type can be more specific based on actual use (e.g., Item type)
  isOpen: boolean;
  onClose: () => void;
  onAddOrUpdate: () => void;
}

export function ItemDialog({ item, isOpen, onClose, onAddOrUpdate }: ItemDialogProps) {
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
  });
  const [loading, setLoading] = useState(false)

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        author: item.author || '',
        isbn: item.isbn || '',
        subject: item.subject || '',
        keywords: item.keywords || '',
        itemType: item.itemType || 'Book',
        price: item.price || 0,
        totalCopies: item.totalCopies || 1,
        availableCopies: item.availableCopies || 1,
      })
    } else {
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
      })
    }
  }, [item, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      let result
      if (item?.itemId) {
        result = await updateItem(item.itemId, formData)
      } else {
        result = await addItem({
          ...formData,
          availableCopies: formData.totalCopies // Set available copies equal to total copies for new items
        })
      }
      
      if (result.success) {
        onAddOrUpdate()
        onClose()
      } else {
        alert(result.error || 'Failed to save item')
      }
    } catch (error) {
      console.error('Failed to add/update item', error)
      alert('An error occurred while saving the item')
    } finally {
      setLoading(false)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{item?.itemId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <Input 
              value={formData.keywords} 
              onChange={handleInputChange} 
              name="keywords" 
              placeholder="Enter keywords (comma separated)"
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
        </div>
        <DialogFooter className="flex-shrink-0 gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.title || !formData.author} className="flex-1 sm:flex-none">
            {loading ? 'Saving...' : (item?.itemId ? 'Update Item' : 'Add Item')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
