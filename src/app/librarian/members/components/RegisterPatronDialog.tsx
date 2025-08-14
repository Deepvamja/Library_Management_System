"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerPatron } from '../actions/patronManagement'

interface RegisterPatronDialogProps {
  isOpen: boolean
  onClose: () => void
  onRegister: () => void
}

export function RegisterPatronDialog({ isOpen, onClose, onRegister }: RegisterPatronDialogProps) {
  const [formData, setFormData] = useState({
    patronFirstName: '',
    patronLastName: '',
    patronEmail: '',
    patronPassword: '',
    patronType: 'general' as 'student' | 'faculty' | 'general',
    // Student fields
    studentDepartment: '',
    studentSemester: '',
    studentRollNo: '',
    studentEnrollmentNumber: '',
    // Faculty fields
    facultyDepartment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }))
  }

  const resetForm = () => {
    setFormData({
      patronFirstName: '',
      patronLastName: '',
      patronEmail: '',
      patronPassword: '',
      patronType: 'general',
      studentDepartment: '',
      studentSemester: '',
      studentRollNo: '',
      studentEnrollmentNumber: '',
      facultyDepartment: ''
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      if (!formData.patronFirstName || !formData.patronLastName || !formData.patronEmail || !formData.patronPassword) {
        setError('Please fill in all required fields')
        return
      }

      // Generate a default password if not provided
      const password = formData.patronPassword || 'library123'

      const submitData: any = {
        patronFirstName: formData.patronFirstName,
        patronLastName: formData.patronLastName,
        patronEmail: formData.patronEmail,
        patronPassword: password,
        patronType: formData.patronType
      }

      if (formData.patronType === 'student') {
        submitData.studentDepartment = formData.studentDepartment
        submitData.studentSemester = formData.studentSemester ? parseInt(formData.studentSemester) : undefined
        submitData.studentRollNo = formData.studentRollNo ? parseInt(formData.studentRollNo) : undefined
        submitData.studentEnrollmentNumber = formData.studentEnrollmentNumber ? parseInt(formData.studentEnrollmentNumber) : undefined
      } else if (formData.patronType === 'faculty') {
        submitData.facultyDepartment = formData.facultyDepartment
      }

      const result = await registerPatron(submitData)
      
      if (result.success) {
        onRegister()
        onClose()
        resetForm()
      } else {
        setError(result.error || 'Failed to register patron')
      }
    } catch (error) {
      console.error('Failed to register patron:', error)
      setError('An error occurred while registering the patron')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Register New Patron</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patronFirstName">First Name *</Label>
              <Input
                id="patronFirstName"
                value={formData.patronFirstName}
                onChange={(e) => handleInputChange('patronFirstName', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="patronLastName">Last Name *</Label>
              <Input
                id="patronLastName"
                value={formData.patronLastName}
                onChange={(e) => handleInputChange('patronLastName', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="patronEmail">Email Address *</Label>
            <Input
              id="patronEmail"
              type="email"
              value={formData.patronEmail}
              onChange={(e) => handleInputChange('patronEmail', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <Label htmlFor="patronPassword">Temporary Password *</Label>
            <Input
              id="patronPassword"
              type="password"
              value={formData.patronPassword}
              onChange={(e) => handleInputChange('patronPassword', e.target.value)}
              placeholder="Enter temporary password"
              required
            />
          </div>

          <div>
            <Label htmlFor="patronType">Patron Type *</Label>
            <Select value={formData.patronType} onValueChange={(value) => handleInputChange('patronType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Patron</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.patronType === 'student' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentDepartment">Department</Label>
                  <Input
                    id="studentDepartment"
                    value={formData.studentDepartment}
                    onChange={(e) => handleInputChange('studentDepartment', e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="studentSemester">Semester</Label>
                  <Input
                    id="studentSemester"
                    type="number"
                    value={formData.studentSemester}
                    onChange={(e) => handleInputChange('studentSemester', e.target.value)}
                    placeholder="Enter semester"
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <Label htmlFor="studentRollNo">Roll Number</Label>
                  <Input
                    id="studentRollNo"
                    type="number"
                    value={formData.studentRollNo}
                    onChange={(e) => handleInputChange('studentRollNo', e.target.value)}
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <Label htmlFor="studentEnrollmentNumber">Enrollment Number</Label>
                  <Input
                    id="studentEnrollmentNumber"
                    type="number"
                    value={formData.studentEnrollmentNumber}
                    onChange={(e) => handleInputChange('studentEnrollmentNumber', e.target.value)}
                    placeholder="Enter enrollment number"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.patronType === 'faculty' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Faculty Information</h4>
              <div>
                <Label htmlFor="facultyDepartment">Department</Label>
                <Input
                  id="facultyDepartment"
                  value={formData.facultyDepartment}
                  onChange={(e) => handleInputChange('facultyDepartment', e.target.value)}
                  placeholder="Enter department"
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.patronFirstName || !formData.patronLastName || !formData.patronEmail}
          >
            {loading ? 'Registering...' : 'Register Patron'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
