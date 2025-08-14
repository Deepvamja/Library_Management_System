'use client'

import React, { useState } from 'react'
import { Search, Book, User, History, Clock, Settings, BookOpen, AlertCircle, LogOut } from 'lucide-react'
import SearchBrowse from './components/SearchBrowse'
import ItemDetails from './components/ItemDetails'
import AccountManagement from './components/AccountManagement'
import ReserveHold from './components/ReserveHold'
import ProfileManagement from './components/ProfileManagement'
import PatronQuickStats from './components/PatronQuickStats'
import { SessionPayload } from '../../lib/session'
import { logout } from '../actions/logoutAction'

interface Item {
  itemId: number
  title: string
  author: string
  isbn?: string
  subject?: string
  keywords?: string
  itemType: string
  price: number
  imageUrl?: string
  totalCopies: number
  availableCopies: number
  isVisible: boolean
}

interface PatronPageClientProps {
  session: SessionPayload
}

export default function PatronPageClient({ session }: PatronPageClientProps) {
  const [activeModule, setActiveModule] = useState('search')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const modules = [
    { id: 'search', name: 'Search & Browse', icon: Search, component: SearchBrowse },
    { id: 'account', name: 'Account Management', icon: User, component: AccountManagement },
    { id: 'reserve', name: 'Reserve/Hold Items', icon: Clock, component: ReserveHold },
    { id: 'profile', name: 'Profile Management', icon: Settings, component: ProfileManagement },
  ]

  const renderActiveComponent = () => {
    if (activeModule === 'details' && selectedItem) {
      return <ItemDetails 
        selectedItem={selectedItem} 
        setSelectedItem={setSelectedItem} 
        setActiveModule={setActiveModule}
        patronId={session.userId}
      />
    }
    
    // Pass patronId to ProfileManagement component
    if (activeModule === 'profile') {
      return <ProfileManagement 
        patronId={session.userId}
      />
    }
    
    // Pass patronId to AccountManagement component
    if (activeModule === 'account') {
      return <AccountManagement 
        patronId={session.userId}
      />
    }
    
    // Pass patronId to ReserveHold component
    if (activeModule === 'reserve') {
      return <ReserveHold 
        patronId={session.userId}
        setSelectedItem={setSelectedItem}
        setActiveModule={setActiveModule}
      />
    }
    
    // Pass patronId to SearchBrowse component
    if (activeModule === 'search') {
      return <SearchBrowse 
        setSelectedItem={setSelectedItem}
        setActiveModule={setActiveModule}
        patronId={session.userId}
      />
    }
    
    const ActiveComponent = modules.find(m => m.id === activeModule)?.component || SearchBrowse
    
    return <ActiveComponent 
      setSelectedItem={setSelectedItem}
      setActiveModule={setActiveModule}
    />
  }

  const handleLogout = async () => {
    await logout()
  }

  const userDisplayName = `${session.firstName} ${session.lastName}`
  const userTypeDisplay = session.userType === 'student' ? 'Student' : 'Faculty'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Patron Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-600">Welcome, {userDisplayName}</span>
                <p className="text-xs text-gray-500">{userTypeDisplay} • {session.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {session.firstName.charAt(0)}{session.lastName.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules</h2>
              <ul className="space-y-2">
                {modules.map((module) => {
                  const Icon = module.icon
                  return (
                    <li key={module.id}>
                      <button
                        onClick={() => setActiveModule(module.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                          activeModule === module.id
                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{module.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>


            {/* Quick Stats */}
            <PatronQuickStats patronId={session.userId} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
