'use server'

import prisma from '@/lib/prisma'

// Simple audit simulation - in a real system you'd have audit tables
export async function createInventoryAudit(data: {
  auditName: string
  description?: string
  scheduledDate: Date
}) {
  try {
    // For now, we'll just return a mock audit
    const audit = {
      auditId: Date.now(),
      auditName: data.auditName,
      description: data.description,
      scheduledDate: data.scheduledDate,
      status: 'SCHEDULED',
      createdAt: new Date()
    }

    return { success: true, audit }
  } catch (error) {
    console.error('Error creating inventory audit:', error)
    return { success: false, error: 'Failed to create inventory audit' }
  }
}

export async function getInventoryAudits() {
  try {
    // Mock audit data - in a real system this would come from audit tables
    const audits = [
      {
        auditId: 1,
        auditName: 'Monthly Inventory Check',
        description: 'Regular monthly inventory audit',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        _count: { auditItems: 150 }
      },
      {
        auditId: 2,
        auditName: 'Reference Section Audit',
        description: 'Audit of reference section items',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        _count: { auditItems: 45 }
      }
    ]

    return { success: true, audits }
  } catch (error) {
    console.error('Error fetching inventory audits:', error)
    return { success: false, error: 'Failed to fetch inventory audits' }
  }
}

// Mock implementation for audit start
export async function startInventoryAudit(auditId: number) {
  try {
    const items = await prisma.item.findMany({
      select: {
        itemId: true,
        title: true,
        author: true,
        isbn: true,
        totalCopies: true,
        availableCopies: true
      }
    })

    return { success: true, audit: { auditId, status: 'IN_PROGRESS' }, itemCount: items.length }
  } catch (error) {
    console.error('Error starting inventory audit:', error)
    return { success: false, error: 'Failed to start inventory audit' }
  }
}

// Report lost item with real database operations
export async function reportLostItem(itemId: number, data: {
  reportedBy: string
  description: string
  lastSeenLocation?: string
  estimatedValue?: number
}) {
  try {
    // Create the lost item record
    const lostItem = await prisma.lostDamagedItem.create({
      data: {
        type: 'LOST',
        reportedBy: data.reportedBy,
        description: data.description,
        lastSeenLocation: data.lastSeenLocation,
        estimatedValue: data.estimatedValue,
        status: 'REPORTED',
        itemId: itemId
      },
      include: {
        item: true
      }
    })

    // Update item availability
    await prisma.item.update({
      where: { itemId },
      data: {
        availableCopies: {
          decrement: 1
        }
      }
    })

    return { success: true, lostItem }
  } catch (error) {
    console.error('Error reporting lost item:', error)
    return { success: false, error: 'Failed to report lost item' }
  }
}

export async function reportDamagedItem(itemId: number, data: {
  reportedBy: string
  description: string
  damageLevel: 'MINOR' | 'MODERATE' | 'SEVERE'
  repairCost?: number
  repairable: boolean
}) {
  try {
    // Create the damaged item record
    const damagedItem = await prisma.lostDamagedItem.create({
      data: {
        type: 'DAMAGED',
        reportedBy: data.reportedBy,
        description: data.description,
        damageLevel: data.damageLevel,
        repairCost: data.repairCost,
        repairable: data.repairable,
        status: 'REPORTED',
        itemId: itemId
      },
      include: {
        item: true
      }
    })

    // If severely damaged or not repairable, reduce available copies
    if (data.damageLevel === 'SEVERE' || !data.repairable) {
      await prisma.item.update({
        where: { itemId },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      })
    }

    return { success: true, damagedItem }
  } catch (error) {
    console.error('Error reporting damaged item:', error)
    return { success: false, error: 'Failed to report damaged item' }
  }
}

// Get lost/damaged items from database
export async function getLostDamagedItems(type?: 'LOST' | 'DAMAGED') {
  try {
    const whereClause: any = {}
    if (type) {
      whereClause.type = type
    }

    const items = await prisma.lostDamagedItem.findMany({
      where: whereClause,
      include: {
        item: {
          select: {
            itemId: true,
            title: true,
            author: true,
            isbn: true,
            itemType: true
          }
        }
      },
      orderBy: {
        reportedAt: 'desc'
      }
    })

    return { success: true, items }
  } catch (error) {
    console.error('Error fetching lost/damaged items:', error)
    return { success: false, error: 'Failed to fetch lost/damaged items' }
  }
}

// Inventory statistics with real data
export async function getInventoryStats() {
  try {
    const totalItems = await prisma.item.count()
    const totalCopies = await prisma.item.aggregate({
      _sum: { totalCopies: true }
    })
    const availableCopies = await prisma.item.aggregate({
      _sum: { availableCopies: true }
    })
    
    // Get real lost/damaged counts
    const lostItems = await prisma.lostDamagedItem.count({
      where: { type: 'LOST' }
    })
    const damagedItems = await prisma.lostDamagedItem.count({
      where: { type: 'DAMAGED' }
    })

    const checkedOutItems = (totalCopies._sum.totalCopies || 0) - (availableCopies._sum.availableCopies || 0)

    return {
      success: true,
      stats: {
        totalItems,
        totalCopies: totalCopies._sum.totalCopies || 0,
        availableCopies: availableCopies._sum.availableCopies || 0,
        checkedOutItems,
        lostItems,
        damagedItems
      }
    }
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    return { success: false, error: 'Failed to fetch inventory statistics' }
  }
}


// Update status of lost/damaged item
export async function updateLostDamagedItemStatus(lostDamagedId: number, data: {
  status: string
  notes?: string
  updatedBy: string
}) {
  try {
    const updatedItem = await prisma.lostDamagedItem.update({
      where: { lostDamagedId },
      data: {
        status: data.status,
        // You could add a notes field to schema if needed
        // For now we'll just update the status
      },
      include: {
        item: {
          select: {
            itemId: true,
            title: true,
            author: true,
            isbn: true
          }
        }
      }
    })

    // If item is found or repaired, restore availability
    if (data.status === 'FOUND' || data.status === 'REPAIRED') {
      await prisma.item.update({
        where: { itemId: updatedItem.itemId },
        data: {
          availableCopies: {
            increment: 1
          }
        }
      })
    }

    return { success: true, updatedItem }
  } catch (error) {
    console.error('Error updating lost/damaged item status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

export async function searchInventoryItems(query: string) {
  try {
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        itemId: true,
        title: true,
        author: true,
        isbn: true,
        totalCopies: true,
        availableCopies: true,
        subject: true,
        itemType: true
      },
      orderBy: { title: 'asc' }
    })

    return { success: true, items }
  } catch (error) {
    console.error('Error searching inventory items:', error)
    return { success: false, error: 'Failed to search inventory items' }
  }
}
