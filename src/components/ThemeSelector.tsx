'use client'

import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Palette, 
  Sun, 
  Moon, 
  Waves, 
  Sunset, 
  TreePine, 
  Sparkles,
  Check,
  Monitor
} from 'lucide-react'

const themes = [
  { 
    name: 'light', 
    label: 'Light', 
    icon: Sun, 
    colors: ['bg-white', 'bg-gray-100', 'bg-blue-500'],
    description: 'Clean and bright'
  },
  { 
    name: 'dark', 
    label: 'Dark', 
    icon: Moon, 
    colors: ['bg-gray-900', 'bg-gray-800', 'bg-blue-400'],
    description: 'Easy on the eyes'
  },
  { 
    name: 'ocean', 
    label: 'Ocean', 
    icon: Waves, 
    colors: ['bg-slate-900', 'bg-cyan-900', 'bg-cyan-400'],
    description: 'Deep sea vibes'
  },
  { 
    name: 'sunset', 
    label: 'Sunset', 
    icon: Sunset, 
    colors: ['bg-orange-50', 'bg-orange-200', 'bg-orange-500'],
    description: 'Warm and cozy'
  },
  { 
    name: 'forest', 
    label: 'Forest', 
    icon: TreePine, 
    colors: ['bg-green-900', 'bg-green-800', 'bg-green-400'],
    description: 'Nature inspired'
  },
  { 
    name: 'lavender', 
    label: 'Lavender', 
    icon: Sparkles, 
    colors: ['bg-purple-50', 'bg-purple-200', 'bg-purple-500'],
    description: 'Soft and elegant'
  }
]

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
      >
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium capitalize">{theme}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Choose Theme
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Customize your dashboard appearance
              </p>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-3">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon
                const isSelected = theme === themeOption.name
                
                return (
                  <button
                    key={themeOption.name}
                    onClick={() => {
                      setTheme(themeOption.name as any)
                      setIsOpen(false)
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <span className={`font-medium text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {themeOption.label}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex space-x-1 mb-2">
                      {themeOption.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full ${color} border border-gray-200 dark:border-gray-600`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                      {themeOption.description}
                    </p>
                  </button>
                )
              })}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Monitor className="h-3 w-3" />
                <span>Theme preference is saved automatically</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
