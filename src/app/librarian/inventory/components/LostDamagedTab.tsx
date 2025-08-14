"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Search, Plus, RefreshCw } from 'lucide-react'
import { ReportIssueDialog } from './ReportIssueDialog'
import { UpdateStatusDialog } from './UpdateStatusDialog'
import { getLostDamagedItems } from '../actions/inventory'

interface LostDamagedTabProps {
  onUpdate: () => void
}

export function LostDamagedTab({ onUpdate }: LostDamagedTabProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const result = await getLostDamagedItems()
      if (result.success) {
        setItems(result.items)
      }
    } catch (error) {
      console.error('Error loading lost/damaged items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportIssue = () => {
    setReportDialogOpen(true)
  }

  const handleUpdateStatus = (item: any) => {
    setSelectedItem({
      id: item.lostDamagedId,
      type: item.type,
      title: item.item?.title || 'Unknown Item',
      author: item.item?.author || 'Unknown Author',
      status: item.status
    })
    setUpdateDialogOpen(true)
  }

  const handleDialogClose = () => {
    setReportDialogOpen(false)
    setUpdateDialogOpen(false)
    setSelectedItem(null)
  }

  const handleItemUpdate = () => {
    loadItems()
    onUpdate()
  }

  const filteredItems = items.filter(item => 
    !searchQuery || 
    item.item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item?.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Lost & Damaged Items
          </CardTitle>
          <CardDescription>
            Track and manage lost or damaged library materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <Button size="sm" onClick={handleReportIssue}>
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No items match your search criteria.' : 'No lost or damaged items have been reported yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.lostDamagedId} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.type === 'LOST' ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{item.item?.title || 'Unknown Item'}</h4>
                        <p className="text-sm text-gray-600">by {item.item?.author || 'Unknown Author'}</p>
                        {item.item?.isbn && (
                          <p className="text-sm text-gray-500 font-mono">{item.item.isbn}</p>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-gray-600">{item.description}</p>
                        <p className="text-gray-500 mt-1">
                          Reported by {item.reportedBy} • {new Date(item.reportedAt).toLocaleDateString()}
                        </p>
                        {item.damageLevel && (
                          <p className="text-gray-500">
                            Damage Level: <span className="capitalize font-medium">{item.damageLevel.toLowerCase()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(item)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Summary</span>
            </div>
            <p className="text-sm text-orange-700">
              {filteredItems.length} items currently tracked • 
              {filteredItems.filter(item => item.type === 'LOST').length} lost items • 
              {filteredItems.filter(item => item.type === 'DAMAGED').length} damaged items
            </p>
          </div>
        </CardContent>
      </Card>

      <ReportIssueDialog 
        isOpen={reportDialogOpen}
        onClose={handleDialogClose}
        onReport={handleItemUpdate}
      />
      
      <UpdateStatusDialog 
        isOpen={updateDialogOpen}
        onClose={handleDialogClose}
        onUpdate={handleItemUpdate}
        item={selectedItem}
      />
    </div>
  )
}
