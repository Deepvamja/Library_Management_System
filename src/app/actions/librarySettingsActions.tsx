'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface LibrarySettingsData {
  borrowingLimit: number
  loanPeriodDays: number
  finePerDay: number
}

// Get current library settings
export async function getLibrarySettings() {
  try {
    const settings = await prisma.librarySettings.findFirst()
    
    if (!settings) {
      // If no settings exist, create default ones
      const defaultSettings = await prisma.librarySettings.create({
        data: {
          borrowingLimit: 5,
          loanPeriodDays: 14,
          finePerDay: 1.0
        }
      })
      return {
        success: true,
        data: {
          borrowingLimit: defaultSettings.borrowingLimit,
          loanPeriodDays: defaultSettings.loanPeriodDays,
          finePerDay: defaultSettings.finePerDay
        }
      }
    }
    
    return {
      success: true,
      data: {
        borrowingLimit: settings.borrowingLimit,
        loanPeriodDays: settings.loanPeriodDays,
        finePerDay: settings.finePerDay
      }
    }
  } catch (error) {
    console.error('Error fetching library settings:', error)
    return {
      success: false,
      error: 'Failed to fetch library settings'
    }
  }
}

// Update library settings
export async function updateLibrarySettings(
  settingsData: LibrarySettingsData,
  adminId?: number
) {
  try {
    const updatedSettings = await prisma.librarySettings.upsert({
      where: {
        librarySettingsId: 1
      },
      update: {
        borrowingLimit: Number(settingsData.borrowingLimit),
        loanPeriodDays: Number(settingsData.loanPeriodDays),
        finePerDay: Number(settingsData.finePerDay),
        updatedByAdminId: adminId || null
      },
      create: {
        librarySettingsId: 1,
        borrowingLimit: Number(settingsData.borrowingLimit),
        loanPeriodDays: Number(settingsData.loanPeriodDays),
        finePerDay: Number(settingsData.finePerDay),
        updatedByAdminId: adminId || null
      }
    })
    
    return {
      success: true,
      message: 'Library settings updated successfully',
      data: {
        borrowingLimit: updatedSettings.borrowingLimit,
        loanPeriodDays: updatedSettings.loanPeriodDays,
        finePerDay: updatedSettings.finePerDay
      }
    }
  } catch (error) {
    console.error('Error updating library settings:', error)
    return {
      success: false,
      error: 'Failed to update library settings'
    }
  }
}
