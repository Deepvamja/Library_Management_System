"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportLostItem, reportDamagedItem } from '../actions/inventory'
import { getItems } from '../../catalog/actions/items'

interface ReportIssueDialogProps {
  isOpen: boolean
  onClose: () => void
  onReport: () => void
}

export function ReportIssueDialog({ isOpen, onClose, onReport }: ReportIssueDialogProps) {
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'LOST' as 'LOST' | 'DAMAGED',
    reportedBy: '',
    description: '',
    lastSeenLocation: '',
    estimatedValue: 0,
    damageLevel: 'MINOR' as 'MINOR' | 'MODERATE' | 'SEVERE',
    repairCost: 0,
    repairable: true
  })
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadItems()
    }
  }, [isOpen])

  const loadItems = async () => {
    try {
      setLoadingItems(true)
      const itemsData = await getItems()
      setItems(itemsData)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      if (!formData.itemId || !formData.reportedBy || !formData.description) {
        alert('Please fill in all required fields')
        return
      }

      let result
      if (formData.type === 'LOST') {
        result = await reportLostItem(parseInt(formData.itemId), {
          reportedBy: formData.reportedBy,
          description: formData.description,
          lastSeenLocation: formData.lastSeenLocation || undefined,
          estimatedValue: formData.estimatedValue || undefined
        })
      } else {
        result = await reportDamagedItem(parseInt(formData.itemId), {
          reportedBy: formData.reportedBy,
          description: formData.description,
          damageLevel: formData.damageLevel,
          repairCost: formData.repairCost || undefined,
          repairable: formData.repairable
        })
      }
      
      if (result.success) {
        onReport()
        onClose()
        // Reset form
        setFormData({
          itemId: '',
          type: 'LOST',
          reportedBy: '',
          description: '',
          lastSeenLocation: '',
          estimatedValue: 0,
          damageLevel: 'MINOR',
          repairCost: 0,
          repairable: true
        })
      } else {
        alert(result.error || 'Failed to report issue')
      }
    } catch (error) {
      console.error('Failed to report issue:', error)
      alert('An error occurred while reporting the issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Report Lost/Damaged Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <div>
            <Label htmlFor="itemId">Item *</Label>
            <Select value={formData.itemId} onValueChange={(value) => handleInputChange('itemId', value)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingItems ? "Loading items..." : "Select an item"} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.itemId} value={item.itemId.toString()}>
                    {item.title} by {item.author} {item.isbn ? `(${item.isbn})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Issue Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reportedBy">Reported By *</Label>
            <Input 
              value={formData.reportedBy} 
              onChange={(e) => handleInputChange('reportedBy', e.target.value)} 
              placeholder="Enter reporter name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input 
              value={formData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              placeholder="Describe the issue"
              required
            />
          </div>

          {formData.type === 'LOST' && (
            <>
              <div>
                <Label htmlFor="lastSeenLocation">Last Seen Location</Label>
                <Input 
                  value={formData.lastSeenLocation} 
                  onChange={(e) => handleInputChange('lastSeenLocation', e.target.value)} 
                  placeholder="Where was it last seen?"
                />
              </div>

              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.estimatedValue} 
                  onChange={(e) => handleInputChange('estimatedValue', parseFloat(e.target.value) || 0)} 
                  min="0"
                />
              </div>
            </>
          )}

          {formData.type === 'DAMAGED' && (
            <>
              <div>
                <Label htmlFor="damageLevel">Damage Level *</Label>
                <Select value={formData.damageLevel} onValueChange={(value) => handleInputChange('damageLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINOR">Minor</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="SEVERE">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="repairCost">Estimated Repair Cost ($)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.repairCost} 
                  onChange={(e) => handleInputChange('repairCost', parseFloat(e.target.value) || 0)} 
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="repairable"
                  checked={formData.repairable}
                  onChange={(e) => handleInputChange('repairable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="repairable">Item is repairable</Label>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex-shrink-0 gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.itemId || !formData.reportedBy || !formData.description} 
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Reporting...' : 'Report Issue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
