"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateLostDamagedItemStatus } from '../actions/inventory'

interface UpdateStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  item: {
    id: number
    type: string
    title: string
    author: string
    status: string
  } | null
}

export function UpdateStatusDialog({ isOpen, onClose, onUpdate, item }: UpdateStatusDialogProps) {
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    updatedBy: ''
  })
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (item && isOpen) {
      setFormData({
        status: item.status,
        notes: '',
        updatedBy: ''
      })
    }
  }, [item, isOpen])

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      if (!formData.status || !formData.updatedBy) {
        alert('Please fill in all required fields')
        return
      }

      if (!item?.id) {
        alert('No item selected')
        return
      }

      const result = await updateLostDamagedItemStatus(item.id, {
        status: formData.status,
        notes: formData.notes,
        updatedBy: formData.updatedBy
      })
      
      if (result.success) {
        alert(`Status updated successfully for "${item?.title}"`)
        onUpdate()
        onClose()
        
        // Reset form
        setFormData({
          status: '',
          notes: '',
          updatedBy: ''
        })
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('An error occurred while updating the status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusOptions = () => {
    const commonOptions = [
      { value: 'REPORTED', label: 'Reported' },
      { value: 'INVESTIGATING', label: 'Investigating' },
      { value: 'RESOLVED', label: 'Resolved' },
      { value: 'CLOSED', label: 'Closed' }
    ]

    if (item?.type === 'LOST') {
      return [
        ...commonOptions,
        { value: 'FOUND', label: 'Found' },
        { value: 'REPLACED', label: 'Replaced' }
      ]
    } else if (item?.type === 'DAMAGED') {
      return [
        ...commonOptions,
        { value: 'UNDER_REPAIR', label: 'Under Repair' },
        { value: 'REPAIRED', label: 'Repaired' },
        { value: 'IRREPARABLE', label: 'Irreparable' },
        { value: 'REPLACED', label: 'Replaced' }
      ]
    }

    return commonOptions
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Status - {item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-gray-600">by {item.author}</p>
              <p className="text-gray-600">Type: <span className="capitalize">{item.type.toLowerCase()}</span></p>
              <p className="text-gray-600">Current Status: <span className="font-medium">{item.status}</span></p>
            </div>
          </div>

          <div>
            <Label htmlFor="status">New Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="updatedBy">Updated By *</Label>
            <Input 
              value={formData.updatedBy} 
              onChange={(e) => handleInputChange('updatedBy', e.target.value)} 
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input 
              value={formData.notes} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              placeholder="Add any additional notes (optional)"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.status || !formData.updatedBy}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
