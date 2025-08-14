"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileBarChart, Calendar, CheckCircle } from 'lucide-react'

interface InventoryAuditsTabProps {
  onUpdate: () => void
}

export function InventoryAuditsTab({ onUpdate }: InventoryAuditsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Inventory Audits
          </CardTitle>
          <CardDescription>
            Schedule and manage inventory audits to ensure accurate item tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileBarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit System Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Full inventory audit functionality with barcode scanning and systematic checking will be available in the next update.
            </p>
            <Button disabled className="mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Audit
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Monthly Inventory Check</span>
                </div>
                <p className="text-sm text-gray-600">Last completed: 1 week ago</p>
                <p className="text-xs text-gray-500">150 items audited</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                  <span className="font-medium">Reference Section Audit</span>
                </div>
                <p className="text-sm text-gray-600">In progress</p>
                <p className="text-xs text-gray-500">45 items remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
