'use client'

import React, { useState } from 'react'
import { X, ShoppingCart, AlertCircle, Check } from 'lucide-react'
import { createPurchaseRequest } from '../../actions/patronActions'

interface PurchaseRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  patronId: number
  selectedItem?: {
    title: string
    author: string
    isbn?: string
    subject?: string
    itemType: string
    price: number
  } | null
}

const PurchaseRequestDialog: React.FC<PurchaseRequestDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  patronId,
  selectedItem 
}) => {
  const [formData, setFormData] = useState({
    title: selectedItem?.title || '',
    author: selectedItem?.author || '',
    isbn: selectedItem?.isbn || '',
    subject: selectedItem?.subject || '',
    itemType: selectedItem?.itemType || '',
    justification: '',
    urgency: 'NORMAL',
    estimatedPrice: selectedItem?.price || '',
    preferredVendor: '',
    additionalNotes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author || !formData.justification) {
      setErrorMessage('Please fill in all required fields')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const result = await createPurchaseRequest(patronId, {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || undefined,
        subject: formData.subject || undefined,
        itemType: formData.itemType,
        justification: formData.justification,
        urgency: formData.urgency,
        estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice.toString()) : undefined,
        preferredVendor: formData.preferredVendor || undefined,
        additionalNotes: formData.additionalNotes || undefined
      })

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
          resetForm()
          if (onSuccess) {
            onSuccess()
          }
        }, 2000)
      } else {
        setErrorMessage(result.error || 'Failed to submit request')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Purchase request error:', error)
      setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      subject: '',
      itemType: '',
      justification: '',
      urgency: 'NORMAL',
      estimatedPrice: '',
      preferredVendor: '',
      additionalNotes: ''
    })
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Request Item Purchase</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  Purchase request submitted successfully! The library staff will review your request.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item title"
                  />
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ISBN (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-1">
                    Item Type *
                  </label>
                  <select
                    id="itemType"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select item type</option>
                    <option value="Book">Book</option>
                    <option value="Journal">Journal</option>
                    <option value="Magazine">Magazine</option>
                    <option value="E-Book">E-Book</option>
                    <option value="DVD">DVD</option>
                    <option value="CD">CD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject area"
                  />
                </div>

                <div>
                  <label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="estimatedPrice"
                    name="estimatedPrice"
                    value={formData.estimatedPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
              
              <div className="mb-4">
                <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1">
                  Justification *
                </label>
                <textarea
                  id="justification"
                  name="justification"
                  value={formData.justification}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please explain why you need this item and how it will support your academic/research work..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredVendor" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Vendor
                  </label>
                  <input
                    type="text"
                    id="preferredVendor"
                    name="preferredVendor"
                    value={formData.preferredVendor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Amazon, Barnes & Noble (optional)"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information that might help with the purchase..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || submitStatus === 'success'}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseRequestDialog
