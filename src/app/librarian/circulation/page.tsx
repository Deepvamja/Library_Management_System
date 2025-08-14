"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users, AlertTriangle, Clock, DollarSign, RotateCcw } from 'lucide-react'
import { IssueBookDialog } from './components/IssueBookDialog'
import { ReturnBookDialog } from './components/ReturnBookDialog'
import { ActiveTransactionsList } from './components/ActiveTransactionsList'
import { OverdueTransactionsList } from './components/OverdueTransactionsList'
import { getActiveTransactions, getOverdueTransactions } from './actions/circulation'

export default function CirculationPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [activeTransactions, setActiveTransactions] = useState<any[]>([])
  const [overdueTransactions, setOverdueTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    overdue: 0,
    dueSoon: 0,
    totalFines: 0
  })

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const [activeResult, overdueResult] = await Promise.all([
        getActiveTransactions(),
        getOverdueTransactions()
      ])

      if (activeResult.success) {
        setActiveTransactions(activeResult.transactions)
        
        // Calculate stats
        const dueSoon = activeResult.transactions.filter(t => 
          t.daysUntilDue <= 3 && t.daysUntilDue > 0
        ).length
        
        setStats(prev => ({
          ...prev,
          totalBorrowed: activeResult.transactions.length,
          dueSoon
        }))
      }

      if (overdueResult.success) {
        setOverdueTransactions(overdueResult.transactions)
        
        const totalFines = overdueResult.transactions.reduce(
          (sum, t) => sum + t.calculatedFine, 0
        )
        
        setStats(prev => ({
          ...prev,
          overdue: overdueResult.transactions.length,
          totalFines
        }))
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Circulation Management</h1>
        <p className="text-gray-600">Manage book borrowing, returns, renewals, and fines</p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => setIsIssueDialogOpen(true)} className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Issue Book
        </Button>
        <Button variant="outline" onClick={() => setIsReturnDialogOpen(true)} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Return Book
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBorrowed}</div>
            <p className="text-xs text-muted-foreground">Currently issued books</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Books past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">Due within 3 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalFines.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Outstanding fines</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Books ({stats.totalBorrowed})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest circulation activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={transaction.transactionId} className="flex items-center space-x-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.isOverdue ? 'bg-red-500' : 
                          transaction.daysUntilDue <= 3 ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <span className="font-medium">{transaction.item.title}</span>
                          <span className="text-gray-500 ml-2">
                            to {transaction.patron.patronFirstName} {transaction.patron.patronLastName}
                          </span>
                        </div>
                        <span className={`text-xs ${
                          transaction.isOverdue ? 'text-red-600' : 
                          transaction.daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {transaction.isOverdue ? 
                            `${Math.abs(transaction.daysUntilDue)} days overdue` :
                            `Due in ${transaction.daysUntilDue} days`
                          }
                        </span>
                      </div>
                    ))}
                    {activeTransactions.length === 0 && (
                      <p className="text-gray-500">No active transactions</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common circulation tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsIssueDialogOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Issue Book to Patron
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsReturnDialogOpen(true)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Accept Book Return
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('overdue')}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Overdue Items
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('active')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Active Books
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active">
          <ActiveTransactionsList 
            transactions={activeTransactions} 
            onUpdate={loadTransactions}
          />
        </TabsContent>

        <TabsContent value="overdue">
          <OverdueTransactionsList 
            transactions={overdueTransactions} 
            onUpdate={loadTransactions}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <IssueBookDialog 
        isOpen={isIssueDialogOpen} 
        onClose={() => setIsIssueDialogOpen(false)}
        onSuccess={loadTransactions}
      />
      
      <ReturnBookDialog 
        isOpen={isReturnDialogOpen} 
        onClose={() => setIsReturnDialogOpen(false)}
        onSuccess={loadTransactions}
      />
    </div>
  )
}
