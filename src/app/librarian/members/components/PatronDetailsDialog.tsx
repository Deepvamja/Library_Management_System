"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  CreditCard,
  Download,
  RefreshCw,
  Edit,
  Save,
  X,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle,
  IdCard
} from 'lucide-react'
import { getPatronDetails, generateLibraryCard, updatePatron } from '../actions/patronManagement'

interface PatronDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  patronId: number | null
  onUpdate: () => void
}

export function PatronDetailsDialog({ isOpen, onClose, patronId, onUpdate }: PatronDetailsDialogProps) {
  const [patron, setPatron] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [libraryCard, setLibraryCard] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [showLibraryCard, setShowLibraryCard] = useState(false)
  
  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [studentId, setStudentId] = useState('')
  const [program, setProgram] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')

  useEffect(() => {
    console.log('🔄 useEffect triggered - isOpen:', isOpen, 'patronId:', patronId)
    if (isOpen && patronId) {
      console.log('✅ Both isOpen and patronId are truthy, loading patron details...')
      loadPatronDetails()
    } else {
      console.log('❌ Not loading patron details - isOpen:', isOpen, 'patronId:', patronId)
      // Reset patron data when dialog closes or patronId is null
      if (!isOpen) {
        console.log('🧹 Resetting patron data because dialog is closed')
        setPatron(null)
        setLoading(false)
      }
    }
  }, [isOpen, patronId])

  useEffect(() => {
    if (patron) {
      setFirstName(patron.patronFirstName)
      setLastName(patron.patronLastName)
      setEmail(patron.patronEmail)
      setPhone('') // Not in schema, keep empty
      setAddress('') // Not in schema, keep empty
      // Map database fields to form fields
      setStudentId(patron.studentProfile?.studentEnrollmentNumber?.toString() || '')
      setProgram(patron.studentProfile?.studentDepartment || '')
      setYear(patron.studentProfile?.studentSemester || '')
      setEmployeeId(patron.studentProfile?.studentRollNo?.toString() || '')
      setDepartment(patron.facultyProfile?.facultyDepartment || '')
      setPosition('') // This field doesn't exist in schema, keep empty
    }
  }, [patron])

  const loadPatronDetails = async () => {
    if (!patronId) {
      console.log('❌ No patronId provided')
      return
    }
    
    console.log('🔄 Loading patron details for ID:', patronId)
    
    try {
      setLoading(true)
      setPatron(null) // Clear previous data
      
      const result = await getPatronDetails(patronId)
      console.log('📦 Server action result:', result)
      
      if (result?.success && result?.patron) {
        console.log('✅ Patron data loaded successfully!')
        console.log('👤 Patron:', result.patron.patronFirstName, result.patron.patronLastName)
        setPatron(result.patron)
      } else {
        console.error('❌ Failed to load patron details:', result?.error || 'Unknown error')
        console.error('📄 Full result:', result)
      }
    } catch (error) {
      console.error('💥 Error calling server action:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCard = async () => {
    if (!patronId) return
    
    try {
      setGenerating(true)
      const result = await generateLibraryCard(patronId)
      
      if (result.success) {
        setLibraryCard(result.libraryCard)
        setShowLibraryCard(true)
      } else {
        alert(`Failed to generate library card: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating library card:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!patron) return

    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('First name, last name, and email are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.')
      return
    }

    // Validate student-specific fields
    if (patron.isStudent) {
      if (!studentId.trim() || !program.trim() || !year) {
        alert('Student ID, program, and year are required for student patrons.')
        return
      }
      if (year < 1 || year > 10) {
        alert('Year must be between 1 and 10.')
        return
      }
    }

    // Validate faculty-specific fields
    if (patron.isFaculty) {
      if (!employeeId.trim() || !department.trim() || !position.trim()) {
        alert('Employee ID, department, and position are required for faculty patrons.')
        return
      }
    }

    try {
      setSaving(true)
      const result = await updatePatron(patron.patronId, {
        patronFirstName: firstName,
        patronLastName: lastName,
        patronEmail: email,
        studentProfile: patron.isStudent ? {
          studentId: studentId, // This will map to studentEnrollmentNumber in backend
          program: program,     // This will map to studentDepartment in backend  
          year: Number(year)    // This will map to studentSemester in backend
        } : null,
        facultyProfile: patron.isFaculty ? {
          department: department     // This will map to facultyDepartment in backend
        } : null
      })

      if (result.success) {
        setPatron(result.patron)
        setIsEditing(false)
        onUpdate()
        alert('Patron information updated successfully!')
      } else {
        alert(`Failed to update patron: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating patron:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPatronType = () => {
    if (patron?.isStudent) return 'Student'
    if (patron?.isFaculty) return 'Faculty'
    return 'General'
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'overdue': return 'destructive'
      case 'due-soon': return 'secondary'
      default: return 'default'
    }
  }

  const getItemStatus = (transaction: any) => {
    if (transaction.isReturned) return 'returned'
    
    const dueDate = new Date(transaction.dueDate)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 3) return 'due-soon'
    return 'active'
  }

  console.log('🎭 PatronDetailsDialog render - isOpen:', isOpen, 'patronId:', patronId, 'patron:', patron ? `${patron.patronFirstName} ${patron.patronLastName}` : null)
  
  if (!isOpen || !patronId) {
    console.log('🚫 PatronDetailsDialog returning null - isOpen:', isOpen, 'patronId:', patronId)
    return null
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {patron ? `${patron.patronFirstName} ${patron.patronLastName}` : 'Patron Details'}
            </DialogTitle>
          </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading patron details...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {patron ? (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="current">Current Items</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="library-card">Library Card</TabsTrigger>
                </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={patron.isStudent ? 'default' : patron.isFaculty ? 'secondary' : 'outline'}>
                      {getPatronType()}
                    </Badge>
                    <span className="text-sm text-gray-500">ID: {patron.patronId}</span>
                    <span className="text-sm text-gray-500">Member since {formatDate(patron.patronCreatedAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCard}
                      disabled={generating}
                      className="flex items-center gap-2"
                    >
                      <IdCard className="h-4 w-4" />
                      Generate Library Card
                    </Button>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false)
                            // Reset form values
                            setFirstName(patron.patronFirstName)
                            setLastName(patron.patronLastName)
                            setEmail(patron.patronEmail)
                            setPhone(patron.patronPhone || '')
                            setAddress(patron.patronAddress || '')
                          }}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">{patron.patronFirstName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">{patron.patronLastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{patron.patronEmail}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Phone</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Not available in current schema</span>
                        </div>
                      </div>

                      <div>
                        <Label>Address</Label>
                        <div className="mt-1 flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-500">Not available in current schema</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {patron.isStudent && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="studentId">Student ID</Label>
                          {isEditing ? (
                            <Input
                              id="studentId"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">{patron.studentProfile?.studentEnrollmentNumber || 'Not set'}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="program">Department</Label>
                          {isEditing ? (
                            <Input
                              id="program"
                              value={program}
                              onChange={(e) => setProgram(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">{patron.studentProfile?.studentDepartment || 'Not set'}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="year">Semester</Label>
                          {isEditing ? (
                            <Input
                              id="year"
                              type="number"
                              min="1"
                              max="10"
                              value={year}
                              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">Semester {patron.studentProfile?.studentSemester || 'Not set'}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {patron.isFaculty && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Faculty Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="employeeId">Employee ID</Label>
                          {isEditing ? (
                            <Input
                              id="employeeId"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">Not available in current schema</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="department">Department</Label>
                          {isEditing ? (
                            <Input
                              id="department"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              required
                            />
                          ) : (
                            <p className="mt-1 text-sm">{patron.facultyProfile?.facultyDepartment || 'Not set'}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="position">Position</Label>
                          {isEditing ? (
                            <Input
                              id="position"
                              value={position}
                              onChange={(e) => setPosition(e.target.value)}
                              placeholder="Not available in current schema"
                              disabled
                            />
                          ) : (
                            <p className="mt-1 text-sm">Not available in current schema</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Library Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {patron.borrowedItems?.filter((item: any) => !item.isReturned).length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Current Borrows</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {patron.borrowedItems?.filter((item: any) => !item.isReturned && item.isOverdue).length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Overdue Items</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {patron.borrowedItems?.length || 0}
                        </div>
                        <p className="text-sm text-gray-500">Total History</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="current" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Currently Borrowed Items
                    </CardTitle>
                    <CardDescription>
                      Items currently checked out to this patron
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patron.borrowedItems?.filter((item: any) => !item.isReturned).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No items currently borrowed</p>
                    ) : (
                      <div className="space-y-3">
                        {patron.borrowedItems
                          ?.filter((item: any) => !item.isReturned)
                          .map((transaction: any) => (
                            <div key={transaction.transactionId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{transaction.item.title}</h4>
                                <p className="text-sm text-gray-600">by {transaction.item.author}</p>
                                <p className="text-sm text-gray-500">
                                  Borrowed: {formatDate(transaction.borrowedAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={getBadgeVariant(getItemStatus(transaction))}>
                                  {getItemStatus(transaction) === 'overdue' && 'Overdue'}
                                  {getItemStatus(transaction) === 'due-soon' && 'Due Soon'}
                                  {getItemStatus(transaction) === 'active' && 'Active'}
                                </Badge>
                                <p className="text-sm text-gray-500 mt-1">
                                  Due: {formatDate(transaction.dueDate)}
                                </p>
                                {transaction.calculatedFine > 0 && (
                                  <p className="text-sm text-red-600 font-medium">
                                    Fine: ${transaction.calculatedFine.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {patron.reservations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Reservations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patron.reservations.map((reservation: any) => (
                          <div key={reservation.reservationId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{reservation.item.title}</h4>
                              <p className="text-sm text-gray-600">by {reservation.item.author}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">Reserved</Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(reservation.reservedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Borrowing History
                    </CardTitle>
                    <CardDescription>
                      Complete borrowing history for this patron
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patron.borrowedItems?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No borrowing history</p>
                    ) : (
                      <div className="space-y-3">
                        {patron.borrowedItems?.map((transaction: any) => (
                          <div key={transaction.transactionId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{transaction.item.title}</h4>
                              <p className="text-sm text-gray-600">by {transaction.item.author}</p>
                              <p className="text-sm text-gray-500">
                                Borrowed: {formatDate(transaction.borrowedAt)}
                                {transaction.returnedAt && ` • Returned: ${formatDate(transaction.returnedAt)}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={transaction.isReturned ? 'default' : getBadgeVariant(getItemStatus(transaction))}>
                                {transaction.isReturned ? 'Returned' : getItemStatus(transaction)}
                              </Badge>
                              {!transaction.isReturned && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Due: {formatDate(transaction.dueDate)}
                                </p>
                              )}
                              {transaction.calculatedFine > 0 && (
                                <p className="text-sm text-red-600 font-medium mt-1">
                                  Fine: ${transaction.calculatedFine.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="library-card" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Library Card
                    </CardTitle>
                    <CardDescription>
                      Generate and download library card for this patron
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleGenerateCard} disabled={generating} className="w-full">
                      {generating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Generate Library Card
                        </>
                      )}
                    </Button>

                    {libraryCard && (
                      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-bold">University Library Card</h3>
                          <div className="text-2xl font-mono font-bold text-blue-600">
                            {libraryCard.cardNumber}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{libraryCard.patronName}</p>
                            <p className="text-sm text-gray-600">{libraryCard.patronType}</p>
                            <p className="text-sm text-gray-600">{libraryCard.department}</p>
                            <div className="flex justify-center gap-4 text-xs text-gray-500 mt-4">
                              <span>Issued: {formatDate(libraryCard.issueDate)}</span>
                              <span>Expires: {formatDate(libraryCard.expiryDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Patron not found</p>
                <p className="text-sm text-gray-400 mt-2">Patron ID: {patronId}</p>
                <button 
                  onClick={loadPatronDetails}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        )}

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Library Card Dialog */}
      <Dialog open={showLibraryCard} onOpenChange={setShowLibraryCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Library Card
            </DialogTitle>
          </DialogHeader>

          {libraryCard && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Library Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm opacity-90">Card Number</p>
                    <p className="text-lg font-mono font-bold">{libraryCard.cardNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Patron Name</p>
                    <p className="font-semibold">{libraryCard.patronName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-90">Type</p>
                      <p className="font-medium">{libraryCard.patronType}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Issued</p>
                      <p className="font-medium">{formatDate(libraryCard.issueDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Valid Until</p>
                    <p className="font-medium">{formatDate(libraryCard.expiryDate)}</p>
                  </div>
                  <div className="text-center pt-2 border-t border-white/20">
                    <p className="text-xs font-mono">{libraryCard.barcode}</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLibraryCard(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <IdCard className="h-4 w-4" />
                  Print Card
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
