"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  User, 
  UserPlus, 
  Search, 
  Trash2, 
  Users, 
  GraduationCap, 
  Briefcase, 
  AlertTriangle,
  RefreshCw,
  Download,
  History,
  CreditCard
} from 'lucide-react'
import { RegisterPatronDialog } from './components/RegisterPatronDialog'
import { getAllPatrons, searchPatrons, getPatronStatistics, deletePatron } from './actions/patronManagement'

export default function LibrarianMembersPage() {
  const [patrons, setPatrons] = useState<any[]>([])
  const [filteredPatrons, setFilteredPatrons] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [libraryCardDialogOpen, setLibraryCardDialogOpen] = useState(false)
  const [selectedPatron, setSelectedPatron] = useState<any>(null)
  const [patronHistory, setPatronHistory] = useState<any[]>([])
  const [libraryCard, setLibraryCard] = useState<any>(null)
  const [generatingCard, setGeneratingCard] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, patrons])

  const loadData = async () => {
    try {
      setLoading(true)
      const [patronsResult, statsResult] = await Promise.all([
        getAllPatrons(),
        getPatronStatistics()
      ])

      if (patronsResult.success) {
        setPatrons(patronsResult.patrons)
        // Also update filteredPatrons if no search is active
        if (!searchQuery.trim()) {
          setFilteredPatrons(patronsResult.patrons)
        }
      }

      if (statsResult.success) {
        setStats(statsResult.stats)
      }
    } catch (error) {
      console.error('Error loading patron data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredPatrons(patrons)
      return
    }

    try {
      // Use client-side search for better performance and real-time results
      const filtered = patrons.filter(patron => 
        patron.patronFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patron.patronLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patron.patronEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patron.patronId?.toString().includes(searchQuery)
      )
      setFilteredPatrons(filtered)
    } catch (error) {
      console.error('Error searching patrons:', error)
      setFilteredPatrons(patrons)
    }
  }

  const handleViewHistory = (patron: any) => {
    setSelectedPatron(patron)
    setPatronHistory(patron.borrowedItems || [])
    setHistoryDialogOpen(true)
  }

  const handleGenerateLibraryCard = async (patron: any) => {
    setSelectedPatron(patron)
    setGeneratingCard(true)
    
    try {
      // Import generateLibraryCard from actions
      const { generateLibraryCard } = await import('./actions/patronManagement')
      const result = await generateLibraryCard(patron.patronId)
      
      if (result.success) {
        setLibraryCard(result.libraryCard)
        setLibraryCardDialogOpen(true)
      } else {
        alert(`Failed to generate library card: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating library card:', error)
      alert('An unexpected error occurred while generating the library card.')
    } finally {
      setGeneratingCard(false)
    }
  }

  const handleDeletePatron = async (patronId: number) => {
    const patron = patrons.find(p => p.patronId === patronId)
    if (!patron) return

    const patronName = `${patron.patronFirstName} ${patron.patronLastName}`
    const activeBorrows = patron.borrowedItems?.filter((item: any) => !item.isReturned).length || 0
    
    let confirmMessage = `Are you sure you want to delete patron "${patronName}"?\n\nThis action cannot be undone.`
    
    if (activeBorrows > 0) {
      alert(`Cannot delete patron "${patronName}" because they have ${activeBorrows} active borrowed item(s).\n\nPlease ensure all items are returned before deleting the patron.`)
      return
    }
    
    if (patron.borrowedItems && patron.borrowedItems.length > 0) {
      confirmMessage += `\n\nNote: This patron has borrowing history that will also be removed.`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const result = await deletePatron(patronId)
      if (result.success) {
        alert(`Patron "${patronName}" has been successfully deleted.`)
        loadData()
      } else {
        alert(`Failed to delete patron: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting patron:', error)
      alert('An unexpected error occurred while deleting the patron. Please try again.')
    }
  }

  const getPatronTypeDisplay = (patron: any) => {
    if (patron.isStudent) return { type: 'Student', variant: 'default' as const }
    if (patron.isFaculty) return { type: 'Faculty', variant: 'secondary' as const }
    return { type: 'General', variant: 'outline' as const }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Patron Management</h1>
        <p className="text-gray-600">Register new patrons, update information, view borrowing history, and issue library cards</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patrons</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatrons}</div>
              <p className="text-xs text-muted-foreground">Registered members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.students}</div>
              <p className="text-xs text-muted-foreground">{stats.faculty} faculty, {stats.general} general</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patrons</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.activePatrons}</div>
              <p className="text-xs text-muted-foreground">Currently borrowing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.patronsWithOverdueItems}</div>
              <p className="text-xs text-muted-foreground">Patrons with overdue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={() => setRegisterDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Register New Patron
          </Button>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patrons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patrons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Patrons</CardTitle>
          <CardDescription>
            {filteredPatrons.length} patron{filteredPatrons.length !== 1 ? 's' : ''} 
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading patrons...</span>
            </div>
          ) : filteredPatrons.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patrons found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No patrons match your search criteria.' : 'Get started by registering a new patron.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Borrows</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatrons.map((patron) => {
                    const patronType = getPatronTypeDisplay(patron)
                    return (
                      <TableRow key={patron.patronId}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{patron.patronFirstName} {patron.patronLastName}</p>
                            <p className="text-sm text-gray-500">ID: {patron.patronId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{patron.patronEmail}</TableCell>
                        <TableCell>
                          <Badge variant={patronType.variant}>{patronType.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{patron.borrowedItems?.length || 0}</span>
                            {patron.borrowedItems?.some((item: any) => !item.isReturned && new Date(item.dueDate) < new Date()) && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(patron.patronCreatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewHistory(patron)}
                              className="flex items-center gap-1 px-2 h-8 hover:bg-blue-50 hover:text-blue-600"
                              title="View borrowing history"
                            >
                              <History className="h-3 w-3" />
                              <span className="text-xs">History</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateLibraryCard(patron)}
                              disabled={generatingCard}
                              className="flex items-center gap-1 px-2 h-8 hover:bg-green-50 hover:text-green-600"
                              title="Generate library card"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span className="text-xs">Card</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePatron(patron.patronId)}
                              className="flex items-center gap-1 px-2 h-8 hover:bg-destructive hover:text-destructive-foreground"
                              title="Delete patron"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="text-xs">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RegisterPatronDialog 
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        onRegister={loadData}
      />
      
      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Borrowing History - {selectedPatron?.patronFirstName} {selectedPatron?.patronLastName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {patronHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No borrowing history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patronHistory.map((transaction: any) => (
                  <Card key={transaction.transactionId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{transaction.item?.title || 'Unknown Item'}</h4>
                        <p className="text-sm text-gray-600">by {transaction.item?.author || 'Unknown Author'}</p>
                        <div className="flex gap-4 text-sm text-gray-500 mt-2">
                          <span>Borrowed: {formatDate(transaction.borrowedAt)}</span>
                          {transaction.returnedAt && (
                            <span>Returned: {formatDate(transaction.returnedAt)}</span>
                          )}
                          {transaction.dueDate && (
                            <span>Due: {formatDate(transaction.dueDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={transaction.isReturned ? 'default' : 'secondary'}>
                          {transaction.isReturned ? 'Returned' : 'Active'}
                        </Badge>
                        {transaction.calculatedFine > 0 && (
                          <div className="text-sm text-red-600 font-medium mt-1">
                            Fine: ${transaction.calculatedFine.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Library Card Dialog */}
      <Dialog open={libraryCardDialogOpen} onOpenChange={setLibraryCardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Library Card - {selectedPatron?.patronFirstName} {selectedPatron?.patronLastName}
            </DialogTitle>
          </DialogHeader>
          
          {libraryCard && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold">University Library Card</h3>
                  <div className="text-2xl font-mono font-bold">
                    {libraryCard.cardNumber}
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{libraryCard.patronName}</p>
                    <p className="text-sm opacity-90">{libraryCard.patronType}</p>
                    <p className="text-sm opacity-90">{libraryCard.department}</p>
                  </div>
                  <div className="flex justify-center gap-6 text-xs opacity-90 pt-2 border-t border-white/20">
                    <span>Issued: {formatDate(libraryCard.issueDate)}</span>
                    <span>Expires: {formatDate(libraryCard.expiryDate)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLibraryCardDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
